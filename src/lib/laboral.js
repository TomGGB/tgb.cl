import { PARAMS } from './sueldo'

/**
 * Subsidio por incapacidad laboral (licencia médica) de un trabajador dependiente.
 * Base: promedio de la remuneración neta (imponible menos cotizaciones del trabajador)
 * de los 3 meses anteriores a la licencia, dividido en 30 días. En licencias de hasta
 * 10 días no se pagan los 3 primeros (carencia). Tope: 90 UF imponibles al mes.
 */
export function subsidioLicencia({ remuneraciones, dias, comisionAFP, contrato = 'indefinido', uf }) {
  const tope = PARAMS.topeImponibleUF * uf
  const netos = remuneraciones.map((r) => {
    const imp = Math.min(r, tope)
    const cot = imp * (PARAMS.cotizacionAFP + comisionAFP + PARAMS.salud + (contrato === 'indefinido' ? PARAMS.cesantiaIndefinido : 0))
    return imp - cot
  })
  const promedioNeto = netos.reduce((a, b) => a + b, 0) / netos.length
  const diario = promedioNeto / 30
  const carencia = dias <= 10 ? Math.min(3, dias) : 0
  const diasPagados = Math.max(0, dias - carencia)
  return {
    promedioNeto,
    diario,
    carencia,
    diasPagados,
    total: Math.round(diario * diasPagados),
    perdida: Math.round(diario * carencia),
  }
}

/**
 * Feriado anual: 15 días hábiles tras un año de servicio, más feriado progresivo:
 * con 10 años cotizados (pueden ser con empleadores anteriores, máximo 10 de ellos),
 * se suma 1 día por cada 3 años nuevos con el empleador actual.
 */
export function feriadoAnual({ aniosEmpleadorActual, aniosAnteriores = 0 }) {
  const previos = Math.min(Math.max(aniosAnteriores, 0), 10)
  const faltanPara10 = Math.max(0, 10 - previos)
  const aniosComputables = Math.max(0, aniosEmpleadorActual - faltanPara10)
  const progresivos = Math.floor(aniosComputables / 3)
  const aniosParaSiguiente = 3 - (aniosComputables % 3)
  return {
    base: aniosEmpleadorActual >= 1 ? 15 : 0,
    progresivos,
    total: (aniosEmpleadorActual >= 1 ? 15 : 0) + progresivos,
    // años con el empleador actual que faltan para ganar el próximo día progresivo
    faltanAnios: aniosEmpleadorActual < faltanPara10 ? faltanPara10 - aniosEmpleadorActual + 3 : aniosParaSiguiente,
  }
}

/**
 * Costo real de una compra en el extranjero (reglas desde el 25-10-2025, Ley 21.713).
 * - Hasta USD 500 y plataforma inscrita en el SII: IVA 19% cobrado al pagar, sin arancel.
 * - Hasta USD 500 y plataforma no inscrita: se paga IVA y arancel (6%) al llegar el envío.
 * - Sobre USD 500: importación normal, arancel 6% sobre el valor CIF e IVA sobre CIF + arancel.
 */
export function costoImportacion({ productoUSD, envioUSD = 0, plataformaInscrita = true, dolar, arancel = 0.06 }) {
  const cif = productoUSD + envioUSD
  let arancelUSD = 0
  let ivaUSD = 0
  let caso
  if (cif <= 500 && plataformaInscrita) {
    caso = 'plataforma'
    ivaUSD = cif * PARAMS.iva
  } else {
    caso = cif <= 500 ? 'aduana-bajo' : 'aduana'
    arancelUSD = cif * arancel
    ivaUSD = (cif + arancelUSD) * PARAMS.iva
  }
  const totalUSD = cif + arancelUSD + ivaUSD
  return {
    caso,
    cif,
    arancelUSD,
    ivaUSD,
    impuestosUSD: arancelUSD + ivaUSD,
    totalUSD,
    totalCLP: totalUSD * dolar,
    recargo: cif > 0 ? (arancelUSD + ivaUSD) / cif : 0,
  }
}
