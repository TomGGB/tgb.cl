// Parámetros previsionales 2026. Actualizar cada año.
export const PARAMS = {
  anio: 2026,
  topeImponibleUF: 90.0, // AFP, salud y accidentes (desde remuneraciones de feb-2026)
  topeCesantiaUF: 135.2,
  cotizacionAFP: 0.1,
  salud: 0.07,
  cesantiaIndefinido: 0.006, // aporte del trabajador con contrato indefinido
  retencionHonorarios: 0.1525,
  iva: 0.19,
}

export const AFPS = [
  { name: 'Uno', comision: 0.0046 },
  { name: 'Modelo', comision: 0.0058 },
  { name: 'PlanVital', comision: 0.0116 },
  { name: 'Habitat', comision: 0.0127 },
  { name: 'Capital', comision: 0.0144 },
  { name: 'Cuprum', comision: 0.0144 },
  { name: 'Provida', comision: 0.0145 },
]

// Impuesto Único de Segunda Categoría, tramos mensuales en UTM
const TRAMOS = [
  { hasta: 13.5, factor: 0, rebaja: 0 },
  { hasta: 30, factor: 0.04, rebaja: 0.54 },
  { hasta: 50, factor: 0.08, rebaja: 1.74 },
  { hasta: 70, factor: 0.135, rebaja: 4.49 },
  { hasta: 90, factor: 0.23, rebaja: 11.14 },
  { hasta: 120, factor: 0.304, rebaja: 17.8 },
  { hasta: 310, factor: 0.35, rebaja: 23.32 },
  { hasta: Infinity, factor: 0.4, rebaja: 38.82 },
]

export function impuestoUnico(baseTributable, utm) {
  const enUTM = baseTributable / utm
  const tramo = TRAMOS.find((t) => enUTM <= t.hasta)
  return Math.max(0, Math.round(baseTributable * tramo.factor - tramo.rebaja * utm))
}

/**
 * @param {object} p
 * @param {number} p.imponible  sueldo bruto imponible (base + gratificación + bonos imponibles)
 * @param {number} p.noImponible colación, movilización, etc.
 * @param {number} p.comisionAFP
 * @param {'fonasa'|'isapre'} p.salud
 * @param {number} p.planIsapreUF valor del plan en UF (si isapre)
 * @param {'indefinido'|'plazo'} p.contrato
 */
export function calcularLiquido({ imponible, noImponible = 0, comisionAFP, salud = 'fonasa', planIsapreUF = 0, contrato = 'indefinido', uf, utm }) {
  const baseTope = Math.min(imponible, PARAMS.topeImponibleUF * uf)
  const baseCesantia = Math.min(imponible, PARAMS.topeCesantiaUF * uf)

  const afp = Math.round(baseTope * (PARAMS.cotizacionAFP + comisionAFP))
  const salud7 = Math.round(baseTope * PARAMS.salud)
  const saludTotal = salud === 'isapre' ? Math.max(salud7, Math.round(planIsapreUF * uf)) : salud7
  const cesantia = contrato === 'indefinido' ? Math.round(baseCesantia * PARAMS.cesantiaIndefinido) : 0

  // Solo el 7% legal de salud rebaja la base tributable
  const tributable = Math.max(0, imponible - afp - salud7 - cesantia)
  const impuesto = impuestoUnico(tributable, utm)

  const descuentos = afp + saludTotal + cesantia + impuesto
  return {
    imponible,
    noImponible,
    afp,
    salud: saludTotal,
    cesantia,
    tributable,
    impuesto,
    descuentos,
    liquido: imponible - descuentos + noImponible,
  }
}

// Busca el imponible que produce el líquido deseado (búsqueda binaria)
export function calcularBrutoDesdeLiquido(liquidoDeseado, opts) {
  const objetivo = liquidoDeseado - (opts.noImponible || 0)
  let lo = 0
  let hi = Math.max(objetivo * 3, 1_000_000)
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    const { liquido } = calcularLiquido({ ...opts, imponible: mid })
    if (liquido - (opts.noImponible || 0) < objetivo) lo = mid
    else hi = mid
  }
  return calcularLiquido({ ...opts, imponible: Math.round(hi) })
}
