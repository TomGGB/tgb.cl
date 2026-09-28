// ---------- Permiso de circulación (DL 3.063, art. 12) ----------
// Escala progresiva y acumulativa sobre la tasación fiscal del SII, expresada en UTM de enero.
const TRAMOS_PERMISO = [
  [60, 0.01],
  [120, 0.02],
  [250, 0.03],
  [400, 0.04],
  [Infinity, 0.045],
]

export function permisoCirculacion({ tasacion, utmEnero, mesesRestantes = 12 }) {
  const enUTM = tasacion / utmEnero
  let desde = 0
  let impuestoUTM = 0
  const detalle = []
  for (const [hasta, tasa] of TRAMOS_PERMISO) {
    const tramo = Math.max(0, Math.min(enUTM, hasta) - desde)
    if (tramo > 0) detalle.push({ desde, hasta, tasa, utm: tramo * tasa })
    impuestoUTM += tramo * tasa
    desde = hasta
    if (enUTM <= hasta) break
  }
  const anualUTM = Math.max(impuestoUTM, 0.5)
  const proporcional = (anualUTM * Math.min(12, Math.max(1, mesesRestantes))) / 12
  return { enUTM, detalle, anualUTM, anual: anualUTM * utmEnero, minimo: impuestoUTM < 0.5, total: proporcional * utmEnero }
}

// ---------- Contribuciones de bienes raíces habitacionales ----------
// Valores del SII desde el 01.07.2026 (se reajustan cada semestre).
export const CONTRIBUCIONES = {
  vigencia: '2.º semestre 2026',
  exento: 61_711_570,
  tramo: 220_398_431,
  tasaBaja: 0.00893,
  tasaAlta: 0.01042,
}

export function contribuciones(avaluo, p = CONTRIBUCIONES) {
  const afecto = Math.max(0, avaluo - p.exento)
  const hastaTramo = Math.max(0, Math.min(avaluo, p.tramo) - p.exento)
  const sobreTramo = Math.max(0, avaluo - Math.max(p.tramo, p.exento))
  const anual = hastaTramo * p.tasaBaja + sobreTramo * p.tasaAlta
  return { afecto, anual, cuota: anual / 4, exento: avaluo <= p.exento }
}

// ---------- Embarazo ----------
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

/** Regla de Naegele: fecha probable de parto = fecha de última regla + 280 días */
export function embarazo({ fur, hoy = new Date() }) {
  const h = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const dias = Math.round((h - fur) / 86400000)
  const fpp = addDays(fur, 280)
  const semanas = Math.floor(dias / 7)
  return {
    dias,
    semanas,
    diasExtra: dias - semanas * 7,
    fpp,
    trimestre: semanas < 14 ? 1 : semanas < 28 ? 2 : 3,
    faltan: Math.round((fpp - h) / 86400000),
    prenatal: addDays(fpp, -42),
    progreso: Math.min(1, Math.max(0, dias / 280)),
  }
}
