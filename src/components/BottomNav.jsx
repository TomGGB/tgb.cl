import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CATEGORIES, TOOLS } from '../tools/meta'
import { useFavoritos, useRecientes } from '../lib/preferencias'
import { Icon, ToolIcon } from './icons'

// Navegación inferior para celulares: Inicio, Buscar, Favoritos y Herramientas
export default function BottomNav() {
  const { pathname } = useLocation()
  const [sheet, setSheet] = useState(null) // 'favoritos' | 'herramientas' | null

  useEffect(() => setSheet(null), [pathname])
  useEffect(() => {
    document.body.classList.toggle('sheet-open', !!sheet)
    return () => document.body.classList.remove('sheet-open')
  }, [sheet])

  return (
    <>
      <nav className="bottom-nav" aria-label="Navegación principal">
        <Link to="/" className={pathname === '/' && !sheet ? 'active' : ''}>
          <Icon name="House" size={21} />
          <span>Inicio</span>
        </Link>
        <button type="button" onClick={() => { setSheet(null); window.dispatchEvent(new Event('abrir-busqueda')) }}>
          <Icon name="Search" size={21} />
          <span>Buscar</span>
        </button>
        <button type="button" className={sheet === 'favoritos' ? 'active' : ''} onClick={() => setSheet(sheet === 'favoritos' ? null : 'favoritos')} aria-expanded={sheet === 'favoritos'}>
          <Icon name="Star" size={21} />
          <span>Favoritos</span>
        </button>
        <button type="button" className={sheet === 'herramientas' ? 'active' : ''} onClick={() => setSheet(sheet === 'herramientas' ? null : 'herramientas')} aria-expanded={sheet === 'herramientas'}>
          <Icon name="LayoutGrid" size={21} />
          <span>Herramientas</span>
        </button>
      </nav>
      {sheet && <Sheet tipo={sheet} onClose={() => setSheet(null)} />}
    </>
  )
}

function Sheet({ tipo, onClose }) {
  const { favs } = useFavoritos()
  const { recientes } = useRecientes()
  const bySlug = (s) => TOOLS.find((t) => t.slug === s)

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [onClose])

  const Lista = ({ tools }) => (
    <ul className="sheet-list">
      {tools.map((t) => (
        <li key={t.slug}>
          <Link to={`/${t.slug}/`}>
            <ToolIcon tool={t} size={17} />
            <span>{t.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  )

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={tipo === 'favoritos' ? 'Favoritos' : 'Herramientas'} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" aria-hidden="true" />
        <header className="sheet-head">
          <h2>{tipo === 'favoritos' ? 'Tus herramientas' : 'Todas las herramientas'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar"><Icon name="X" size={20} /></button>
        </header>
        <div className="sheet-body">
          {tipo === 'favoritos' ? (
            <>
              <h3>Favoritos</h3>
              {favs.length ? (
                <Lista tools={favs.map(bySlug).filter(Boolean)} />
              ) : (
                <p className="muted small">Toca la estrella de cualquier herramienta para tenerla siempre a mano aquí.</p>
              )}
              {recientes.length > 0 && (
                <>
                  <h3>Usadas hace poco</h3>
                  <Lista tools={recientes.map(bySlug).filter(Boolean)} />
                </>
              )}
            </>
          ) : (
            CATEGORIES.map((c) => (
              <section key={c.id}>
                <h3>{c.name}</h3>
                <Lista tools={TOOLS.filter((t) => t.category === c.id && !t.landing)} />
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
