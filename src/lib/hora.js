// Utilidades de zona horaria basadas en la base de datos tz del navegador (Intl).

export const ZONAS = [
  { id: 'America/Santiago', nombre: 'Chile continental', detalle: 'Desde Arica hasta Los Lagos' },
  { id: 'America/Coyhaique', fallback: 'America/Punta_Arenas', nombre: 'Aysén', detalle: 'Sin cambio de hora desde 2025' },
  { id: 'America/Punta_Arenas', nombre: 'Magallanes', detalle: 'Sin cambio de hora desde 2016' },
  { id: 'Pacific/Easter', nombre: 'Rapa Nui', detalle: 'Isla de Pascua' },
]

export function zonaSoportada(tz) {
  try {
    new Intl.DateTimeFormat('es-CL', { timeZone: tz })
    return true
  } catch {
    return false
  }
}

export const resolverZona = (z) => (zonaSoportada(z.id) ? z.id : z.fallback ?? z.id)

// Desfase de la zona respecto de UTC en minutos (p. ej. -180 para UTC−3)
export function offsetMinutos(tz, date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date)
  const get = (t) => Number(parts.find((p) => p.type === t).value)
  const asUTC = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'))
  return Math.round((asUTC - Math.floor(date.getTime() / 1000) * 1000) / 60000)
}

export const formatOffset = (min) => {
  const sign = min <= 0 ? '−' : '+'
  const a = Math.abs(min)
  return `UTC${sign}${Math.floor(a / 60)}${a % 60 ? `:${String(a % 60).padStart(2, '0')}` : ''}`
}

// Próximas transiciones de horario (hasta `max`) en los próximos ~2 años
export function proximosCambios(tz, desde = new Date(), max = 2) {
  const out = []
  const DAY = 86400000
  let prev = desde.getTime()
  let prevOff = offsetMinutos(tz, desde)
  for (let t = prev + DAY; t < desde.getTime() + 800 * DAY && out.length < max; t += DAY) {
    const off = offsetMinutos(tz, new Date(t))
    if (off !== prevOff) {
      // búsqueda binaria del minuto exacto
      let lo = t - DAY
      let hi = t
      while (hi - lo > 60000) {
        const mid = Math.floor((lo + hi) / 2 / 60000) * 60000
        if (offsetMinutos(tz, new Date(mid)) === prevOff) lo = mid
        else hi = mid
      }
      out.push({ instante: new Date(hi), antes: prevOff, despues: off })
      prevOff = off
    }
    prev = t
  }
  return out
}

export function formatEnZona(date, tz, opts) {
  return new Intl.DateTimeFormat('es-CL', { timeZone: tz, ...opts }).format(date)
}
