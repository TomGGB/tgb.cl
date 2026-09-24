import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { SITE, TOOLS } from '../tools/meta'

export default function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
    const tool = TOOLS.find((t) => `/${t.slug}` === pathname.replace(/\/$/, ''))
    document.title = tool ? `${tool.title} | ${SITE.name}` : `${SITE.name} · ${SITE.tagline}`
  }, [pathname])

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
            <NavLink to="/indicadores">Indicadores</NavLink>
            <NavLink to="/sueldo-liquido">Sueldo</NavLink>
            <NavLink to="/feriados">Feriados</NavLink>
            <NavLink to="/rut">RUT</NavLink>
          </nav>
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
            Indicadores desde <a href="https://mindicador.cl" target="_blank" rel="noreferrer">mindicador.cl</a> (Banco
            Central de Chile).
          </p>
        </div>
      </footer>
    </div>
  )
}

export function ToolPage({ tool, children }) {
  return (
    <article className="tool-page">
      <nav className="breadcrumb">
        <Link to="/">Inicio</Link> <span aria-hidden="true">/</span> <span>{tool.title}</span>
      </nav>
      <header className="tool-header">
        <span className="tool-icon" aria-hidden="true">{tool.icon}</span>
        <div>
          <h1>{tool.title}</h1>
          <p>{tool.description}</p>
        </div>
      </header>
      {children}
    </article>
  )
}
