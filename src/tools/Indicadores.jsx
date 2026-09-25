import { useEffect, useState } from 'react'
import { useIndicadores, fetchSerie } from '../lib/indicadores'
import { formatNum } from '../lib/format'
import { Note } from '../components/ui'
import { Icon } from '../components/icons'

const ITEMS = [
  { code: 'uf', label: 'UF', decimals: 2 },
  { code: 'dolar', label: 'Dólar observado', decimals: 2 },
  { code: 'euro', label: 'Euro', decimals: 2 },
  { code: 'utm', label: 'UTM', decimals: 0 },
  { code: 'ipc', label: 'IPC (último dato publicado)', decimals: 1, suffix: '%' },
  { code: 'tpm', label: 'Tasa de política monetaria', decimals: 2, suffix: '%' },
  { code: 'imacec', label: 'Imacec', decimals: 1, suffix: '%' },
  { code: 'libra_cobre', label: 'Libra de cobre (USD)', decimals: 2 },
  { code: 'bitcoin', label: 'Bitcoin (USD)', decimals: 0 },
]

const CHARTABLE = ['uf', 'dolar', 'euro', 'utm', 'libra_cobre']

export default function Indicadores() {
  const { data, loading, error } = useIndicadores()
  const [chart, setChart] = useState('dolar')

  return (
    <>
      {error && <Note>No se pudo conectar con mindicador.cl. Intenta recargar en unos minutos.</Note>}
      <div className="indicator-grid">
        {ITEMS.map((it) => {
          const ind = data?.[it.code]
          return (
            <button
              key={it.code}
              type="button"
              className={`indicator ${chart === it.code ? 'active' : ''}`}
              onClick={() => CHARTABLE.includes(it.code) && setChart(it.code)}
              disabled={!CHARTABLE.includes(it.code)}
            >
              <span className="indicator-label">{it.label}</span>
              <span className={`indicator-value ${loading ? 'loading' : ''}`}>
                {ind ? `${it.suffix ? '' : '$'}${formatNum(ind.valor, it.decimals)}${it.suffix ?? ''}` : loading ? '…' : '—'}
              </span>
              {ind && (
                <span className="indicator-date">
                  {new Date(ind.fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
            </button>
          )
        })}
      </div>
      <SerieChart code={chart} label={ITEMS.find((i) => i.code === chart).label} />
    </>
  )
}

function SerieChart({ code, label }) {
  const [serie, setSerie] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    setSerie(null)
    setError(null)
    fetchSerie(code)
      .then((s) => alive && setSerie(s.slice(-30)))
      .catch((e) => alive && setError(e))
    return () => {
      alive = false
    }
  }, [code])

  if (error) return <div className="card">No se pudo cargar el historial.</div>
  if (!serie) return <div className="card chart-card loading-block">Cargando historial…</div>
  if (serie.length < 2) return null

  const W = 640
  const H = 220
  const P = { t: 16, r: 16, b: 28, l: 64 }
  const vals = serie.map((p) => p.valor)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const pad = (max - min) * 0.1 || 1
  const y0 = min - pad
  const y1 = max + pad
  const x = (i) => P.l + (i / (serie.length - 1)) * (W - P.l - P.r)
  const y = (v) => P.t + (1 - (v - y0) / (y1 - y0)) * (H - P.t - P.b)
  const path = serie.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.valor).toFixed(1)}`).join('')
  const area = `${path}L${x(serie.length - 1)},${H - P.b}L${x(0)},${H - P.b}Z`
  const ticks = [y0 + pad, (y0 + y1) / 2, y1 - pad]
  const first = serie[0].valor
  const last = serie[serie.length - 1].valor
  const change = ((last - first) / first) * 100
  const fmtDate = (d) => d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })

  return (
    <div className="card chart-card">
      <div className="chart-head">
        <h2>{label}: últimos {serie.length} registros</h2>
        <span className={`badge ${change >= 0 ? 'up' : 'down'}`}>
          <Icon name={change >= 0 ? 'ArrowUp' : 'ArrowDown'} size={13} strokeWidth={2.5} /> {formatNum(Math.abs(change), 2)}%
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label={`Gráfico de ${label}`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} className="grid" />
            <text x={P.l - 8} y={y(t) + 4} textAnchor="end" className="axis">
              {formatNum(t, t > 1000 ? 0 : 2)}
            </text>
          </g>
        ))}
        <path d={area} className="area" />
        <path d={path} className="line" />
        <circle cx={x(serie.length - 1)} cy={y(last)} r="4" className="dot" />
        <text x={P.l} y={H - 8} className="axis">{fmtDate(serie[0].fecha)}</text>
        <text x={W - P.r} y={H - 8} textAnchor="end" className="axis">{fmtDate(serie[serie.length - 1].fecha)}</text>
      </svg>
    </div>
  )
}
