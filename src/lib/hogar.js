/**
 * Divide el arriendo y los gastos comunes entre quienes comparten una vivienda.
 * @param metodo 'iguales' | 'metros' | 'mixto' (mitad en partes iguales y mitad según metros de la pieza)
 * @param personas [{ nombre, metros }]
 */
export function dividirArriendo({ arriendo, gastos = 0, personas, metodo = 'mixto' }) {
  const n = personas.length
  if (!n) return []
  const total = arriendo + gastos
  const sumaMetros = personas.reduce((a, p) => a + (p.metros || 0), 0)
  return personas.map((p) => {
    const igual = arriendo / n
    const porMetros = sumaMetros > 0 ? (arriendo * (p.metros || 0)) / sumaMetros : igual
    const partArriendo = metodo === 'iguales' ? igual : metodo === 'metros' ? porMetros : (igual + porMetros) / 2
    const monto = partArriendo + gastos / n // los gastos comunes siempre en partes iguales
    return { ...p, arriendo: partArriendo, gastos: gastos / n, monto, porcentaje: total ? monto / total : 0 }
  })
}

// ---------- Cuenta regresiva ----------

export function tiempoRestante(destino, ahora = new Date()) {
  let s = Math.max(0, Math.floor((destino - ahora) / 1000))
  const dias = Math.floor(s / 86400)
  s -= dias * 86400
  const horas = Math.floor(s / 3600)
  s -= horas * 3600
  const minutos = Math.floor(s / 60)
  return { dias, horas, minutos, segundos: s - minutos * 60, pasado: destino <= ahora }
}

// Próxima ocurrencia de un día/mes (si ya pasó este año, el siguiente)
export function proximaFecha(mes, dia, desde = new Date()) {
  const hoy = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate())
  let d = new Date(hoy.getFullYear(), mes - 1, dia)
  if (d < hoy) d = new Date(hoy.getFullYear() + 1, mes - 1, dia)
  return d
}
