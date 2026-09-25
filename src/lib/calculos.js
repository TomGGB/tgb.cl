import { PARAMS } from './sueldo'

/**
 * Ahorro con interés compuesto mensual.
 * @param tasaAnual tasa anual efectiva (0.05 = 5%); se convierte a mensual equivalente
 */
export function proyectarAhorro({ inicial = 0, mensual = 0, tasaAnual = 0, meses = 12 }) {
  const r = Math.pow(1 + tasaAnual, 1 / 12) - 1
  let saldo = inicial
  let aportado = inicial
  const puntos = [{ mes: 0, saldo, aportado }]
  for (let m = 1; m <= meses; m++) {
    saldo = saldo * (1 + r) + mensual
    aportado += mensual
    puntos.push({ mes: m, saldo, aportado })
  }
  return { final: saldo, aportado, intereses: saldo - aportado, tasaMensual: r, puntos }
}

// Depósito a plazo: los bancos informan la tasa del período (p. ej. 0,40% por 30 días)
export function depositoPlazo({ monto, tasaPeriodo, dias }) {
  const interes = monto * tasaPeriodo * (dias / 30)
  return { interes, final: monto + interes, tasaAnual: Math.pow(1 + tasaPeriodo, 365 / 30) - 1 }
}

// ---------- Descuentos ----------

export const precioConDescuento = (precio, pct) => precio * (1 - pct / 100)

// Descuentos sucesivos: 30% + 10% adicional no es 40%
export function descuentosEncadenados(precio, porcentajes) {
  const final = porcentajes.reduce((p, d) => p * (1 - d / 100), precio)
  return { final, ahorro: precio - final, equivalente: precio > 0 ? (1 - final / precio) * 100 : 0 }
}

/**
 * Descuento efectivo por unidad de distintas promociones, comprando `unidades` productos de precio `precio`.
 * tipo: 'directo' (pct), 'llevaPaga' (lleva N paga M), 'segunda' (pct en la segunda unidad, por pares)
 */
export function promocion({ tipo, precio, unidades, pct = 0, lleva = 3, paga = 2 }) {
  let total = precio * unidades
  if (tipo === 'directo') total = precio * unidades * (1 - pct / 100)
  if (tipo === 'llevaPaga') {
    const grupos = Math.floor(unidades / lleva)
    const resto = unidades % lleva
    total = (grupos * paga + resto) * precio
  }
  if (tipo === 'segunda') {
    const pares = Math.floor(unidades / 2)
    total = pares * precio * (2 - pct / 100) + (unidades % 2) * precio
  }
  const normal = precio * unidades
  return { total, porUnidad: unidades ? total / unidades : 0, ahorro: normal - total, descuento: normal ? (1 - total / normal) * 100 : 0 }
}

// ---------- Pensión de alimentos (mínimos legales, Ley 14.908) ----------

export function pensionAlimentos({ hijos, ingresos = 0, imm = PARAMS.imm }) {
  const n = Math.max(1, Math.floor(hijos))
  const pctPorHijo = n === 1 ? 0.4 : 0.3
  const porHijo = Math.round(imm * pctPorHijo)
  const total = porHijo * n
  const tope = ingresos > 0 ? ingresos * 0.5 : null
  return { pctPorHijo, porHijo, total, tope, superaTope: tope !== null && total > tope }
}
