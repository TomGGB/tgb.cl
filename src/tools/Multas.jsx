import { useIndicadores } from '../lib/indicadores'
import { MULTAS } from '../lib/empleo'
import { formatCLP, formatNum } from '../lib/format'
import { Field, NumberInput, Note } from '../components/ui'
import { useResult } from '../components/ux'
import { useUrlState } from '../lib/useUrlState'
import { useShareText } from '../lib/share'

export default function Multas() {
  const { get } = useIndicadores()
  const utm = get('utm')
  const [tipo, setTipo] = useUrlState('tipo', 'grave')
  const [monto, setMonto] = useUrlState('utm', 1)
  const [pronto, setPronto] = useUrlState('pronto', true)

  const cat = MULTAS.find((m) => m.id === tipo) ?? MULTAS[2]
  const valorUTM = Math.min(Math.max(monto, cat.min), cat.max)
  const multa = valorUTM * utm
  const conDescuento = cat.descuento && pronto
  const aPagar = conDescuento ? multa * 0.75 : multa

  useResult('Multa a pagar', formatCLP(aPagar))
  useShareText(`Una multa ${cat.nombre.toLowerCase()} de ${formatNum(valorUTM, 2)} UTM son ${formatCLP(multa)}${conDescuento ? ` (${formatCLP(aPagar)} con pronto pago)` : ''}`)

  return (
    <>
      <div className="card">
        <h2>Montos por tipo de infracción</h2>
        <div className="fine-grid">
          {MULTAS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`fine-card ${m.id} ${m.id === cat.id ? 'active' : ''}`}
              onClick={() => { setTipo(m.id); setMonto(m.min) }}
              aria-pressed={m.id === cat.id}
            >
              <strong>{m.nombre}</strong>
              <span>{formatNum(m.min, 1)} a {formatNum(m.max, 1)} UTM</span>
              <em>{formatCLP(m.min * utm)} a {formatCLP(m.max * utm)}</em>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="form-grid">
          <Field label="Monto de la multa" hint={`Entre ${formatNum(cat.min, 1)} y ${formatNum(cat.max, 1)} UTM para una infracción ${cat.nombre.toLowerCase()}`}>
            {(id) => <NumberInput id={id} value={monto} onChange={setMonto} suffix="UTM" decimals={2} />}
          </Field>
        </div>
        <input
          type="range"
          className="range"
          min={cat.min}
          max={cat.max}
          step="0.05"
          value={valorUTM}
          onChange={(e) => setMonto(Number(e.target.value))}
          aria-label="Monto de la multa en UTM"
        />
        {cat.descuento ? (
          <label className="checkbox">
            <input type="checkbox" checked={pronto} onChange={(e) => setPronto(e.target.checked)} />
            <span>Pago dentro del plazo de pronto pago (25% de descuento)</span>
          </label>
        ) : (
          <p className="muted small">Las infracciones gravísimas no tienen descuento por pronto pago.</p>
        )}
      </div>

      <div className="card result">
        <div className="big-result">
          <span>Multa a pagar</span>
          <strong>{formatCLP(aPagar)}</strong>
          <small>{formatNum(valorUTM, 2)} UTM con UTM de {formatCLP(utm)}</small>
        </div>
        {conDescuento && (
          <p className="small muted">Sin descuento serían {formatCLP(multa)}: ahorras {formatCLP(multa - aPagar)}.</p>
        )}
      </div>

      <Note>
        Rangos de la Ley de Tránsito (Ley 18.290). El monto exacto dentro del rango lo fija el Juzgado de Policía Local. El 25%
        de descuento por pago anticipado (Ley 18.287) no aplica a infracciones gravísimas ni cuando hubo daños o lesiones.
        Las multas impagas quedan en el Registro de Multas de Tránsito no Pagadas e impiden renovar el permiso de circulación.
        Algunas infracciones gravísimas implican además la suspensión de la licencia.
      </Note>
    </>
  )
}
