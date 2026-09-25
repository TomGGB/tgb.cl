import { useIndicadores } from '../lib/indicadores'
import { proyectarAhorro, depositoPlazo } from '../lib/calculos'
import { formatCLP, formatNum } from '../lib/format'
import { Field, NumberInput, Segmented, ResultTable, Note } from '../components/ui'
import { Term, Presets, useResult } from '../components/ux'
import { useUrlState } from '../lib/useUrlState'
import { useShareText } from '../lib/share'

function Grafico({ puntos, formato }) {
  if (puntos.length < 2) return null
  const W = 640
  const H = 200
  const P = { t: 12, r: 12, b: 26, l: 12 }
  const max = Math.max(...puntos.map((p) => p.saldo)) || 1
  const x = (i) => P.l + (i / (puntos.length - 1)) * (W - P.l - P.r)
  const y = (v) => P.t + (1 - v / max) * (H - P.t - P.b)
  const linea = (key) => puntos.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join('')
  const area = (key) => `${linea(key)}L${x(puntos.length - 1)},${H - P.b}L${x(0)},${H - P.b}Z`
  const ult = puntos[puntos.length - 1]
  return (
    <figure className="savings-chart">
      <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label={`El ahorro llega a ${formato(ult.saldo)}`}>
        <path d={area('saldo')} className="area-interes" />
        <path d={area('aportado')} className="area-aporte" />
        <path d={linea('saldo')} className="line" />
        <text x={P.l} y={H - 6} className="axis">Hoy</text>
        <text x={W - P.r} y={H - 6} textAnchor="end" className="axis">
          {ult.mes >= 24 ? `${formatNum(ult.mes / 12, ult.mes % 12 ? 1 : 0)} años` : `${ult.mes} meses`}
        </text>
      </svg>
      <figcaption className="legend">
        <span><i className="leg-aporte" /> Lo que aportas</span>
        <span><i className="leg-interes" /> Intereses ganados</span>
      </figcaption>
    </figure>
  )
}

export default function Ahorro() {
  const { get } = useIndicadores()
  const uf = get('uf')
  const [modo, setModo] = useUrlState('modo', 'meta')
  const [inicial, setInicial] = useUrlState('inicial', 500_000)
  const [mensual, setMensual] = useUrlState('mensual', 100_000)
  const [tasa, setTasa] = useUrlState('tasa', 5)
  const [anios, setAnios] = useUrlState('anios', 5)
  const [enUF, setEnUF] = useUrlState('uf', false)
  // depósito a plazo
  const [monto, setMonto] = useUrlState('monto', 1_000_000)
  const [tasaDap, setTasaDap] = useUrlState('tdap', 0.4)
  const [dias, setDias] = useUrlState('dias', 30)

  const r = proyectarAhorro({ inicial, mensual, tasaAnual: tasa / 100, meses: Math.round(anios * 12) })
  const dap = depositoPlazo({ monto, tasaPeriodo: tasaDap / 100, dias })
  const fmt = (v) => (enUF ? `${formatNum(v / uf, 2)} UF` : formatCLP(v))

  const principal = modo === 'meta' ? fmt(r.final) : formatCLP(dap.final)
  useResult(modo === 'meta' ? 'Ahorro final' : 'Recibes al vencer', principal)
  useShareText(
    modo === 'meta'
      ? `Ahorrando ${formatCLP(mensual)} al mes durante ${formatNum(anios, 0)} años junto ${fmt(r.final)}`
      : `Depósito a plazo de ${formatCLP(monto)} por ${dias} días: gano ${formatCLP(dap.interes)}`,
  )

  return (
    <>
      <div className="card">
        <Segmented
          label="Tipo de ahorro"
          value={modo}
          onChange={setModo}
          options={[
            { value: 'meta', label: 'Ahorro mensual' },
            { value: 'dap', label: 'Depósito a plazo' },
          ]}
        />
        {modo === 'meta' ? (
          <>
            <div className="form-grid">
              <Field label="Monto inicial">
                {(id) => <NumberInput id={id} value={inicial} onChange={setInicial} prefix="$" />}
              </Field>
              <Field label="Ahorro mensual">
                {(id) => <NumberInput id={id} value={mensual} onChange={setMensual} prefix="$" />}
              </Field>
              <Field label="Rentabilidad anual esperada" hint={enUF ? 'Tasa real, sobre la inflación' : 'Antes de inflación'}>
                {(id) => <NumberInput id={id} value={tasa} onChange={setTasa} suffix="%" decimals={2} />}
              </Field>
              <Field label="Plazo">
                {(id) => <NumberInput id={id} value={anios} onChange={setAnios} suffix="años" decimals={1} />}
              </Field>
            </div>
            <Presets
              label="Rentabilidades de referencia"
              value={tasa}
              onChange={setTasa}
              options={[
                { label: 'Cuenta de ahorro 1%', value: 1 },
                { label: 'Depósito a plazo 5%', value: 5 },
                { label: 'Fondo conservador 6%', value: 6 },
                { label: 'Fondo agresivo 9%', value: 9 },
              ]}
            />
            <label className="checkbox">
              <input type="checkbox" checked={enUF} onChange={(e) => setEnUF(e.target.checked)} />
              <span>Mostrar en UF (ahorro que se protege de la <Term k="tasa real">inflación</Term>)</span>
            </label>
          </>
        ) : (
          <div className="form-grid">
            <Field label="Monto a invertir">
              {(id) => <NumberInput id={id} value={monto} onChange={setMonto} prefix="$" />}
            </Field>
            <Field label="Tasa del período" hint="Los bancos la informan por cada 30 días">
              {(id) => <NumberInput id={id} value={tasaDap} onChange={setTasaDap} suffix="% / 30 días" decimals={2} />}
            </Field>
            <Field label="Plazo">
              {(id) => (
                <select id={id} value={dias} onChange={(e) => setDias(Number(e.target.value))}>
                  {[30, 60, 90, 180, 365].map((d) => (
                    <option key={d} value={d}>{d} días</option>
                  ))}
                </select>
              )}
            </Field>
          </div>
        )}
      </div>

      {modo === 'meta' ? (
        <div className="card result">
          <div className="big-result">
            <span>En {formatNum(anios, anios % 1 ? 1 : 0)} años tendrás</span>
            <strong>{fmt(r.final)}</strong>
            <small>{fmt(r.intereses)} son intereses (<Term k="interes compuesto">interés compuesto</Term>)</small>
          </div>
          <Grafico puntos={r.puntos} formato={fmt} />
          <ResultTable
            rows={[
              { label: 'Total aportado', value: fmt(r.aportado) },
              { label: 'Intereses ganados', value: fmt(r.intereses) },
              { label: 'Ahorro final', value: fmt(r.final), strong: true },
            ]}
          />
        </div>
      ) : (
        <div className="card result">
          <div className="big-result">
            <span>Al vencer recibes</span>
            <strong>{formatCLP(dap.final)}</strong>
            <small>Ganas {formatCLP(dap.interes)} en {dias} días</small>
          </div>
          <ResultTable
            rows={[
              { label: 'Monto invertido', value: formatCLP(monto) },
              { label: 'Intereses', value: formatCLP(dap.interes) },
              { label: 'Tasa anual equivalente (renovando cada 30 días)', value: `${formatNum(dap.tasaAnual * 100, 2)}%`, muted: true },
              { label: 'Total al vencer', value: formatCLP(dap.final), strong: true },
            ]}
          />
        </div>
      )}

      <Note>
        Proyección referencial: la rentabilidad de fondos mutuos y de pensiones no está garantizada y puede ser negativa. Los
        intereses ganados pueden pagar impuesto a la renta en la Operación Renta, según tu situación. Compara tasas de depósitos a plazo en
        el sitio de la CMF antes de invertir.
      </Note>
    </>
  )
}
