import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { SITE, TOOLS } from '../tools/meta'
import { GUIDES } from '../tools/guides'
import { ShareButton, ThemeToggle } from './ui'
import CommandPalette from './CommandPalette'
import { useFavoritos, useRecientes } from '../lib/preferencias'

export default function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
    const tool = TOOLS.find((t) => `/${t.slug}` === pathname.replace(/\/$/, ''))
    document.title = tool ? `${tool.title} | ${SITE.name}` : `${SITE.name} · ${SITE.tagline}`
  }, [pathname])

  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

  return (
    <div className="app">
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand">
            <span className="brand-mark" aria-hidden="true">
              <span />
              <span />
            </span>
            <span className="brand-name">tgb<span>.cl</span></span>
          </Link>
          <nav className="header-nav">
            <NavLink to="/indicadores/">Indicadores</NavLink>
            <NavLink to="/sueldo-liquido/">Sueldo</NavLink>
            <NavLink to="/feriados/">Feriados</NavLink>
            <NavLink to="/bencinas/">Bencinas</NavLink>
          </nav>
          <button type="button" className="search-trigger" onClick={() => window.dispatchEvent(new Event('abrir-busqueda'))} aria-label="Buscar herramienta">
            <span aria-hidden="true">🔍</span>
            <span className="search-trigger-text">Buscar</span>
            <kbd>{isMac ? '⌘' : 'Ctrl'} K</kbd>
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main className="container main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>
            {SITE.name} · Herramientas gratuitas para Chile. Los cálculos son referenciales; confirma siempre con la
            fuente oficial.
          </p>
          <p>
            Datos de <a href="https://mindicador.cl" target="_blank" rel="noreferrer">mindicador.cl</a>,{' '}
            <a href="https://www.bencinaenlinea.cl" target="_blank" rel="noreferrer">Bencina en Línea</a>,{' '}
            <a href="https://earthquake.usgs.gov" target="_blank" rel="noreferrer">USGS</a> y{' '}
            <a href="https://open-meteo.com" target="_blank" rel="noreferrer">Open-Meteo</a>.
          </p>
        </div>
      </footer>
      <CommandPalette />
    </div>
  )
}

export function ToolPage({ tool, children }) {
  const { isFav, toggle } = useFavoritos()
  const { registrar } = useRecientes()
  const fav = isFav(tool.slug)
  const guide = GUIDES[tool.slug]

  useEffect(() => registrar(tool.slug), [tool.slug, registrar])

  return (
    <article className="tool-page">
      <nav className="breadcrumb">
        <Link to="/">Inicio</Link> <span aria-hidden="true">/</span> <span>{tool.title}</span>
      </nav>
      <header className="tool-header">
        <span className="tool-icon" aria-hidden="true">{tool.icon}</span>
        <div className="tool-header-text">
          <h1>{tool.title}</h1>
          <p>{tool.description}</p>
        </div>
      </header>
      <div className="tool-actions">
        <button type="button" className={`btn-ghost fav-btn ${fav ? 'on' : ''}`} onClick={() => toggle(tool.slug)} aria-pressed={fav}>
          {fav ? '★ En favoritos' : '☆ Agregar a favoritos'}
        </button>
        {tool.share && <ShareButton />}
      </div>
      {children}
      {guide && <Guide guide={guide} />}
    </article>
  )
}

function Guide({ guide }) {
  return (
    <section className="guide">
      <h2>{guide.titulo}</h2>
      {guide.pasos && (
        <ol className="guide-steps">
          {guide.pasos.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
      )}
      {guide.faq?.length > 0 && (
        <>
          <h3>Preguntas frecuentes</h3>
          {guide.faq.map((f) => (
            <details key={f.q} className="faq">
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </>
      )}
    </section>
  )
}
