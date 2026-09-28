import { describe, it, expect } from 'vitest'
import { permisoCirculacion, contribuciones, CONTRIBUCIONES } from '../tramites'
import { embarazo } from '../tramites'

describe('permiso de circulación', () => {
  it('escala acumulativa: 100 UTM = 60×1% + 40×2% = 1,4 UTM', () => {
    const r = permisoCirculacion({ tasacion: 100 * 70000, utmEnero: 70000 })
    expect(r.anualUTM).toBeCloseTo(1.4)
  })
  it('300 UTM = 0,6 + 1,2 + 3,9 + 2 = 7,7 UTM', () => {
    expect(permisoCirculacion({ tasacion: 300 * 70000, utmEnero: 70000 }).anualUTM).toBeCloseTo(7.7)
  })
  it('mínimo de media UTM', () => {
    const r = permisoCirculacion({ tasacion: 20 * 70000, utmEnero: 70000 })
    expect(r.anualUTM).toBe(0.5)
    expect(r.minimo).toBe(true)
  })
})

describe('contribuciones', () => {
  it('bajo el exento no paga', () => {
    expect(contribuciones(50_000_000).anual).toBe(0)
  })
  it('entre exento y tramo: 0,893% sobre el exceso', () => {
    const r = contribuciones(CONTRIBUCIONES.exento + 10_000_000)
    expect(r.anual).toBeCloseTo(89_300)
  })
  it('sobre el tramo: 1,042% sobre el exceso del tramo', () => {
    const r = contribuciones(CONTRIBUCIONES.tramo + 10_000_000)
    const esperado = (CONTRIBUCIONES.tramo - CONTRIBUCIONES.exento) * 0.00893 + 10_000_000 * 0.01042
    expect(r.anual).toBeCloseTo(esperado)
  })
})

describe('embarazo', () => {
  it('FPP = FUR + 280 días y semanas de gestación', () => {
    const r = embarazo({ fur: new Date(2026, 0, 1), hoy: new Date(2026, 2, 12) })
    expect(r.fpp.toISOString().slice(0, 10)).toBe('2026-10-08')
    expect(r.semanas).toBe(10)
    expect(r.diasExtra).toBe(0)
    expect(r.trimestre).toBe(1)
  })
})
