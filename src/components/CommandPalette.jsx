import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TOOLS } from '../tools/meta'
import { useFavoritos, useRecientes } from '../lib/preferencias'

const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export function buscarHerramientas(q) {
  const nq = normalize(q.trim())
  if (!nq) return TOOLS
  const words = nq.split(/\s+/)
  return TOOLS.map((t) => {
    const title = normalize(t.title)
    const hay = normalize(`${t.title} ${t.short} ${t.keywords}`)
    if (!words.every((w) => hay.includes(w))) return null
    const score = (title.startsWith(nq) ? 3 : 0) + (title.includes(nq) ? 2 : 0) + (normalize(t.keywords).includes(nq) ? 1 : 0)
    return { t, score }
  })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.t)
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const input = useRef(null)
  const navigate = useNavigate()
  const { favs } = useFavoritos()
  const { recientes } = useRecientes()

  useEffect(() => {
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('abrir-busqueda', onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('abrir-busqueda', onOpen)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setQ('')
      setActive(0)
      setTimeout(() => input.current?.focus(), 0)
    }
  }, [open])

  const results = useMemo(() => {
    if (q.trim()) return buscarHerramientas(q)
    // sin texto: favoritos y recientes primero
    const first = [...new Set([...favs, ...recientes])].map((s) => TOOLS.find((t) => t.slug === s)).filter(Boolean)
    return [...first, ...TOOLS.filter((t) => !first.includes(t))]
  }, [q, favs, recientes])

  useEffect(() => setActive(0), [q])

  if (!open) return null

  const go = (t) => {
    setOpen(false)
    navigate(`/${t.slug}/`)
  }

  return (
    <div className="palette-backdrop" onMouseDown={() => setOpen(false)}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Buscar herramienta" onMouseDown={(e) => e.stopPropagation()}>
        <input
          ref={input}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="¿Qué necesitas? Sueldo, UF, sismos, bencina…"
          aria-label="Buscar herramienta"
          aria-controls="palette-list"
          aria-activedescendant={results[active] ? `pal-${results[active].slug}` : undefined}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActive((a) => Math.min(a + 1, results.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((a) => Math.max(a - 1, 0))
            } else if (e.key === 'Enter' && results[active]) go(results[active])
            else if (e.key === 'Escape') setOpen(false)
          }}
        />
        <ul id="palette-list" role="listbox" className="palette-list">
          {results.map((t, i) => (
            <li
              key={t.slug}
              id={`pal-${t.slug}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? 'active' : ''}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(t)}
              ref={i === active ? (el) => el?.scrollIntoView({ block: 'nearest' }) : undefined}
            >
              <span className="palette-icon" aria-hidden="true">{t.icon}</span>
              <span className="palette-text">
                <strong>{t.title}</strong>
                <span>{t.short}</span>
              </span>
              {favs.includes(t.slug) && <span className="palette-star" aria-label="Favorito">★</span>}
            </li>
          ))}
          {!results.length && <li className="palette-empty">Sin resultados para “{q}”</li>}
        </ul>
        <div className="palette-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> navegar</span>
          <span><kbd>Enter</kbd> abrir</span>
          <span><kbd>Esc</kbd> cerrar</span>
        </div>
      </div>
    </div>
  )
}
