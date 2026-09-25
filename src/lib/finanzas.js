import { impuestoUnico } from './sueldo'

// Cuota fija (sistema francés)
export function cuotaFija(monto, tasaMensual, n) {
  if (n <= 0) return 0
  if (tasaMensual === 0) return monto / n
  return (monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -n))
}

// Tasa interna de retorno mensual: monto recibido hoy vs. n pagos iguales (bisección)
export function tirMensual(recibido, pago, n) {
  if (recibido <= 0 || pago <= 0 || n <= 0) return 0
  if (pago * n <= recibido) return 0
  let lo = 0
  let hi = 1
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    const vp = pago * ((1 - Math.pow(1 + mid, -n)) / mid)
    if (vp > recibido) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

/**
 * Crédito de consumo. La CAE (Carga Anual Equivalente) de la CMF es la TIR mensual × 12,
 * considerando lo que realmente recibes y todo lo que pagas (cuota + seguros).
 */
export function creditoConsumo({ monto, cuotas, tasaMensual, seguroMensual = 0, gastosIniciales = 0 }) {
  const financiado = monto + gastosIniciales
  const cuota = cuotaFija(financiado, tasaMensual, cuotas)
  const pagoTotalMes = cuota + seguroMensual
  const total = pagoTotalMes * cuotas
  const tir = tirMensual(monto, pagoTotalMes, cuotas)
  return { cuota, pagoTotalMes, total, costo: total - monto, cae: tir * 12, tasaAnual: tasaMensual * 12 }
}

/**
 * APV: compara el régimen A (bonificación fiscal del 15% con tope de 6 UTM al año)
 * con el régimen B (el aporte se rebaja de la base del impuesto único, tope 50 UF mensuales).
 * @param baseTributable base tributable mensual del trabajador antes del APV
 */
export function compararApv({ aporteMensual, baseTributable, utm, uf }) {
  const anual = aporteMensual * 12
  const bonoA = Math.min(anual * 0.15, 6 * utm)

  const rebajable = Math.min(aporteMensual, 50 * uf, baseTributable)
  const ahorroMensualB = impuestoUnico(baseTributable, utm) - impuestoUnico(baseTributable - rebajable, utm)
  const beneficioB = ahorroMensualB * 12

  // Tasa marginal del trabajador (factor del tramo en que cae su base)
  const impuestoConUnPesoMas = impuestoUnico(baseTributable + 1000, utm) - impuestoUnico(baseTributable, utm)
  const tasaMarginal = impuestoConUnPesoMas / 1000

  return {
    anual,
    bonoA,
    beneficioB,
    tasaMarginal,
    aporteParaTopeA: Math.ceil((6 * utm) / 0.15 / 12),
    recomendado: bonoA >= beneficioB ? 'A' : 'B',
  }
}
