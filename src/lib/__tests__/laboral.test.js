import { describe, it, expect } from 'vitest'
import { subsidioLicencia, feriadoAnual, costoImportacion } from '../laboral'

describe('licencia médica', () => {
  const base = { comisionAFP: 0.0058, uf: 40000, remuneraciones: [1_000_000, 1_000_000, 1_000_000] }
  it('licencia corta: 3 días de carencia', () => {
    const r = subsidioLicencia({ ...base, dias: 5 })
    expect(r.carencia).toBe(3)
    expect(r.diasPagados).toBe(2)
    // neto = 1.000.000 * (1 - 0.1058 - 0.07 - 0.006) = 818.200 -> diario 27.273
    expect(Math.round(r.diario)).toBe(27273)
  })
  it('licencia larga: sin carencia', () => {
    const r = subsidioLicencia({ ...base, dias: 15 })
    expect(r.carencia).toBe(0)
    expect(r.diasPagados).toBe(15)
  })
  it('tope 90 UF', () => {
    const r = subsidioLicencia({ ...base, remuneraciones: [9e6, 9e6, 9e6], dias: 30 })
    expect(r.promedioNeto).toBeLessThan(90 * 40000)
  })
})

describe('feriado progresivo', () => {
  it('sin años previos: primer día a los 13 años', () => {
    expect(feriadoAnual({ aniosEmpleadorActual: 12 }).progresivos).toBe(0)
    expect(feriadoAnual({ aniosEmpleadorActual: 13 }).progresivos).toBe(1)
    expect(feriadoAnual({ aniosEmpleadorActual: 16 }).total).toBe(17)
  })
  it('con 10 años previos: 1 día cada 3 años con el actual', () => {
    expect(feriadoAnual({ aniosEmpleadorActual: 3, aniosAnteriores: 10 }).progresivos).toBe(1)
    expect(feriadoAnual({ aniosEmpleadorActual: 2, aniosAnteriores: 15 }).progresivos).toBe(0)
  })
  it('menos de un año no tiene feriado', () => {
    expect(feriadoAnual({ aniosEmpleadorActual: 0 }).total).toBe(0)
  })
})

describe('compras en el extranjero', () => {
  it('plataforma inscrita bajo 500: solo IVA', () => {
    const r = costoImportacion({ productoUSD: 90, envioUSD: 10, dolar: 1000 })
    expect(r.arancelUSD).toBe(0)
    expect(r.ivaUSD).toBeCloseTo(19)
    expect(r.totalCLP).toBeCloseTo(119000)
  })
  it('sobre 500: arancel 6% + IVA sobre CIF + arancel', () => {
    const r = costoImportacion({ productoUSD: 600, envioUSD: 0, dolar: 1000 })
    expect(r.arancelUSD).toBeCloseTo(36)
    expect(r.ivaUSD).toBeCloseTo(636 * 0.19)
  })
})
