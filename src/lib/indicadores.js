import { useEffect, useState } from 'react'

const API = 'https://mindicador.cl/api'
const CACHE_KEY = 'indicadores:v1'
const TTL = 1000 * 60 * 60 // 1 hora

// Valores de respaldo por si la API no responde (septiembre 2026)
export const FALLBACK = {
  uf: { nombre: 'Unidad de fomento (UF)', valor: 41008.1 },
  utm: { nombre: 'Unidad Tributaria Mensual (UTM)', valor: 71721 },
  dolar: { nombre: 'Dólar observado', valor: 959.39 },
  euro: { nombre: 'Euro', valor: 1120 },
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Date.now() - parsed.ts < TTL ? parsed.data : null
  } catch {
    return null
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }))
  } catch {
    /* almacenamiento no disponible */
  }
}

let inflight = null

export async function fetchIndicadores() {
  const cached = readCache()
  if (cached) return cached
  if (!inflight) {
    inflight = fetch(API)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => {
        writeCache(data)
        return data
      })
      .finally(() => {
        inflight = null
      })
  }
  return inflight
}

export function useIndicadores() {
  const [state, setState] = useState({ data: readCache(), loading: !readCache(), error: null })

  useEffect(() => {
    if (state.data) return
    let alive = true
    fetchIndicadores()
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((error) => alive && setState({ data: null, loading: false, error }))
    return () => {
      alive = false
    }
  }, [])

  const get = (code) => state.data?.[code]?.valor ?? FALLBACK[code]?.valor
  return { ...state, get }
}

export async function fetchSerie(code, year) {
  const r = await fetch(`${API}/${code}${year ? `/${year}` : ''}`)
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  const json = await r.json()
  return json.serie.map((p) => ({ fecha: new Date(p.fecha), valor: p.valor })).reverse()
}

// Valor de un indicador en una fecha específica (dd-mm-yyyy)
export async function fetchValorEnFecha(code, date) {
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const r = await fetch(`${API}/${code}/${dd}-${mm}-${date.getFullYear()}`)
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  const json = await r.json()
  return json.serie[0]?.valor ?? null
}
