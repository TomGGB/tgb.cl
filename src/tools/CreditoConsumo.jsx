import { creditoConsumo } from '../lib/finanzas'
import { formatCLP, formatNum } from '../lib/format'
import { Field, NumberInput, ResultTable, Note } from '../components/ui'
import { useUrlState } from '../lib/useUrlState'
import { useShareText } from '../lib/share'

export default function CreditoConsumo() {
  const [monto, setMonto] = useUrlState('monto', 3_000_000)
  const [cuotas, setCuotas] = useUrlState('cuotas', 36)
  const [tasa, setTasa] = useUrlState('tasa', 1.5)
  const [seguro, setSeguro] = useUrlState('seguro', 0)
  const [gastos, setGastos] = useUrlState('gastos', 0)

  const r = creditoConsumo({ monto, cuotas, tasaMensual: tasa / 100, seguroMensual: seguro, gastosIniciales: gastos })

  useShareText(`Crédito de ${formatCLP(monto)} en ${cuotas} cuotas: ${formatCLP(r.pagoTotalMes)} al mes, CAE ${formatNum(r.cae * 100, 2)}%`)

  return (
    <>
      <div className="card form-grid">
        <Field label="Monto que necesitas">
          {(id) => <NumberInput id={id} value={monto} onChange={setMonto} prefix="$" />}
        </Field>
        <Field label="Número de cuotas">
          {(id) => (
            <select id={id} value={cuotas} onChange={(e) => setCuotas(Number(e.target.value))}>
              {[6, 12, 18, 24, 36, 48, 60, 72].map((n) => (
                <option key={n} value={n}>{n} meses</option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Tasa de interés mensual" hint="Aparece en la simulación del banco">
          {(id) => <NumberInput id={id} value={tasa} onChange={setTasa} suffix="%" decimals={2} />}
        </Field>
        <Field label="Seguros mensuales" hint="Desgravamen, cesantía, etc.">
          {(id) => <NumberInput id={id} value={seguro} onChange={setSeguro} prefix="$" />}
        </Field>
        <Field label="Gastos iniciales" hint="Impuesto de timbres, notaría (se suman al crédito)">
          {(id) => <NumberInput id={id} value={gastos} onChange={setGastos} prefix="$" />}
        </Field>
      </div>

      <div className="card result">
        <div className="big-result">
          <span>Pago mensual</span>
          <strong>{formatCLP(r.pagoTotalMes)}</strong>
          <small>CAE: {formatNum(r.cae * 100, 2)}%</small>
        </div>
        <ResultTable
          rows={[
            { label: 'Cuota del crédito', value: formatCLP(r.cuota) },
            seguro > 0 && { label: 'Seguros', value: formatCLP(seguro) },
            { label: 'Tasa anual (mensual × 12)', value: `${formatNum(r.tasaAnual * 100, 2)}%`, muted: true },
            { label: 'Carga Anual Equivalente (CAE)', value: `${formatNum(r.cae * 100, 2)}%` },
            { label: `Total pagado en ${cuotas} cuotas`, value: formatCLP(r.total) },
            { label: 'Costo del crédito (lo que pagas de más)', value: formatCLP(r.costo), strong: true },
          ]}
        />
        <p className="muted small">
          Por cada $100 que recibes, devuelves {formatCLP((r.total / Math.max(monto, 1)) * 100)}.
        </p>
      </div>

      <Note>
        La CAE incluye intereses, seguros y gastos, y es el mejor número para comparar créditos entre bancos: mientras más
        baja, más barato. Los bancos están obligados a informarla. Compara ofertas en el simulador de la{' '}
        <a href="https://www.cmfchile.cl" target="_blank" rel="noreferrer">CMF</a>.
      </Note>
    </>
  )
}
