import { Link } from 'react-router-dom'
import { useIndicadores } from '../lib/indicadores'
import { periodosMaternidad } from '../lib/empleo'
import { subsidioLicencia } from '../lib/laboral'
import { AFPS } from '../lib/sueldo'
import { formatCLP, toISODate, fromISODate } from '../lib/format'
import { Field, NumberInput, Segmented, ResultTable, Note } from '../components/ui'
import { useResult } from '../components/ux'
import { useUrlState } from '../lib/useUrlState'
import { useShareText } from '../lib/share'

const fmt = (d) => d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
const enSemanas = (dias) => `${dias % 7 ? `${dias} días` : `${dias / 7} semanas`}`

function enTresMeses() {
  const d = new Date()
  d.setMonth(d.getMonth() + 3)
  return toISODate(d)
}

export default function PrePostnatal() {
  const { get } = useIndicadores()
  const uf = get('uf')
  const [fpp, setFpp] = useUrlState('fpp', enTresMeses())
  const [parto, setParto] = useUrlState('parto', '')
  const [especial, setEspecial] = useUrlState('especial', false)
  const [parental, setParental] = useUrlState('parental', 'completa')
  const [sueldo, setSueldo] = useUrlState('sueldo', 1_000_000)

  const r = fpp ? periodosMaternidad({ fpp: fromISODate(fpp), parto: parto ? fromISODate(parto) : null, especial, parental }) : null

  // Subsidio: promedio de la remuneración neta (sin días de carencia). El postnatal parental tiene tope de 66 UF brutas.
  const base = { comisionAFP: AFPS[1].comision, uf, dias: 30 }
  const diario = subsidioLicencia({ ...base, remuneraciones: [sueldo, sueldo, sueldo] }).diario
  const diarioParental = subsidioLicencia({ ...base, remuneraciones: Array(3).fill(Math.min(sueldo, 66 * uf)) }).diario * (parental === 'media' ? 0.5 : 1)

  const periodos = r
    ? [
        { id: 'pre', nombre: 'Prenatal', ...r.prenatal, color: 'var(--cat-calendario)', subsidio: diario * r.prenatal.dias },
        { id: 'post', nombre: 'Postnatal', ...r.postnatal, color: 'var(--accent)', subsidio: diario * r.postnatal.dias },
        {
          id: 'parental',
          nombre: `Postnatal parental${parental === 'media' ? ' (media jornada)' : ''}`,
          ...r.parental,
          color: 'var(--cat-dinero)',
          subsidio: diarioParental * r.parental.dias,
        },
      ]
    : []
  const totalDias = periodos.reduce((a, p) => a + p.dias, 0)

  useResult('Vuelta al trabajo', r ? r.vuelta.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }) : null)
  useShareText(r ? `Mi prenatal empieza el ${fmt(r.prenatal.desde)} y vuelvo al trabajo el ${fmt(r.vuelta)}` : null)

  return (
    <>
      <div className="card">
        <div className="form-grid">
          <Field label="Fecha probable de parto">
            {(id) => <input id={id} type="date" value={fpp} onChange={(e) => setFpp(e.target.value)} />}
          </Field>
          <Field label="Fecha real del parto" hint="Opcional: si ya nació">
            {(id) => <input id={id} type="date" value={parto} onChange={(e) => setParto(e.target.value)} />}
          </Field>
          <Field label="Sueldo bruto imponible" hint="Para estimar el subsidio">
            {(id) => <NumberInput id={id} value={sueldo} onChange={setSueldo} prefix="$" />}
          </Field>
        </div>
        <p className="field-label">Postnatal parental</p>
        <Segmented
          label="Modalidad del postnatal parental"
          value={parental}
          onChange={setParental}
          options={[
            { value: 'completa', label: '12 semanas jornada completa' },
            { value: 'media', label: '18 semanas media jornada' },
          ]}
        />
        <label className="checkbox">
          <input type="checkbox" checked={especial} onChange={(e) => setEspecial(e.target.checked)} />
          <span>Parto antes de la semana 33 o bebé de menos de 1.500 gramos (postnatal de 18 semanas)</span>
        </label>
      </div>

      {r && (
        <>
          <div className="card result">
            <div className="big-result">
              <span>Vuelves al trabajo el</span>
              <strong className="capitalize text-strong">{fmt(r.vuelta)}</strong>
              <small>{Math.round(totalDias / 7)} semanas en total de permiso</small>
            </div>
            <div className="timeline" aria-hidden="true">
              {periodos.map((p) => (
                <span key={p.id} style={{ flex: p.dias, background: p.color }} title={`${p.nombre}: ${p.dias} días`} />
              ))}
            </div>
            <ul className="period-list">
              {periodos.map((p) => (
                <li key={p.id}>
                  <i style={{ background: p.color }} />
                  <div>
                    <strong>{p.nombre}</strong>
                    <span>
                      {fmt(p.desde)} al {fmt(p.hasta)} · {enSemanas(p.dias)}
                    </span>
                  </div>
                  <span className="period-amount">{formatCLP(p.subsidio)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h2>Subsidio estimado</h2>
            <ResultTable
              rows={[
                { label: 'Subsidio diario (pre y postnatal)', value: formatCLP(diario) },
                { label: `Subsidio diario postnatal parental${parental === 'media' ? ' (50%)' : ''}`, value: formatCLP(diarioParental) },
                { label: 'Total estimado del período', value: formatCLP(periodos.reduce((a, p) => a + p.subsidio, 0)), strong: true },
              ]}
            />
            <p className="muted small">
              Se calcula como en una <Link to="/licencia-medica/">licencia médica</Link>, sin días de carencia. El postnatal
              parental tiene un tope de 66 UF brutas al mes.
            </p>
          </div>
        </>
      )}

      <Note>
        Según el Código del Trabajo: prenatal de 6 semanas antes del parto, postnatal de 12 semanas después (18 si es
        prematuro o de bajo peso; también aumenta en partos múltiples) y postnatal parental de 12 semanas, o de 18 a media
        jornada. La madre puede traspasar al padre hasta 6 semanas del postnatal parental (o 12 a media jornada). Si el parto
        es antes de lo esperado, los días de prenatal no usados se suman al postnatal. El subsidio lo paga Fonasa (COMPIN o
        caja de compensación) o la Isapre. Estimación referencial.
      </Note>
    </>
  )
}
