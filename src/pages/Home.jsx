import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES, TOOLS } from '../tools/meta'
import { useIndicadores } from '../lib/indicadores'
import { proximoFeriado } from '../lib/feriados'
import { formatCLP, formatNum } from '../lib/format'

const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

function QuickStats() {
  const { get, loading, error } = useIndicadores()
  const feriado = proximoFeriado()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dias = Math.round((feriado.date - today) / 86400000)

  const stats = [
    { label: 'UF', value: formatNum(get('uf'), 2), to: '/indicadores' },
    { label: 'Dólar', value: formatNum(get('dolar'), 2), to: '/indicadores' },
    { label: 'UTM', value: formatCLP(get('utm')), to: '/indicadores' },
    {
      label: 'Próximo feriado',
      value: dias === 0 ? '¡Hoy!' : `${dias} ${dias === 1 ? 'día' : 'días'}`,
      sub: feriado.name,
      to: '/feriados',
    },
  ]

  return (
    <section className="quick-stats" aria-busy={loading}>
      {stats.map((s) => (
        <Link key={s.label} to={s.to} className="stat">
          <span className="stat-label">{s.label}</span>
          <span className={`stat-value ${loading ? 'loading' : ''}`}>{s.value}</span>
          {s.sub && <span className="stat-sub">{s.sub}</span>}
        </Link>
      ))}
      {error && <p className="stat-error">No se pudieron cargar los indicadores en vivo; se muestran valores de referencia.</p>}
    </section>
  )
}

export default function Home() {
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const nq = normalize(q.trim())
    if (!nq) return TOOLS
    return TOOLS.filter((t) => normalize(`${t.title} ${t.short} ${t.keywords}`).includes(nq))
  }, [q])

  return (
    <>
      <section className="hero">
        <h1>Herramientas útiles para Chile</h1>
        <p>Indicadores, calculadoras y datos prácticos en un solo lugar. Gratis y sin registro.</p>
        <div className="search">
          <input
            type="search"
            placeholder="Buscar: sueldo, UF, RUT, feriados…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Buscar herramienta"
          />
        </div>
      </section>

      {!q && <QuickStats />}

      {q ? (
        <section className="category">
          <h2>{filtered.length ? `Resultados para “${q}”` : `Sin resultados para “${q}”`}</h2>
          <ToolGrid tools={filtered} />
        </section>
      ) : (
        CATEGORIES.map((c) => (
          <section key={c.id} className="category">
            <h2>{c.name}</h2>
            <ToolGrid tools={TOOLS.filter((t) => t.category === c.id)} />
          </section>
        ))
      )}
    </>
  )
}

function ToolGrid({ tools }) {
  return (
    <div className="tool-grid">
      {tools.map((t) => (
        <Link key={t.slug} to={`/${t.slug}`} className="tool-card">
          <span className="tool-card-icon" aria-hidden="true">{t.icon}</span>
          <span className="tool-card-body">
            <strong>{t.title}</strong>
            <span>{t.short}</span>
          </span>
        </Link>
      ))}
    </div>
  )
}
