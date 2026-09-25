import { useEffect, useState, useSyncExternalStore } from 'react'

// Preferencia de tema: 'auto' | 'light' | 'dark', guardada en localStorage.
// El atributo data-theme en <html> se aplica antes de cargar React (ver index.html).

const listeners = new Set()
const emit = () => listeners.forEach((l) => l())

export function getThemePref() {
  try {
    return localStorage.getItem('theme') || 'auto'
  } catch {
    return 'auto'
  }
}

export function setThemePref(pref) {
  try {
    if (pref === 'auto') localStorage.removeItem('theme')
    else localStorage.setItem('theme', pref)
  } catch {
    /* sin almacenamiento */
  }
  const root = document.documentElement
  if (pref === 'auto') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', pref)
  const dark = resolveTheme() === 'dark'
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0e1624' : '#1f4e8c')
  emit()
}

const media = () => window.matchMedia('(prefers-color-scheme: dark)')

export function resolveTheme() {
  const attr = document.documentElement.getAttribute('data-theme')
  if (attr === 'dark' || attr === 'light') return attr
  return media().matches ? 'dark' : 'light'
}

function subscribe(cb) {
  listeners.add(cb)
  const m = media()
  m.addEventListener('change', cb)
  return () => {
    listeners.delete(cb)
    m.removeEventListener('change', cb)
  }
}

// Tema efectivo ('light' | 'dark'), reactivo a la preferencia y al sistema
export function useResolvedTheme() {
  return useSyncExternalStore(subscribe, resolveTheme, () => 'light')
}

export function useThemePref() {
  const [pref, setPref] = useState(getThemePref)
  useEffect(() => {
    const cb = () => setPref(getThemePref())
    listeners.add(cb)
    return () => listeners.delete(cb)
  }, [])
  return [pref, setThemePref]
}
