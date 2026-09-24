// Feriados nacionales de Chile calculados según la legislación vigente.
// Los feriados regionales y los de elecciones se agregan en EXTRAS.

const d = (y, m, day) => new Date(y, m - 1, day)

// Algoritmo de Butcher para el Domingo de Resurrección
function easter(y) {
  const a = y % 19
  const b = Math.floor(y / 100)
  const c = y % 100
  const dd = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - dd - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return d(y, month, day)
}

const addDays = (date, n) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + n)

// Ley 19.668: si cae martes, miércoles o jueves se corre al lunes anterior; si cae viernes, al lunes siguiente.
function lunesMasCercano(date) {
  const dow = date.getDay()
  if (dow >= 2 && dow <= 4) return addDays(date, -(dow - 1))
  if (dow === 5) return addDays(date, 3)
  return date
}

// Solsticio de invierno (hora de Chile). Fuera de la tabla se asume el 21.
const SOLSTICIO = { 2022: 21, 2023: 21, 2024: 20, 2025: 20, 2026: 21, 2027: 21, 2028: 20, 2029: 20, 2030: 21, 2031: 21, 2032: 20 }

// Feriados puntuales (elecciones, leyes especiales)
const EXTRAS = {
  2024: [
    { date: [10, 27], name: 'Elecciones Municipales y Regionales' },
  ],
  2025: [
    { date: [11, 16], name: 'Elecciones Presidenciales y Parlamentarias' },
    { date: [12, 14], name: 'Segunda Vuelta Presidencial' },
  ],
}

export function getFeriados(year) {
  const pascua = easter(year)
  const list = [
    { date: d(year, 1, 1), name: 'Año Nuevo', irrenunciable: true },
    { date: addDays(pascua, -2), name: 'Viernes Santo', religioso: true },
    { date: addDays(pascua, -1), name: 'Sábado Santo', religioso: true },
    { date: d(year, 5, 1), name: 'Día Nacional del Trabajo', irrenunciable: true },
    { date: d(year, 5, 21), name: 'Día de las Glorias Navales' },
    { date: d(year, 6, SOLSTICIO[year] ?? 21), name: 'Día Nacional de los Pueblos Indígenas' },
    { date: lunesMasCercano(d(year, 6, 29)), name: 'San Pedro y San Pablo', religioso: true },
    { date: d(year, 7, 16), name: 'Día de la Virgen del Carmen', religioso: true },
    { date: d(year, 8, 15), name: 'Asunción de la Virgen', religioso: true },
    { date: d(year, 9, 18), name: 'Independencia Nacional', irrenunciable: true },
    { date: d(year, 9, 19), name: 'Día de las Glorias del Ejército', irrenunciable: true },
    { date: lunesMasCercano(d(year, 10, 12)), name: 'Encuentro de Dos Mundos' },
    { date: d(year, 11, 1), name: 'Día de Todos los Santos', religioso: true },
    { date: d(year, 12, 8), name: 'Inmaculada Concepción', religioso: true },
    { date: d(year, 12, 25), name: 'Navidad', irrenunciable: true, religioso: true },
  ]

  // Ley 20.215: si el 18 cae martes, el lunes 17 es feriado
  if (d(year, 9, 18).getDay() === 2) list.push({ date: d(year, 9, 17), name: 'Fiestas Patrias (feriado adicional)' })
  // Ley 20.983: si el 19 cae jueves, el viernes 20 es feriado
  if (d(year, 9, 19).getDay() === 4) list.push({ date: d(year, 9, 20), name: 'Fiestas Patrias (feriado adicional)' })

  // Día de las Iglesias Evangélicas: si cae martes pasa al viernes anterior; si cae miércoles, al viernes siguiente
  const evang = d(year, 10, 31)
  const evDow = evang.getDay()
  list.push({
    date: evDow === 2 ? addDays(evang, -4) : evDow === 3 ? addDays(evang, 2) : evang,
    name: 'Día de las Iglesias Evangélicas y Protestantes',
    religioso: true,
  })

  for (const e of EXTRAS[year] ?? []) {
    const date = d(year, e.date[0], e.date[1])
    if (!list.some((f) => sameDay(f.date, date))) list.push({ date, name: e.name })
  }

  return list.sort((a, b) => a.date - b.date)
}

export const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

export function isFeriado(date) {
  return getFeriados(date.getFullYear()).find((f) => sameDay(f.date, date)) ?? null
}

export function proximoFeriado(from = new Date()) {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const all = [...getFeriados(today.getFullYear()), ...getFeriados(today.getFullYear() + 1)]
  return all.find((f) => f.date >= today)
}

// Días hábiles entre dos fechas (ambas inclusive). Lunes a viernes, o lunes a sábado si incluirSabado.
export function diasHabiles(desde, hasta, { incluirSabado = false } = {}) {
  let count = 0
  let start = desde <= hasta ? desde : hasta
  const end = desde <= hasta ? hasta : desde
  for (let cur = new Date(start); cur <= end; cur = addDays(cur, 1)) {
    const dow = cur.getDay()
    if (dow === 0 || (dow === 6 && !incluirSabado)) continue
    if (isFeriado(cur)) continue
    count++
  }
  return count
}

// Suma n días hábiles a una fecha (sin contar la fecha de inicio)
export function sumarDiasHabiles(desde, n, opts = {}) {
  let cur = new Date(desde)
  let added = 0
  while (added < n) {
    cur = addDays(cur, 1)
    if (diasHabiles(cur, cur, opts) === 1) added++
  }
  return cur
}

// Fines de semana largos: feriados que caen lunes o viernes (o sábado/domingo junto a otro)
export function esFinDeSemanaLargo(f) {
  const dow = f.date.getDay()
  return dow === 1 || dow === 5
}
