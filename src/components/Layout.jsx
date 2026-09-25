import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { SITE, TOOLS, CATEGORIES } from '../tools/meta'
import { GUIDES } from '../tools/guides'
import { ShareButton, ThemeToggle } from './ui'
import CommandPalette from './CommandPalette'
import { useFavoritos, useRecientes } from '../lib/preferencias'
import { Icon, ToolIcon } from './icons'

export default function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
    const tool = TOOLS.find((t) => `/${t.slug}` === pathname.replace(/\/$/, ''))
    document.title = tool ? `${tool.title} | ${SITE.name}` : `${SITE.name}: ${SITE.tagline}`
  }, [pathname])

  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

  return (
    <div className="app">
      <a href="#contenido" className="skip-link">Ir al contenido</a>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand" aria-label="tgb.cl, inicio">
            <span className="brand-mark" aria-hidden="true">
              <span />
              <span />
            </span>
            <span className="brand-name">tgb<span>.cl</span></span>
          </Link>
          <nav className="header-nav" aria-label="Principal">
            <NavLink to="/indicadores/">Indicadores</NavLink>
            <NavLink to="/sueldo-liquido/">Sueldo</NavLink>
            <NavLink to="/feriados/">Feriados</NavLink>
            <NavLink to="/bencinas/">Bencinas</NavLink>
          </nav>
          <button type="button" className="search-trigger" onClick={() => window.dispatchEvent(new Event('abrir-busqueda'))} aria-label="Buscar herramienta">
            <Icon name="Search" size={17} />
            <span className="search-trigger-text">Buscar</span>
            <kbd>{isMac ? '⌘' : 'Ctrl'} K</kbd>
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main className="container main" id="contenido">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            {CATEGORIES.map((c) => (
              <nav key={c.id} aria-label={c.name}>
                <h2>{c.name}</h2>
                <ul>
                  {TOOLS.filter((t) => t.category === c.id).map((t) => (
                    <li key={t.slug}>
                      <Link to={`/${t.slug}/`}>{t.title}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
          <div className="footer-bottom">
            <p>
              <strong>{SITE.name}</strong> reúne herramientas gratuitas para Chile. Los cálculos son referenciales: confirma
              siempre con la fuente oficial.
            </p>
            <p>
              Datos de <a href="https://mindicador.cl" target="_blank" rel="noreferrer">mindicador.cl</a>,{' '}
              <a href="https://www.bencinaenlinea.cl" target="_blank" rel="noreferrer">Bencina en Línea</a>,{' '}
              <a href="https://earthquake.usgs.gov" target="_blank" rel="noreferrer">USGS</a> y{' '}
              <a href="https://open-meteo.com" target="_blank" rel="noreferrer">Open-Meteo</a>. Mapas de OpenStreetMap.
            </p>
          </div>
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
  const cat = CATEGORIES.find((c) => c.id === tool.category)

  useEffect(() => registrar(tool.slug), [tool.slug, registrar])

  return (
    <article className="tool-page" data-cat={tool.category}>
      <nav className="breadcrumb" aria-label="Ruta">
        <Link to="/">Inicio</Link>
        <Icon name="ChevronRight" size={14} />
        <span>{cat?.name}</span>
      </nav>
      <header className="tool-header">
        <ToolIcon tool={tool} size={28} className="lg" />
        <div className="tool-header-text">
          <h1>{tool.title}</h1>
          <p>{tool.description}</p>
        </div>
      </header>
      <div className="tool-actions">
        <button type="button" className={`btn-ghost fav-btn ${fav ? 'on' : ''}`} onClick={() => toggle(tool.slug)} aria-pressed={fav}>
          <Icon name="Star" size={16} fill={fav ? 'currentColor' : 'none'} />
          {fav ? 'En favoritos' : 'Agregar a favoritos'}
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
