import { useIndicadores } from '../lib/indicadores'
import { CAUSALES, calcularFiniquito } from '../lib/finiquito'
import { formatCLP, formatNum, toISODate, fromISODate } from '../lib/format'
import { Field, NumberInput, ResultTable, Note } from '../components/ui'
import { useUrlState } from '../lib/useUrlState'
import { useShareText } from '../lib/share'

const plural = (n, s, p) => `${n} ${n === 1 ? s : p}`

export default function Finiquito() {
  const { get } = useIndicadores()
  const uf = get('uf')

  const [inicio, setInicio] = useUrlState('inicio', '2021-03-01')
  const [termino, setTermino] = useUrlState('termino', toISODate(new Date()))
  const [sueldo, setSueldo] = useUrlState('sueldo', 1_000_000)
  const [causal, setCausal] = useUrlState('causal', 'necesidades')
  const [avisoDado, setAvisoDado] = useUrlState('aviso', false)
  const [pendientes, setPendientes] = useUrlState('pendientes', 0)
  const [diasMes, setDiasMes] = useUrlState('dias', 0)

  const valido = inicio && termino && inicio < termino
  const c = CAUSALES.find((x) => x.id === causal) ?? CAUSALES[0]
  const r = valido
    ? calcularFiniquito({
        inicio: fromISODate(inicio),
        termino: fromISODate(termino),
        sueldo,
        causal: c.id,
        avisoDado,
        vacacionesPendientes: pendientes,
        diasTrabajadosMes: diasMes,
        uf,
      })
    : null

  useShareText(r ? `Mi finiquito estimado es ${formatCLP(r.total)}` : null)

  return (
    <>
      <div className="card">
        <div className="form-grid">
          <Field label="Fecha de inicio del contrato">
            {(id) => <input id={id} type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />}
          </Field>
          <Field label="Fecha de término">
            {(id) => <input id={id} type="date" value={termino} onChange={(e) => setTermino(e.target.value)} />}
          </Field>
          <Field label="Última remuneración mensual" hint="Sueldo base + gratificación + bonos fijos + colación y movilización">
            {(id) => <NumberInput id={id} value={sueldo} onChange={setSueldo} prefix="$" />}
          </Field>
          <Field label="Causal de término">
            {(id) => (
              <select id={id} value={c.id} onChange={(e) => setCausal(e.target.value)}>
                {CAUSALES.map((x) => (
                  <option key={x.id} value={x.id}>{x.label}</option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Vacaciones pendientes de años anteriores" hint="Días hábiles no tomados">
            {(id) => <NumberInput id={id} value={pendientes} onChange={setPendientes} suffix="días" decimals={2} />}
          </Field>
          <Field label="Días trabajados del último mes sin pagar">
            {(id) => <NumberInput id={id} value={diasMes} onChange={setDiasMes} suffix="días" />}
          </Field>
        </div>
        {c.indemniza && (
          <label className="checkbox">
            <input type="checkbox" checked={avisoDado} onChange={(e) => setAvisoDado(e.target.checked)} />
            Me avisaron con 30 o más días de anticipación
          </label>
        )}
      </div>

      {!valido && <Note>La fecha de término debe ser posterior a la de inicio.</Note>}

      {r && (
        <div className="card result">
          <div className="big-result">
            <span>Total estimado del finiquito</span>
            <strong>{formatCLP(r.total)}</strong>
            <small>
              Antigüedad: {plural(r.antiguedad.anios, 'año', 'años')}, {plural(r.antiguedad.meses, 'mes', 'meses')} y{' '}
              {plural(r.antiguedad.dias, 'día', 'días')}
            </small>
          </div>
          <ResultTable
            rows={[
              c.indemniza && {
                label: `Indemnización por años de servicio (${plural(r.aniosIndemnizacion, 'año', 'años')})`,
                value: formatCLP(r.indemnizacion),
              },
              c.indemniza && { label: 'Indemnización sustitutiva del aviso previo', value: formatCLP(r.aviso) },
              {
                label: `Vacaciones: ${formatNum(r.habilesTotal, 2)} días hábiles = ${formatNum(r.corridos, 2)} días corridos`,
                value: formatCLP(r.vacaciones),
              },
              diasMes > 0 && { label: `Remuneración de ${plural(diasMes, 'día', 'días')} trabajados`, value: formatCLP(r.sueldoPendiente) },
              { label: 'Total', value: formatCLP(r.total), strong: true },
            ]}
          />
          {r.topado && (
            <p className="muted small">
              Las indemnizaciones se calculan con el tope legal de 90 UF ({formatCLP(90 * uf)}) por mes.
            </p>
          )}
        </div>
      )}

      <Note>
        Cálculo referencial según el Código del Trabajo: la indemnización por años de servicio equivale a 30 días de la
        última remuneración por año trabajado (la fracción superior a 6 meses cuenta como año), con tope de 11 años y de 90
        UF mensuales, y solo corresponde con al menos un año de antigüedad. Las vacaciones proporcionales suman 1,25 días
        hábiles por mes desde el último aniversario del contrato y se pagan en días corridos. No incluye vacaciones
        progresivas, descuentos por préstamos ni el recargo de 30% a 100% si un juez declara injustificado el despido. Las
        indemnizaciones y las vacaciones no pagan impuesto ni cotizaciones. Ante dudas, consulta a la Dirección del Trabajo.
      </Note>
    </>
  )
}
