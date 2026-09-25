import { isFeriado } from './feriados'

export const CAUSALES = [
  { id: 'necesidades', label: 'Necesidades de la empresa (art. 161)', indemniza: true },
  { id: 'renuncia', label: 'Renuncia voluntaria (art. 159 n°2)', indemniza: false },
  { id: 'mutuo', label: 'Mutuo acuerdo (art. 159 n°1)', indemniza: false },
  { id: 'plazo', label: 'Vencimiento del plazo o término de la obra', indemniza: false },
]

const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

// Diferencia en años, meses y días (inclusiva del día de término)
export function antiguedad(inicio, termino) {
  const fin = addDays(termino, 1)
  let y = fin.getFullYear() - inicio.getFullYear()
  let m = fin.getMonth() - inicio.getMonth()
  let d = fin.getDate() - inicio.getDate()
  if (d < 0) {
    m--
    d += new Date(fin.getFullYear(), fin.getMonth(), 0).getDate()
  }
  if (m < 0) {
    y--
    m += 12
  }
  return { anios: y, meses: m, dias: d }
}

// Años para la indemnización: la fracción superior a 6 meses cuenta como año completo. Tope de 11 años.
export function aniosIndemnizacion({ anios, meses, dias }) {
  if (anios < 1) return 0
  const extra = meses > 6 || (meses === 6 && dias > 0) ? 1 : 0
  return Math.min(11, anios + extra)
}

// Días hábiles de feriado proporcional acumulados desde el último aniversario del contrato
export function vacacionesProporcionales(ant) {
  return 1.25 * (ant.meses + ant.dias / 30)
}

// Convierte días hábiles pendientes en días corridos a pagar, contando desde el día siguiente al término.
// Los sábados, domingos y feriados que caen dentro de ese período también se pagan.
export function habilesACorridos(termino, habiles) {
  const enteros = Math.floor(habiles + 1e-9)
  const fraccion = habiles - enteros
  let corridos = 0
  let usados = 0
  let cur = termino
  while (usados < enteros) {
    cur = addDays(cur, 1)
    corridos++
    const dow = cur.getDay()
    if (dow !== 0 && dow !== 6 && !isFeriado(cur)) usados++
  }
  return corridos + fraccion
}

export function calcularFiniquito({
  inicio,
  termino,
  sueldo,
  causal,
  avisoDado = false,
  vacacionesPendientes = 0,
  diasTrabajadosMes = 0,
  uf,
}) {
  const ant = antiguedad(inicio, termino)
  const baseTope = Math.min(sueldo, 90 * uf)
  const c = CAUSALES.find((x) => x.id === causal)

  const anios = c.indemniza ? aniosIndemnizacion(ant) : 0
  const indemnizacion = Math.round(anios * baseTope)
  const aviso = c.indemniza && !avisoDado ? Math.round(baseTope) : 0

  const habilesProp = vacacionesProporcionales(ant)
  const habilesTotal = habilesProp + vacacionesPendientes
  const corridos = habilesACorridos(termino, habilesTotal)
  const vacaciones = Math.round((sueldo / 30) * corridos)

  const sueldoPendiente = Math.round((sueldo / 30) * diasTrabajadosMes)

  return {
    antiguedad: ant,
    aniosIndemnizacion: anios,
    topado: sueldo > baseTope,
    indemnizacion,
    aviso,
    habilesProp,
    habilesTotal,
    corridos,
    vacaciones,
    sueldoPendiente,
    total: indemnizacion + aviso + vacaciones + sueldoPendiente,
  }
}
