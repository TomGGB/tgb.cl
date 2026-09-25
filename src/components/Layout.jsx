import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { SITE, TOOLS, CATEGORIES } from '../tools/meta'
import { GUIDES } from '../tools/guides'
import { ShareButton, ThemeToggle } from './ui'
import CommandPalette from './CommandPalette'
import { useFavoritos, useRecientes } from '../lib/preferencias'
import { Icon, ToolIcon } from './icons'
import { ShareTextContext, whatsappUrl } from '../lib/share'
import { ResultContext, ResultBar } from './ux'
import BottomNav from './BottomNav'
import { relacionadas } from '../tools/relacionadas'

export default function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
    const tool = TOOLS.find((t) => `/${t.slug}` === pathname.replace(/\/$/, ''))
    if (tool?.landing) return // las páginas de valores del día ponen su propio título con el valor
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
      <BottomNav />
    </div>
  )
}

export function ToolPage({ tool, children }) {
  const { isFav, toggle } = useFavoritos()
  const { registrar } = useRecientes()
  const fav = isFav(tool.slug)
  const guide = GUIDES[tool.slug]
  const cat = CATEGORIES.find((c) => c.id === tool.category)

  const [shareText, setShareText] = useState(null)
  const [summary, setSummary] = useState(null)
  const [resetKey, setResetKey] = useState(0)
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const sugeridas = relacionadas(tool, TOOLS)
  const restablecer = () => {
    navigate(pathname, { replace: true })
    setResetKey((k) => k + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
        {(tool.share || shareText) && (
          <a
            className="btn-ghost whatsapp-btn"
            href={whatsappUrl(shareText ?? tool.title, typeof window !== 'undefined' ? window.location.href : '')}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => {
              // la URL puede haber cambiado (valores del cálculo): se arma al hacer clic
              e.currentTarget.href = whatsappUrl(shareText ?? tool.title, window.location.href)
            }}
          >
            <WhatsAppIcon />
            WhatsApp
          </a>
        )}
        {tool.share && <ShareButton />}
        {search && (
          <button type="button" className="btn-ghost" onClick={restablecer} title="Vuelve a los valores iniciales">
            <Icon name="RotateCcw" size={15} />
            Restablecer
          </button>
        )}
      </div>
      <ShareTextContext.Provider value={setShareText}>
        <ResultContext.Provider value={setSummary}>
          <div key={resetKey}>{children}</div>
        </ResultContext.Provider>
      </ShareTextContext.Provider>
      <ResultBar summary={summary} />
      {sugeridas.length > 0 && (
        <section className="related">
          <h2>También te puede servir</h2>
          <ul>
            {sugeridas.map((t) => (
              <li key={t.slug}>
                <Link to={`/${t.slug}/`} className="related-card">
                  <ToolIcon tool={t} size={19} />
                  <span>
                    <strong>{t.title}</strong>
                    <span>{t.short}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
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

// Logo de WhatsApp (Lucide no incluye marcas)
function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4C2.7 15.6 2.2 13.8 2.2 12 2.2 6.6 6.6 2.2 12 2.2c2.6 0 5.1 1 6.9 2.9 1.8 1.8 2.9 4.3 2.9 6.9 0 5.4-4.4 9.8-9.8 9.8zm8.4-18.2C18.1 1.4 15.1.2 12 .2 5.5.2.2 5.5.2 12c0 2.1.5 4.1 1.6 5.9L.1 24l6.3-1.6c1.7.9 3.7 1.4 5.6 1.4 6.5 0 11.8-5.3 11.8-11.8 0-3.2-1.2-6.1-3.4-8.4z" />
    </svg>
  )
}
