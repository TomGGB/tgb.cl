import { useEffect, useSyncExternalStore } from 'react'

const API = 'https://mindicador.cl/api'
const CACHE_KEY = 'indicadores:v2'
const REFRESH_MS = 5 * 60 * 1000 // mientras la página está abierta
const MIN_GAP_MS = 30 * 1000 // no consultar más de una vez cada 30 s

// Valores de respaldo por si la API no responde y no hay nada guardado (septiembre 2026)
export const FALLBACK = {
  uf: { nombre: 'Unidad de fomento (UF)', valor: 41008.1 },
  utm: { nombre: 'Unidad Tributaria Mensual (UTM)', valor: 71721 },
  dolar: { nombre: 'Dólar observado', valor: 959.39 },
  euro: { nombre: 'Euro', valor: 1120 },
}

// ---------- Almacén compartido: una sola consulta para todos los componentes ----------
// Se muestra al instante lo último guardado y siempre se pide el valor actual a la API.

function readStored() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

let state = (() => {
  const stored = readStored()
  return { data: stored?.data ?? null, updatedAt: stored?.ts ?? null, loading: true, error: null, fresh: false }
})()
const listeners = new Set()
const emit = () => listeners.forEach((l) => l())
const setState = (patch) => {
  state = { ...state, ...patch }
  emit()
}

let inflight = null
let lastFetch = 0

export function refreshIndicadores({ force = false } = {}) {
  if (inflight) return inflight
  if (!force && Date.now() - lastFetch < MIN_GAP_MS) return Promise.resolve(state.data)
  lastFetch = Date.now()
  setState({ loading: true })
  inflight = fetch(API, { cache: 'no-store' })
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    })
    .then((data) => {
      const ts = Date.now()
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts, data }))
      } catch {
        /* almacenamiento no disponible */
      }
      setState({ data, updatedAt: ts, loading: false, error: null, fresh: true })
      return data
    })
    .catch((error) => {
      setState({ loading: false, error })
      return state.data
    })
    .finally(() => {
      inflight = null
    })
  return inflight
}

// Compatibilidad: devuelve los datos actuales (consulta la API si hace falta)
export async function fetchIndicadores() {
  return (await refreshIndicadores()) ?? state.data
}

let watchers = 0
function startWatching() {
  const onVisible = () => document.visibilityState === 'visible' && refreshIndicadores()
  const id = setInterval(() => document.visibilityState === 'visible' && refreshIndicadores(), REFRESH_MS)
  document.addEventListener('visibilitychange', onVisible)
  window.addEventListener('online', onVisible)
  return () => {
    clearInterval(id)
    document.removeEventListener('visibilitychange', onVisible)
    window.removeEventListener('online', onVisible)
  }
}
let stopWatching = null

function subscribe(cb) {
  listeners.add(cb)
  if (watchers++ === 0) stopWatching = startWatching()
  return () => {
    listeners.delete(cb)
    if (--watchers === 0) stopWatching?.()
  }
}

export function useIndicadores() {
  const snap = useSyncExternalStore(subscribe, () => state, () => state)
  useEffect(() => {
    refreshIndicadores()
  }, [])
  const get = (code) => snap.data?.[code]?.valor ?? FALLBACK[code]?.valor
  // `loading` solo es verdadero cuando no hay nada que mostrar todavía
  return { ...snap, loading: snap.loading && !snap.data, refreshing: snap.loading, get }
}

// ---------- Series y valores históricos ----------

export async function fetchSerie(code, year) {
  const r = await fetch(`${API}/${code}${year ? `/${year}` : ''}`, { cache: 'no-store' })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  const json = await r.json()
  return json.serie.map((p) => ({ fecha: new Date(p.fecha), valor: p.valor })).reverse()
}

// Valor de un indicador en una fecha específica (dd-mm-yyyy). Los valores pasados no cambian.
export async function fetchValorEnFecha(code, date) {
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const r = await fetch(`${API}/${code}/${dd}-${mm}-${date.getFullYear()}`)
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  const json = await r.json()
  return json.serie[0]?.valor ?? null
}
