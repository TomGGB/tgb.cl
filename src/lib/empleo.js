import { PARAMS } from './sueldo'

const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

// ---------- Pre y postnatal (Código del Trabajo, arts. 195 y 197 bis) ----------

/**
 * @param fpp fecha probable de parto
 * @param parto fecha real de parto (si ya ocurrió)
 * @param especial parto prematuro (antes de la semana 33) o bebé de menos de 1.500 g: postnatal de 18 semanas
 * @param parental 'completa' (12 semanas) o 'media' (18 semanas a media jornada)
 */
export function periodosMaternidad({ fpp, parto, especial = false, parental = 'completa' }) {
  const nacimiento = parto ?? fpp
  const inicioPre = addDays(fpp, -42)
  // Si el parto se adelanta, los días de prenatal que no alcanzaron a usarse se suman al postnatal
  const diasPre = Math.max(0, Math.min(42, Math.round((nacimiento - inicioPre) / 86400000)))
  const prenatal = { desde: inicioPre, hasta: addDays(nacimiento, -1), dias: diasPre }
  const diasPost = (especial ? 126 : 84) + (42 - diasPre)
  const postnatal = { desde: nacimiento, hasta: addDays(nacimiento, diasPost - 1), dias: diasPost, extra: 42 - diasPre }
  const diasParental = parental === 'media' ? 126 : 84
  const postParental = { desde: addDays(postnatal.hasta, 1), hasta: addDays(postnatal.hasta, diasParental), dias: diasParental }
  return { prenatal, postnatal, parental: postParental, vuelta: addDays(postParental.hasta, 1) }
}

// ---------- Costo de un trabajador para el empleador ----------

/**
 * Aportes del empleador vigentes desde las remuneraciones de agosto de 2026 (reforma de pensiones):
 * 3,5% (2,5% seguro social previsional, que incluye el SIS; 0,9% cotización con rentabilidad protegida;
 * 0,1% a la cuenta individual). Seguro de cesantía: 2,4% indefinido, 3,0% plazo fijo o casa particular
 * (2,2% cuenta individual + 0,8% fondo solidario). Casa particular: además 1,11% de indemnización a todo evento.
 */
export const APORTES = {
  reforma: 0.035,
  cesantiaIndefinido: 0.024,
  cesantiaPlazo: 0.03,
  cesantiaCasaParticular: 0.03,
  indemnizacionCasaParticular: 0.0111,
  mutualBasica: 0.0093,
}

export function costoEmpleador({ imponible, noImponible = 0, tipo = 'indefinido', mutual = APORTES.mutualBasica, uf }) {
  const tope = PARAMS.topeImponibleUF * uf
  const topeCes = PARAMS.topeCesantiaUF * uf
  const base = Math.min(imponible, tope)
  const baseCes = Math.min(imponible, topeCes)
  const casa = tipo === 'casa'
  const tasaCes = casa ? APORTES.cesantiaCasaParticular : tipo === 'plazo' ? APORTES.cesantiaPlazo : APORTES.cesantiaIndefinido
  const items = [
    { id: 'reforma', label: 'Aporte de la reforma de pensiones (incluye SIS)', tasa: APORTES.reforma, monto: base * APORTES.reforma },
    { id: 'cesantia', label: 'Seguro de cesantía', tasa: tasaCes, monto: baseCes * tasaCes },
    { id: 'mutual', label: 'Seguro de accidentes (mutual o ISL)', tasa: mutual, monto: base * mutual },
  ]
  if (casa) {
    items.push({ id: 'indemnizacion', label: 'Indemnización a todo evento', tasa: APORTES.indemnizacionCasaParticular, monto: base * APORTES.indemnizacionCasaParticular })
  }
  const aportes = items.reduce((a, i) => a + i.monto, 0)
  const total = imponible + noImponible + aportes
  return { items, aportes, total, anual: total * 12, recargo: imponible > 0 ? aportes / imponible : 0 }
}

// ---------- Operación Renta de trabajadores a honorarios ----------

/**
 * Parámetros por año tributario. AT 2026 (ingresos 2025): valores de la Guía Práctica de Renta 2026 del SII.
 * AT 2027 (ingresos 2026): retención y cobertura parcial según la Ley 21.133; el resto se estima con los
 * valores de 2026 y la UTA/UF actuales hasta que el SII publique los definitivos.
 */
export const RENTA = {
  2026: { retencion: 0.145, parcial: 0.8, sis: 0.015, atep: 0.009, sanna: 0.0003, uta: 834_504, topeAnual: 41_857_379, imm: 529_000, oficial: true },
  2027: { retencion: 0.1525, parcial: 0.9, sis: 0.015, atep: 0.009, sanna: 0.0003, oficial: false },
}

// Tramos del impuesto global complementario en UTA: [hasta, factor, rebaja]
const TRAMOS_IGC = [
  [13.5, 0, 0],
  [30, 0.04, 0.54],
  [50, 0.08, 1.74],
  [70, 0.135, 4.49],
  [90, 0.23, 11.14],
  [120, 0.304, 17.8],
  [310, 0.35, 23.32],
  [Infinity, 0.4, 38.82],
]

export function impuestoGlobal(base, uta) {
  const enUTA = base / uta
  const [, factor, rebaja] = TRAMOS_IGC.find(([hasta]) => enUTA <= hasta)
  return Math.max(0, base * factor - rebaja * uta)
}

/**
 * Estima el resultado de la Operación Renta para quien solo tiene ingresos por boletas de honorarios.
 * @returns saldo positivo = devolución; negativo = monto a pagar
 */
export function operacionRentaHonorarios({ honorarios, anio = 2026, cobertura = 'total', comisionAFP, utm, uf }) {
  const p = { ...RENTA[anio] }
  if (!p.uta) p.uta = utm * 12
  if (!p.topeAnual) p.topeAnual = PARAMS.topeImponibleUF * uf * 12
  if (!p.imm) p.imm = PARAMS.imm

  const retenciones = honorarios * p.retencion
  const obligado = honorarios >= 5 * p.imm

  // Cotizaciones: base del 80% de los honorarios, entre 4 IMM y el tope imponible anual
  let cot = { total: 0, items: [] }
  if (obligado) {
    const base = Math.min(Math.max(honorarios * 0.8, 4 * p.imm), p.topeAnual)
    const baseSaludAfp = cobertura === 'parcial' ? base * p.parcial : base
    const sis = base * p.sis
    const atep = base * p.atep
    const sanna = base * p.sanna
    const salud = baseSaludAfp * PARAMS.salud
    const afpCompleta = baseSaludAfp * (PARAMS.cotizacionAFP + comisionAFP)
    const otros = sis + atep + sanna + salud
    // Con cobertura total, lo destinado a pensiones queda limitado por las retenciones disponibles
    const afp = cobertura === 'total' ? Math.max(0, Math.min(afpCompleta, retenciones - otros)) : afpCompleta
    cot = {
      base,
      baseSaludAfp,
      items: [
        { label: 'Seguro de invalidez y sobrevivencia', monto: sis },
        { label: 'Accidentes del trabajo', monto: atep },
        { label: 'Ley SANNA', monto: sanna },
        { label: 'Salud', monto: salud },
        { label: 'Pensiones (AFP)', monto: afp },
      ],
      total: otros + afp,
    }
  }

  // Impuesto: honorarios menos gastos presuntos (30% con tope de 15 UTA)
  const gastos = Math.min(honorarios * 0.3, 15 * p.uta)
  const baseImpuesto = honorarios - gastos
  const impuesto = impuestoGlobal(baseImpuesto, p.uta)

  const saldo = retenciones - cot.total - impuesto
  return { ...p, retenciones, obligado, cotizaciones: cot, gastos, baseImpuesto, impuesto, saldo }
}

// ---------- Multas de tránsito (Ley 18.290) ----------

export const MULTAS = [
  { id: 'leve', nombre: 'Leve', min: 0.2, max: 0.5, descuento: true },
  { id: 'menos-grave', nombre: 'Menos grave', min: 0.5, max: 1, descuento: true },
  { id: 'grave', nombre: 'Grave', min: 1, max: 1.5, descuento: true },
  { id: 'gravisima', nombre: 'Gravísima', min: 1.5, max: 3, descuento: false },
]
