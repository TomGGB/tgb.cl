import { useEffect, useState } from 'react'
import { useIndicadores, fetchValorEnFecha } from '../lib/indicadores'
import { formatCLP, formatNum, fromISODate } from '../lib/format'
import { Field, NumberInput, ResultTable, Note } from '../components/ui'
import { useUrlState } from '../lib/useUrlState'
import { useShareText } from '../lib/share'

// mindicador no publica valores en fines de semana para el dólar: retrocede hasta 7 días
async function valorCercano(code, date) {
  for (let i = 0; i < 7; i++) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate() - i)
    const v = await fetchValorEnFecha(code, d)
    if (v) return { valor: v, fecha: d }
  }
  return null
}

export default function ComparadorHistorico() {
  const { get } = useIndicadores()
  const [monto, setMonto] = useUrlState('monto', 100_000)
  const [fecha, setFecha] = useUrlState('fecha', '2015-01-01')
  const [hist, setHist] = useState({ uf: null, dolar: null, loading: false, error: null })

  useEffect(() => {
    if (!fecha) return
    let alive = true
    setHist((h) => ({ ...h, loading: true, error: null }))
    const date = fromISODate(fecha)
    Promise.all([valorCercano('uf', date), valorCercano('dolar', date)])
      .then(([uf, dolar]) => {
        if (!alive) return
        if (!uf) throw new Error('sin datos')
        setHist({ uf, dolar, loading: false, error: null })
      })
      .catch((error) => alive && setHist({ uf: null, dolar: null, loading: false, error }))
    return () => {
      alive = false
    }
  }, [fecha])

  const ufHoy = get('uf')
  const dolarHoy = get('dolar')
  const factor = hist.uf ? ufHoy / hist.uf.valor : null
  const equivalente = factor ? monto * factor : null
  const enUF = hist.uf ? monto / hist.uf.valor : null
  const enUSD = hist.dolar ? monto / hist.dolar.valor : null
  const anios = fecha ? (Date.now() - fromISODate(fecha)) / (365.25 * 86400000) : 0
  const anual = factor && anios > 0.5 ? Math.pow(factor, 1 / anios) - 1 : null

  useShareText(equivalente ? `${formatCLP(monto)} de ${fromISODate(fecha).getFullYear()} equivalen hoy a ${formatCLP(equivalente)}` : null)

  return (
    <>
      <div className="card form-grid">
        <Field label="Monto en pesos de esa fecha">
          {(id) => <NumberInput id={id} value={monto} onChange={setMonto} prefix="$" />}
        </Field>
        <Field label="Fecha" hint="Desde 1977 para la UF y 1984 para el dólar">
          {(id) => <input id={id} type="date" value={fecha} min="1977-01-01" max={new Date().toISOString().slice(0, 10)} onChange={(e) => setFecha(e.target.value)} />}
        </Field>
      </div>

      {hist.loading && <div className="card loading-block">Consultando valores históricos…</div>}
      {hist.error && <Note>No se encontraron datos para esa fecha. Prueba con otra.</Note>}

      {factor && !hist.loading && (
        <>
          <div className="card result">
            <div className="big-result">
              <span>{formatCLP(monto)} de {fromISODate(fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })} equivalen hoy a</span>
              <strong>{formatCLP(equivalente)}</strong>
              <small>
                Inflación acumulada: {formatNum((factor - 1) * 100, 1)}%
                {anual !== null && ` (${formatNum(anual * 100, 1)}% anual promedio)`}
              </small>
            </div>
            <ResultTable
              rows={[
                { label: 'UF en esa fecha', value: formatCLP(hist.uf.valor) },
                { label: 'UF hoy', value: formatCLP(ufHoy) },
                { label: `${formatCLP(monto)} en UF de esa fecha`, value: `${formatNum(enUF, 2)} UF` },
                { label: `Si hoy compraras esas ${formatNum(enUF, 2)} UF`, value: formatCLP(equivalente), strong: true },
              ]}
            />
          </div>

          {hist.dolar && (
            <div className="card">
              <h2>¿Y si lo hubieras cambiado a dólares?</h2>
              <ResultTable
                rows={[
                  { label: `Dólar al ${hist.dolar.fecha.toLocaleDateString('es-CL')}`, value: formatCLP(hist.dolar.valor) },
                  { label: 'Dólar hoy', value: `$${formatNum(dolarHoy, 2)}` },
                  { label: 'Dólares que comprabas', value: `US$ ${formatNum(enUSD, 2)}` },
                  { label: 'Esos dólares valen hoy', value: formatCLP(enUSD * dolarHoy), strong: true },
                ]}
              />
              <p className="muted small">
                {enUSD * dolarHoy > equivalente
                  ? 'Guardar dólares le habría ganado a la inflación en este período.'
                  : 'Guardar dólares no le habría ganado a la inflación en este período.'}
              </p>
            </div>
          )}
        </>
      )}

      <Note>
        La inflación se mide con la variación de la UF, que se reajusta según el IPC. Es la misma forma en que se
        actualizan arriendos, créditos hipotecarios y deudas. Datos del Banco Central vía mindicador.cl.
      </Note>
    </>
  )
}
