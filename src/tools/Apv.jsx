import { Link } from 'react-router-dom'
import { useIndicadores } from '../lib/indicadores'
import { AFPS, calcularLiquido } from '../lib/sueldo'
import { compararApv } from '../lib/finanzas'
import { formatCLP, formatNum } from '../lib/format'
import { Field, NumberInput, Note } from '../components/ui'
import { useUrlState } from '../lib/useUrlState'
import { useShareText } from '../lib/share'
import { useResult } from '../components/ux'

export default function Apv() {
  const { get } = useIndicadores()
  const uf = get('uf')
  const utm = get('utm')
  const [sueldo, setSueldo] = useUrlState('sueldo', 1_500_000)
  const [aporte, setAporte] = useUrlState('aporte', 100_000)

  const { tributable } = calcularLiquido({ imponible: sueldo, comisionAFP: AFPS[1].comision, uf, utm })
  const r = compararApv({ aporteMensual: aporte, baseTributable: tributable, utm, uf })

  useShareText(`Con mi sueldo me conviene el APV régimen ${r.recomendado}: ${formatCLP(Math.max(r.bonoA, r.beneficioB))} de beneficio al año`)

  useResult('Te conviene', `Régimen ${r.recomendado}`)

  return (
    <>
      <div className="card form-grid">
        <Field label="Sueldo bruto imponible mensual" hint={`Base tributable estimada: ${formatCLP(tributable)}`}>
          {(id) => <NumberInput id={id} value={sueldo} onChange={setSueldo} prefix="$" />}
        </Field>
        <Field label="Aporte mensual al APV">
          {(id) => <NumberInput id={id} value={aporte} onChange={setAporte} prefix="$" />}
        </Field>
      </div>

      <div className="apv-compare">
        <div className={`card apv-option ${r.recomendado === 'A' ? 'recommended' : ''}`}>
          {r.recomendado === 'A' && <span className="tag green">Te conviene</span>}
          <h2>Régimen A</h2>
          <p className="muted small">El Estado te bonifica el 15% de lo que ahorras (tope 6 UTM al año).</p>
          <strong className="apv-amount">{formatCLP(r.bonoA)}</strong>
          <span className="muted small">de beneficio al año</span>
        </div>
        <div className={`card apv-option ${r.recomendado === 'B' ? 'recommended' : ''}`}>
          {r.recomendado === 'B' && <span className="tag green">Te conviene</span>}
          <h2>Régimen B</h2>
          <p className="muted small">El aporte se descuenta de tu sueldo antes de calcular el impuesto (tasa marginal: {formatNum(r.tasaMarginal * 100, 1)}%).</p>
          <strong className="apv-amount">{formatCLP(r.beneficioB)}</strong>
          <span className="muted small">de menor impuesto al año</span>
        </div>
      </div>

      <div className="card">
        <ul className="simple-list">
          <li><span>Ahorro anual</span><strong>{formatCLP(r.anual)}</strong></li>
          <li><span>Aporte mensual para llegar al tope del régimen A</span><strong>{formatCLP(r.aporteParaTopeA)}</strong></li>
          <li><span>Tope régimen B</span><strong>50 UF al mes ({formatCLP(50 * uf)})</strong></li>
        </ul>
      </div>

      <Note>
        Regla general: si tu tasa marginal es de 13,5% o menos (o no pagas impuesto), conviene el régimen A, porque el
        bono del 15% supera lo que te ahorrarías en impuestos; desde el tramo del 23%, conviene el B. Si ahorras más de lo
        que cubre el tope de 6 UTM, puede convenir combinar ambos. La bonificación del régimen A se deposita al año
        siguiente y se pierde si retiras el ahorro antes de pensionarte; en el régimen B, los retiros anticipados pagan
        impuesto. Cálculo con Fonasa y AFP Modelo; puedes ver tu base exacta en la{' '}
        <Link to={`/sueldo-liquido/?monto=${sueldo}`}>calculadora de sueldo líquido</Link>.
      </Note>
    </>
  )
}
