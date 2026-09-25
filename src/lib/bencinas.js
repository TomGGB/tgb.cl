// Precios de combustibles de Bencina en Línea (Comisión Nacional de Energía).

const API = 'https://api.bencinaenlinea.cl/api'

export const COMBUSTIBLES = [
  { id: '93', label: 'Gasolina 93' },
  { id: '95', label: 'Gasolina 95' },
  { id: '97', label: 'Gasolina 97' },
  { id: 'DI', label: 'Diésel' },
  { id: 'KE', label: 'Kerosene (parafina)' },
  { id: 'GLP', label: 'GLP vehicular' },
  { id: 'GNC', label: 'GNC' },
]

const MAX_ANTIGUEDAD_DIAS = 45

function normalizar(estaciones, marcas) {
  const nombreMarca = new Map(marcas.map((m) => [m.id, m.nombre]))
  const hoy = Date.now()
  return estaciones
    .filter((e) => !e.en_mantenimiento_bandera && e.latitud && e.longitud)
    .map((e) => {
      const precios = {}
      for (const c of e.combustibles ?? []) {
        const asistido = c.nombre_corto.startsWith('A') && c.nombre_corto.length > 2
        const base = asistido ? c.nombre_corto.slice(1) : c.nombre_corto
        const precio = parseFloat(c.precio)
        const fecha = c.precio_fecha ? new Date(c.precio_fecha.replace(' ', 'T') + '-03:00') : null
        // descarta valores de relleno (99.999), precios absurdos o sin actualizar hace más de 45 días
        if (!Number.isFinite(precio) || precio < 300 || precio > 3500) continue
        if (!fecha || (hoy - fecha) / 86400000 > MAX_ANTIGUEDAD_DIAS) continue
        const actual = precios[base]
        // guarda el precio de autoservicio y, aparte, el asistido
        precios[base] = {
          ...actual,
          [asistido ? 'asistido' : 'auto']: precio,
          fecha: actual?.fecha && actual.fecha > fecha ? actual.fecha : fecha,
          unidad: c.unidad_cobro,
        }
      }
      return {
        id: e.id,
        marca: nombreMarca.get(e.marca) ?? 'Sin marca',
        logo: e.logo,
        direccion: (e.direccion ?? '').trim().replace(/\s+0$/, ''),
        comuna: e.comuna,
        region: e.region,
        lat: parseFloat(e.latitud),
        lon: parseFloat(e.longitud),
        precios,
      }
    })
    .filter((e) => Object.keys(e.precios).length > 0)
}

let cache = null

export async function fetchBencinas() {
  if (cache) return cache
  const [est, mar] = await Promise.all([
    fetch(`${API}/busqueda_estacion_filtro`).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))),
    fetch(`${API}/marca`).then((r) => (r.ok ? r.json() : { data: [] })).catch(() => ({ data: [] })),
  ])
  cache = normalizar(est.data ?? [], mar.data ?? [])
  return cache
}

// Precio más conveniente de una estación para un combustible (autoservicio si existe)
export const precioDe = (e, comb) => {
  const p = e.precios[comb]
  if (!p) return null
  return p.auto ?? p.asistido ?? null
}

export function mediana(arr) {
  if (!arr.length) return null
  const s = [...arr].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

export function distanciaKm(a, b) {
  const R = 6371
  const toRad = (x) => (x * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
