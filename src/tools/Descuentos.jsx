import { descuentosEncadenados, promocion } from '../lib/calculos'
import { formatCLP, formatNum } from '../lib/format'
import { Field, NumberInput, Segmented, ResultTable, Note } from '../components/ui'
import { Presets, useResult } from '../components/ux'
import { useUrlState } from '../lib/useUrlState'
import { useShareText } from '../lib/share'

const PROMOS = [
  { id: 'directo', nombre: 'Descuento directo' },
  { id: 'llevaPaga', nombre: 'Lleva y paga menos' },
  { id: 'segunda', nombre: 'Descuento en la 2.ª unidad' },
]

export default function Descuentos() {
  const [modo, setModo] = useUrlState('modo', 'simple')
  const [precio, setPrecio] = useUrlState('precio', 49_990)
  const [d1, setD1] = useUrlState('d1', 30)
  const [d2, setD2] = useUrlState('d2', 0)
  const [antes, setAntes] = useUrlState('antes', 59_990)
  const [ahora, setAhora] = useUrlState('ahora', 44_990)
  const [unidades, setUnidades] = useUrlState('u', 3)
  const [pct, setPct] = useUrlState('pct', 30)
  const [lleva, setLleva] = useUrlState('lleva', 3)
  const [paga, setPaga] = useUrlState('paga', 2)
  const [pct2, setPct2] = useUrlState('pct2', 50)

  const enc = descuentosEncadenados(precio, [d1, d2].filter((x) => x > 0))
  const real = antes > 0 ? (1 - ahora / antes) * 100 : 0
  const promos = PROMOS.map((p) => ({
    ...p,
    r: promocion({ tipo: p.id, precio, unidades, pct: p.id === 'segunda' ? pct2 : pct, lleva, paga: Math.min(paga, lleva) }),
  }))
  const mejor = promos.reduce((a, b) => (b.r.total < a.r.total ? b : a))

  const resumen =
    modo === 'simple' ? ['Precio final', formatCLP(enc.final)] : modo === 'real' ? ['Descuento real', `${formatNum(real, 1)}%`] : ['Conviene', mejor.nombre]
  useResult(resumen[0], resumen[1])
  useShareText(
    modo === 'simple'
      ? `${formatCLP(precio)} con ${[d1, d2].filter(Boolean).join('% + ')}% de descuento queda en ${formatCLP(enc.final)}`
      : modo === 'real'
        ? `De ${formatCLP(antes)} a ${formatCLP(ahora)}: el descuento real es ${formatNum(real, 1)}%`
        : `Para ${unidades} unidades conviene "${mejor.nombre}": ${formatCLP(mejor.r.total)}`,
  )

  return (
    <>
      <div className="card">
        <Segmented
          label="Tipo de cálculo"
          value={modo}
          onChange={setModo}
          options={[
            { value: 'simple', label: 'Precio con descuento' },
            { value: 'real', label: '¿Es real la oferta?' },
            { value: 'promos', label: 'Comparar promociones' },
          ]}
        />

        {modo === 'simple' && (
          <>
            <div className="form-grid">
              <Field label="Precio normal">
                {(id) => <NumberInput id={id} value={precio} onChange={setPrecio} prefix="$" />}
              </Field>
              <Field label="Descuento">
                {(id) => <NumberInput id={id} value={d1} onChange={setD1} suffix="%" decimals={1} />}
              </Field>
              <Field label="Descuento adicional" hint="Por ejemplo, con tarjeta o cupón">
                {(id) => <NumberInput id={id} value={d2} onChange={setD2} suffix="%" decimals={1} />}
              </Field>
            </div>
            <Presets
              value={d1}
              onChange={setD1}
              options={[10, 20, 30, 40, 50, 70].map((v) => ({ label: `${v}%`, value: v }))}
            />
          </>
        )}

        {modo === 'real' && (
          <div className="form-grid">
            <Field label="Precio antes de la oferta" hint="Idealmente, el de hace un mes">
              {(id) => <NumberInput id={id} value={antes} onChange={setAntes} prefix="$" />}
            </Field>
            <Field label="Precio en oferta">
              {(id) => <NumberInput id={id} value={ahora} onChange={setAhora} prefix="$" />}
            </Field>
          </div>
        )}

        {modo === 'promos' && (
          <div className="form-grid">
            <Field label="Precio por unidad">
              {(id) => <NumberInput id={id} value={precio} onChange={setPrecio} prefix="$" />}
            </Field>
            <Field label="Unidades que vas a comprar">
              {(id) => <NumberInput id={id} value={unidades} onChange={setUnidades} />}
            </Field>
            <Field label="Descuento directo">
              {(id) => <NumberInput id={id} value={pct} onChange={setPct} suffix="%" />}
            </Field>
            <Field label="Lleva… paga…" hint={`Lleva ${lleva}, paga ${Math.min(paga, lleva)}`}>
              {() => (
                <div className="pair-inputs">
                  <NumberInput value={lleva} onChange={setLleva} aria-label="Lleva" />
                  <NumberInput value={paga} onChange={setPaga} aria-label="Paga" />
                </div>
              )}
            </Field>
            <Field label="Descuento en la segunda unidad">
              {(id) => <NumberInput id={id} value={pct2} onChange={setPct2} suffix="%" />}
            </Field>
          </div>
        )}
      </div>

      {modo === 'simple' && (
        <div className="card result">
          <div className="big-result">
            <span>Pagas</span>
            <strong>{formatCLP(enc.final)}</strong>
            <small>Ahorras {formatCLP(enc.ahorro)}</small>
          </div>
          <ResultTable
            rows={[
              { label: 'Precio normal', value: formatCLP(precio) },
              { label: `Descuento${d2 > 0 ? 's' : ''}`, value: `${formatNum(d1, 1)}%${d2 > 0 ? ` + ${formatNum(d2, 1)}%` : ''}` },
              d2 > 0 && { label: 'Equivale a un descuento de', value: `${formatNum(enc.equivalente, 1)}%`, muted: true },
              { label: 'Precio final', value: formatCLP(enc.final), strong: true },
            ]}
          />
          {d2 > 0 && (
            <p className="muted small">
              Los descuentos sucesivos no se suman: {formatNum(d1, 0)}% + {formatNum(d2, 0)}% equivale a {formatNum(enc.equivalente, 1)}%, no a {formatNum(d1 + d2, 0)}%.
            </p>
          )}
        </div>
      )}

      {modo === 'real' && (
        <div className="card result">
          <div className="big-result">
            <span>Descuento real</span>
            <strong>{formatNum(real, 1)}%</strong>
            <small>Ahorras {formatCLP(antes - ahora)}</small>
          </div>
          <p className="small muted">
            Compara el precio en oferta con el que tenía el producto unas semanas antes, no con el “precio normal” que muestra la
            tienda. Si el precio subió justo antes del evento, el descuento real es menor al anunciado.
          </p>
        </div>
      )}

      {modo === 'promos' && (
        <div className="card result">
          <div className="big-result">
            <span>Para {unidades} unidades conviene</span>
            <strong className="text-strong">{mejor.nombre}</strong>
            <small>Pagas {formatCLP(mejor.r.total)} ({formatNum(mejor.r.descuento, 1)}% de descuento)</small>
          </div>
          <ul className="promo-list">
            {promos
              .slice()
              .sort((a, b) => a.r.total - b.r.total)
              .map((p) => (
                <li key={p.id} className={p === mejor ? 'best' : ''}>
                  <span>
                    <strong>{p.nombre}</strong>
                    <span className="muted small">
                      {p.id === 'directo' ? `${pct}% en todo` : p.id === 'llevaPaga' ? `lleva ${lleva}, paga ${Math.min(paga, lleva)}` : `${pct2}% en la segunda`}
                      {' · '}
                      {formatCLP(p.r.porUnidad)} por unidad
                    </span>
                  </span>
                  <span className="promo-total">
                    {formatCLP(p.r.total)}
                    <small>{formatNum(p.r.descuento, 1)}%</small>
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}

      <Note>
        Antes de un CyberDay o Black Friday, guarda los precios de lo que te interesa para comparar después. El SERNAC fiscaliza
        que los descuentos anunciados sean reales; puedes reclamar en sernac.cl.
      </Note>
    </>
  )
}
