import { useIndicadores } from '../lib/indicadores'
import { AFPS, calcularLiquido } from '../lib/sueldo'
import { subsidioLicencia } from '../lib/laboral'
import { formatCLP, formatNum } from '../lib/format'
import { Field, NumberInput, ResultTable, Note, Segmented } from '../components/ui'
import { useUrlState } from '../lib/useUrlState'
import { useShareText } from '../lib/share'
import { useResult, Presets, Term } from '../components/ux'

export default function LicenciaMedica() {
  const { get } = useIndicadores()
  const uf = get('uf')
  const utm = get('utm')
  const [modo, setModo] = useUrlState('modo', 'fijo')
  const [sueldo, setSueldo] = useUrlState('sueldo', 1_000_000)
  const [m1, setM1] = useUrlState('m1', 1_000_000)
  const [m2, setM2] = useUrlState('m2', 1_000_000)
  const [m3, setM3] = useUrlState('m3', 1_000_000)
  const [dias, setDias] = useUrlState('dias', 7)
  const [afp, setAfp] = useUrlState('afp', 'Modelo')
  const [contrato, setContrato] = useUrlState('contrato', 'indefinido')

  const comisionAFP = AFPS.find((a) => a.name === afp)?.comision ?? AFPS[1].comision
  const remuneraciones = modo === 'fijo' ? [sueldo, sueldo, sueldo] : [m1, m2, m3]
  const d = Math.max(1, Math.min(365, dias || 1))
  const r = subsidioLicencia({ remuneraciones, dias: d, comisionAFP, contrato, uf })

  // Comparación con lo que recibiría trabajando esos días (sueldo líquido proporcional)
  const promedio = remuneraciones.reduce((a, b) => a + b, 0) / 3
  const liquidoMes = calcularLiquido({ imponible: promedio, comisionAFP, contrato, uf, utm }).liquido
  const trabajando = (liquidoMes / 30) * d

  useShareText(`Por una licencia médica de ${d} días recibo ${formatCLP(r.total)} de subsidio`)

  useResult('Subsidio total', formatCLP(r.total))

  return (
    <>
      <div className="card">
        <Segmented
          label="Tipo de remuneración"
          value={modo}
          onChange={setModo}
          options={[
            { value: 'fijo', label: 'Sueldo fijo' },
            { value: 'variable', label: 'Sueldo variable (3 meses)' },
          ]}
        />
        <div className="form-grid">
          {modo === 'fijo' ? (
            <Field label="Sueldo bruto imponible mensual">
              {(id) => <NumberInput id={id} value={sueldo} onChange={setSueldo} prefix="$" />}
            </Field>
          ) : (
            <>
              {[
                [m1, setM1, 'Hace 3 meses'],
                [m2, setM2, 'Hace 2 meses'],
                [m3, setM3, 'Mes anterior'],
              ].map(([v, set, label]) => (
                <Field key={label} label={`${label} (imponible)`}>
                  {(id) => <NumberInput id={id} value={v} onChange={set} prefix="$" />}
                </Field>
              ))}
            </>
          )}
          <Field label="Días de licencia">
            {(id) => (
              <>
                <NumberInput id={id} value={dias} onChange={setDias} suffix="días" />
                <Presets value={dias} onChange={setDias} options={[3, 7, 10, 15, 30].map((v) => ({ label: `${v} días`, value: v }))} />
              </>
            )}
          </Field>
          <Field label="AFP">
            {(id) => (
              <select id={id} value={afp} onChange={(e) => setAfp(e.target.value)}>
                {AFPS.map((a) => (
                  <option key={a.name} value={a.name}>{a.name}</option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Tipo de contrato">
            {(id) => (
              <select id={id} value={contrato} onChange={(e) => setContrato(e.target.value)}>
                <option value="indefinido">Indefinido</option>
                <option value="plazo">Plazo fijo / por obra</option>
              </select>
            )}
          </Field>
        </div>
      </div>

      <div className="card result">
        <div className="big-result">
          <span>Subsidio por {d} {d === 1 ? 'día' : 'días'} de licencia</span>
          <strong>{formatCLP(r.total)}</strong>
          <small>{formatCLP(r.diario)} por día pagado</small>
        </div>
        <ResultTable
          rows={[
            { label: 'Remuneración neta promedio (3 meses)', value: formatCLP(r.promedioNeto) },
            { label: 'Subsidio diario (neto ÷ 30)', value: formatCLP(r.diario) },
            { label: 'Días de licencia', value: d },
            r.carencia > 0 && { label: <>Días no pagados (<Term>carencia</Term>)</>, value: `− ${r.carencia}` },
            { label: 'Días pagados', value: r.diasPagados },
            { label: 'Subsidio total', value: formatCLP(r.total), strong: true },
          ]}
        />
        <p className="muted small">
          Trabajando esos {d} días habrías recibido cerca de {formatCLP(trabajando)} líquidos.
          {r.carencia > 0 && ` Las licencias de hasta 10 días no pagan los primeros 3 días (${formatCLP(r.perdida)} menos).`}
        </p>
      </div>

      <Note>
        Cálculo referencial para trabajadores dependientes según el DFL 44: el subsidio equivale al promedio de la
        remuneración neta de los 3 meses anteriores a la licencia, con tope de {formatNum(90, 0)} UF imponibles. Lo paga
        Fonasa (a través de la COMPIN o la caja de compensación) o tu Isapre, y durante la licencia se siguen pagando tus
        cotizaciones. El subsidio no paga impuesto. Algunos contratos o convenios pagan los días de carencia.
      </Note>
    </>
  )
}
