import { useId, useState, useEffect } from 'react'
import { parseNum } from '../lib/format'

export function Field({ label, hint, children }) {
  const id = useId()
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {typeof children === 'function' ? children(id) : children}
      {hint && <small className="hint">{hint}</small>}
    </div>
  )
}

// Input numérico que muestra separador de miles mientras se escribe
export function NumberInput({ id, value, onChange, decimals = 0, prefix, suffix, ...rest }) {
  const fmt = (n) =>
    n === '' || n === null || n === undefined
      ? ''
      : Number(n).toLocaleString('es-CL', { maximumFractionDigits: decimals })
  const [text, setText] = useState(fmt(value))

  useEffect(() => {
    if (parseNum(text) !== value) setText(fmt(value))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <div className="input-wrap">
      {prefix && <span className="affix">{prefix}</span>}
      <input
        id={id}
        inputMode={decimals ? 'decimal' : 'numeric'}
        value={text}
        onChange={(e) => {
          let raw = e.target.value.replace(/[^\d,]/g, '')
          if (!decimals) raw = raw.replace(/,/g, '')
          const [int = '', dec] = raw.split(',')
          const intFmt = int ? Number(int).toLocaleString('es-CL') : ''
          const next = dec !== undefined ? `${intFmt || '0'},${dec.slice(0, decimals)}` : intFmt
          setText(next)
          onChange(raw ? parseNum(next) : 0)
        }}
        {...rest}
      />
      {suffix && <span className="affix">{suffix}</span>}
    </div>
  )
}

export function Segmented({ options, value, onChange, label }) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          className={value === o.value ? 'active' : ''}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function ResultTable({ rows }) {
  return (
    <dl className="result-table">
      {rows.filter(Boolean).map((r) => (
        <div key={r.label} className={r.strong ? 'strong' : r.muted ? 'muted' : ''}>
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function CopyButton({ text, label = 'Copiar' }) {
  const [ok, setOk] = useState(false)
  return (
    <button
      type="button"
      className="btn-ghost"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setOk(true)
          setTimeout(() => setOk(false), 1500)
        } catch {
          /* sin permiso de portapapeles */
        }
      }}
    >
      {ok ? '✓ Copiado' : label}
    </button>
  )
}

export function Note({ children }) {
  return <p className="note">{children}</p>
}

export function ShareButton() {
  const [msg, setMsg] = useState(null)
  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
        await navigator.share({ title: document.title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setMsg('✓ Enlace copiado')
    } catch (e) {
      if (e?.name !== 'AbortError') setMsg('No se pudo copiar')
    }
    setTimeout(() => setMsg(null), 2000)
  }
  return (
    <button type="button" className="btn-ghost share-btn" onClick={share} title="Copia un enlace con los valores actuales">
      {msg ?? '🔗 Compartir cálculo'}
    </button>
  )
}

const THEMES = [
  { id: 'auto', icon: '🌓', label: 'Tema automático' },
  { id: 'light', icon: '☀️', label: 'Tema claro' },
  { id: 'dark', icon: '🌙', label: 'Tema oscuro' },
]

function readTheme() {
  try {
    return localStorage.getItem('theme') || 'auto'
  } catch {
    return 'auto'
  }
}

export function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'auto') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', theme)
  const dark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#171b21' : '#0b3a82')
}

export function ThemeToggle() {
  const [theme, setTheme] = useState(readTheme)
  useEffect(() => {
    applyTheme(theme)
    try {
      if (theme === 'auto') localStorage.removeItem('theme')
      else localStorage.setItem('theme', theme)
    } catch {
      /* sin almacenamiento */
    }
  }, [theme])
  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0]
  const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length]
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setTheme(next.id)}
      aria-label={`${current.label}. Cambiar a ${next.label.toLowerCase()}`}
      title={`${current.label} (clic para ${next.label.toLowerCase()})`}
    >
      <span aria-hidden="true">{current.icon}</span>
    </button>
  )
}
