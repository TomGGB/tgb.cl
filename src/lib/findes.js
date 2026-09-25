import { getFeriados, isFeriado } from './feriados'

const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const esLibre = (d) => d.getDay() === 0 || d.getDay() === 6 || !!isFeriado(d)

/**
 * Para cada feriado que cae en día hábil, busca el bloque de días libres consecutivos más largo
 * que se logra pidiendo 0, 1, 2 o 3 días de vacaciones alrededor de él.
 * Devuelve una lista de oportunidades ordenadas por fecha, sin repetir el mismo bloque.
 */
export function planificarFinesLargos(year, { maxDias = 3 } = {}) {
  const feriados = getFeriados(year).filter((f) => f.date.getDay() !== 0 && f.date.getDay() !== 6)
  const vistos = new Set()
  const out = []

  for (const f of feriados) {
    const opciones = []
    for (let k = 0; k <= maxDias; k++) {
      const best = mejorBloque(f.date, k)
      if (!best) continue
      // solo vale la pena si pedir más días alarga el bloque
      const prev = opciones[opciones.length - 1]
      if (prev && best.total <= prev.total) continue
      opciones.push(best)
    }
    const key = opciones.map((o) => `${o.desde.getTime()}-${o.hasta.getTime()}`).join('|')
    if (vistos.has(key)) continue
    vistos.add(key)
    const feriadosDelBloque = getFeriados(year)
      .concat(getFeriados(year + 1))
      .filter((x) => opciones.some((o) => x.date >= o.desde && x.date <= o.hasta))
    out.push({ feriado: f, feriados: [...new Map(feriadosDelBloque.map((x) => [x.date.getTime(), x])).values()], opciones })
  }
  return out
}

// Mejor ventana que contiene `dia` usando como máximo k días hábiles como vacaciones.
function mejorBloque(dia, k) {
  let best = null
  // probamos cuántos días hábiles tomar antes (i) y después (k - i) del feriado
  for (let antes = 0; antes <= k; antes++) {
    const despues = k - antes
    let desde = dia
    let usadosAntes = 0
    // extender hacia atrás
    for (;;) {
      const prev = addDays(desde, -1)
      if (esLibre(prev)) desde = prev
      else if (usadosAntes < antes) {
        usadosAntes++
        desde = prev
      } else break
    }
    let hasta = dia
    let usadosDespues = 0
    for (;;) {
      const next = addDays(hasta, 1)
      if (esLibre(next)) hasta = next
      else if (usadosDespues < despues) {
        usadosDespues++
        hasta = next
      } else break
    }
    // recortar días hábiles "pedidos" en los bordes que no aportan (no deberían quedar, pero por seguridad)
    const vacaciones = []
    for (let d = desde; d <= hasta; d = addDays(d, 1)) if (!esLibre(d)) vacaciones.push(d)
    const total = Math.round((hasta - desde) / 86400000) + 1
    if (vacaciones.length !== k) continue
    if (!best || total > best.total) best = { desde, hasta, total, vacaciones, pedidos: k }
  }
  return best
}
