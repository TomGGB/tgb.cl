// ---------- Notas en escala de 1,0 a 7,0 ----------

// Chile redondea al décimo más cercano (3,95 → 4,0)
export const redondearNota = (n) => Math.round(n * 10 + 1e-9) / 10

/**
 * Nota según puntaje obtenido, con porcentaje de exigencia (típicamente 60% para el 4,0).
 */
export function notaPorPuntaje({ puntaje, maximo, exigencia = 0.6, notaMin = 1, notaMax = 7, notaAprob = 4 }) {
  if (maximo <= 0) return notaMin
  const p = Math.max(0, Math.min(puntaje, maximo))
  const corte = exigencia * maximo
  const nota =
    p < corte ? notaMin + ((notaAprob - notaMin) * p) / corte : notaAprob + ((notaMax - notaAprob) * (p - corte)) / (maximo - corte)
  return nota
}

// Puntaje mínimo para aprobar (nota 4,0)
export const puntajeParaAprobar = ({ maximo, exigencia = 0.6 }) => exigencia * maximo

/**
 * Promedio ponderado. Si los pesos no suman 100, se reparten en proporción.
 * @param notas [{ nota, peso }] (peso en %; si falta, todas pesan igual)
 */
export function promedioPonderado(notas) {
  const validas = notas.filter((n) => Number.isFinite(n.nota) && n.nota > 0)
  if (!validas.length) return null
  const conPeso = validas.every((n) => n.peso > 0)
  const total = conPeso ? validas.reduce((a, n) => a + n.peso, 0) : validas.length
  return validas.reduce((a, n) => a + n.nota * (conPeso ? n.peso : 1), 0) / total
}

/**
 * Nota necesaria en lo que falta (examen u otras evaluaciones) para alcanzar una meta.
 * @param notas evaluaciones ya rendidas [{ nota, peso }] (peso en % del total)
 * @param pesoRestante % del total que falta por evaluar
 */
export function notaNecesaria({ notas, pesoRestante, meta = 4 }) {
  const acumulado = notas.filter((n) => n.nota > 0 && n.peso > 0).reduce((a, n) => a + n.nota * n.peso, 0)
  if (pesoRestante <= 0) return null
  return (meta * 100 - acumulado) / pesoRestante
}

// ---------- PAES: puntaje ponderado ----------

/** @param items [{ puntaje, peso }] con pesos en % */
export function puntajePonderado(items) {
  const sumaPesos = items.reduce((a, i) => a + (i.peso || 0), 0)
  const ponderado = items.reduce((a, i) => a + (i.puntaje || 0) * ((i.peso || 0) / 100), 0)
  return { ponderado, sumaPesos }
}
