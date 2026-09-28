import { Link } from 'react-router-dom'
import { useIndicadores } from '../lib/indicadores'
import { operacionRentaHonorarios, RENTA } from '../lib/empleo'
import { AFPS } from '../lib/sueldo'
import { formatCLP, formatNum } from '../lib/format'
import { Field, NumberInput, Segmented, ResultTable, Note } from '../components/ui'
import { Presets, useResult } from '../components/ux'
import { useUrlState } from '../lib/useUrlState'
import { useShareText } from '../lib/share'

export default function RentaHonorarios() {
  const { get } = useIndicadores()
  const [anio, setAnio] = useUrlState('at', 2027)
  const [honorarios, setHonorarios] = useUrlState('bruto', 12_000_000)
  const [cobertura, setCobertura] = useUrlState('cobertura', 'total')
  const [afp, setAfp] = useUrlState('afp', 'Modelo')

  const comisionAFP = AFPS.find((a) => a.name === afp)?.comision ?? AFPS[1].comision
  const at = RENTA[anio] ? anio : 2027
  const r = operacionRentaHonorarios({ honorarios, anio: at, cobertura, comisionAFP, utm: get('utm'), uf: get('uf') })
  const devolucion = r.saldo >= 0

  useResult(devolucion ? 'Devolución estimada' : 'A pagar', formatCLP(Math.abs(r.saldo)))
  useShareText(`Con ${formatCLP(honorarios)} en boletas al año, en la Operación Renta ${at} ${devolucion ? `me devolverían cerca de ${formatCLP(r.saldo)}` : `tendría que pagar cerca de ${formatCLP(-r.saldo)}`}`)

  return (
    <>
      <div className="card">
        <Segmented
          label="Año tributario"
          value={at}
          onChange={setAnio}
          options={[
            { value: 2027, label: 'Renta 2027 (boletas de 2026)' },
            { value: 2026, label: 'Renta 2026 (boletas de 2025)' },
          ]}
        />
        <div className="form-grid">
          <Field label="Total de boletas del año (bruto)" hint={`Retención del ${formatNum(r.retencion * 100, 2)}%: ${formatCLP(r.retenciones)}`}>
            {(id) => (
              <>
                <NumberInput id={id} value={honorarios} onChange={setHonorarios} prefix="$" />
                <Presets
                  label="Montos anuales típicos"
                  value={honorarios}
                  onChange={setHonorarios}
                  options={[
                    { label: '$500 mil al mes', value: 6_000_000 },
                    { label: '$1 millón al mes', value: 12_000_000 },
                    { label: '$2 millones al mes', value: 24_000_000 },
                  ]}
                />
              </>
            )}
          </Field>
          <Field label="AFP">
            {(id) => (
              <select id={id} value={afp} onChange={(e) => setAfp(e.target.value)}>
                {AFPS.map((a) => (
                  <option key={a.name} value={a.name}>{a.name} ({formatNum(a.comision * 100, 2)}%)</option>
                ))}
              </select>
            )}
          </Field>
        </div>
        <p className="field-label">Cobertura de salud y pensiones</p>
        <Segmented
          label="Cobertura"
          value={cobertura}
          onChange={setCobertura}
          options={[
            { value: 'total', label: 'Cobertura total' },
            { value: 'parcial', label: `Cobertura parcial (${formatNum(r.parcial * 100, 0)}%)` },
          ]}
        />
      </div>

      <div className={`card result ${devolucion ? '' : 'warn'}`}>
        <div className="big-result">
          <span>{devolucion ? 'Te devolverían cerca de' : 'Tendrías que pagar cerca de'}</span>
          <strong className={devolucion ? 'up' : 'down'}>{formatCLP(Math.abs(r.saldo))}</strong>
          <small>
            {cobertura === 'total' && r.obligado && Math.abs(r.saldo) < 1
              ? 'Con cobertura total, toda la retención se usa para pagar tus cotizaciones. '
              : ''}
            {r.oficial ? 'Valores oficiales de la Operación Renta 2026.' : 'Estimación: el SII publica los valores definitivos en marzo.'}
          </small>
        </div>
        <ResultTable
          rows={[
            { label: 'Retenciones de tus boletas', value: formatCLP(r.retenciones) },
            ...(r.obligado
              ? r.cotizaciones.items.map((i) => ({ label: i.label, value: `− ${formatCLP(i.monto)}` }))
              : [{ label: 'Cotizaciones', value: 'No obligatorias (menos de 5 ingresos mínimos al año)', muted: true }]),
            { label: `Impuesto global complementario (base ${formatCLP(r.baseImpuesto)})`, value: `− ${formatCLP(r.impuesto)}` },
            { label: devolucion ? 'Devolución' : 'Saldo a pagar', value: formatCLP(Math.abs(r.saldo)), strong: true },
          ]}
        />
        {r.obligado && (
          <p className="muted small">
            Las cotizaciones se calculan sobre el 80% de tus boletas ({formatCLP(r.cotizaciones.base)})
            {cobertura === 'parcial' && `; salud y pensiones, sobre el ${formatNum(r.parcial * 100, 0)}% de esa base`}. Los gastos
            presuntos ({formatCLP(r.gastos)}) se descuentan antes de calcular el impuesto.
          </p>
        )}
      </div>

      <Note>
        Estimación para quienes solo tienen ingresos por boletas de honorarios. Si además tienes sueldo, arriendos u otras rentas,
        el resultado cambia: el SII calcula tu propuesta en la Operación Renta de abril. Con cobertura total quedas protegido por
        el total de tu renta para licencias y pensión; la parcial deja más devolución pero menos protección y desaparece en 2028.
        Revisa también la <Link to="/boleta-honorarios/">calculadora de boletas</Link>.
      </Note>
    </>
  )
}
