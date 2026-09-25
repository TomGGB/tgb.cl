import { useIndicadores } from '../lib/indicadores'
import { formatCLP, formatNum } from '../lib/format'
import { Field, NumberInput } from '../components/ui'
import { useUrlState } from '../lib/useUrlState'

const UNITS = [
  { code: 'clp', label: 'Pesos (CLP)', decimals: 0 },
  { code: 'uf', label: 'UF', decimals: 2 },
  { code: 'utm', label: 'UTM', decimals: 2 },
  { code: 'dolar', label: 'Dólares (USD)', decimals: 2 },
  { code: 'euro', label: 'Euros (EUR)', decimals: 2 },
]

export default function Conversor() {
  const { get, data } = useIndicadores()
  const [amount, setAmount] = useUrlState('monto', 1)
  const [from, setFrom] = useUrlState('de', 'uf')

  const rate = (code) => (code === 'clp' ? 1 : get(code))
  const enCLP = amount * rate(from)

  return (
    <>
      <div className="card form-grid">
        <Field label="Monto">
          {(id) => <NumberInput id={id} value={amount} onChange={setAmount} decimals={4} />}
        </Field>
        <Field label="Unidad">
          {(id) => (
            <select id={id} value={from} onChange={(e) => setFrom(e.target.value)}>
              {UNITS.map((u) => (
                <option key={u.code} value={u.code}>{u.label}</option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <div className="conversion-list">
        {UNITS.filter((u) => u.code !== from).map((u) => {
          const v = enCLP / rate(u.code)
          return (
            <div key={u.code} className="conversion">
              <span>{u.label}</span>
              <strong>{u.code === 'clp' ? formatCLP(v) : formatNum(v, u.decimals)}</strong>
            </div>
          )
        })}
      </div>

      <p className="muted small">
        Valores usados: UF {formatCLP(get('uf'))} · UTM {formatCLP(get('utm'))} · USD {formatNum(get('dolar'), 2)} · EUR{' '}
        {formatNum(get('euro'), 2)}
        {!data && ' (referenciales, sin conexión)'}
      </p>
    </>
  )
}
