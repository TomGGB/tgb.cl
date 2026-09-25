import { createContext, useContext, useEffect, useId, useRef, useState } from 'react'
import { GLOSARIO } from '../tools/glosario'
import { Icon } from './icons'

const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
const DEFS = Object.fromEntries(Object.entries(GLOSARIO).map(([k, v]) => [normalize(k), v]))

/**
 * Término con definición: se muestra subrayado y al tocarlo abre una explicación breve.
 * <Term>imponible</Term> o <Term k="cae">CAE</Term>
 */
export function Term({ k, children }) {
  const key = normalize(k ?? String(children))
  const def = DEFS[key]
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const id = useId()

  useEffect(() => {
    if (!open) return
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  if (!def) return children
  return (
    <span className="term" ref={ref}>
      <button type="button" className="term-btn" aria-expanded={open} aria-controls={id} onClick={(e) => { e.preventDefault(); setOpen((o) => !o) }}>
        {children}
      </button>
      {open && (
        <span className="term-pop" id={id} role="note">
          {def}
        </span>
      )}
    </span>
  )
}

/** Botones de valores típicos bajo un campo */
export function Presets({ options, value, onChange, label = 'Valores típicos' }) {
  return (
    <div className="presets" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.label} type="button" className={value === o.value ? 'active' : ''} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ---------- Resultado siempre visible (celular) ----------

export const ResultContext = createContext(() => {})

/** Cada herramienta publica su resultado principal: useResult('Sueldo líquido', '$818.200') */
export function useResult(label, value) {
  const set = useContext(ResultContext)
  useEffect(() => {
    set(value ? { label, value } : null)
  }, [label, value, set])
  useEffect(() => () => set(null), [set])
}

/** Barra inferior con el resultado, visible solo cuando la tarjeta de resultado no está en pantalla */
export function ResultBar({ summary }) {
  const [hidden, setHidden] = useState(true)

  useEffect(() => {
    if (!summary) return
    const target = document.querySelector('.tool-page .result')
    if (!target) return
    const io = new IntersectionObserver(([e]) => setHidden(e.isIntersecting || e.boundingClientRect.top < 0), { threshold: 0.15 })
    io.observe(target)
    return () => io.disconnect()
  }, [summary])

  if (!summary) return null
  return (
    <button
      type="button"
      className={`result-bar ${hidden ? 'is-hidden' : ''}`}
      onClick={() => document.querySelector('.tool-page .result')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : 0}
    >
      <span className="result-bar-label">{summary.label}</span>
      <strong>{summary.value}</strong>
      <Icon name="ChevronDown" size={18} />
    </button>
  )
}
