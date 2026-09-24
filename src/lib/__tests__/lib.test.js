import { describe, it, expect } from 'vitest'
import { validateRut, formatRut, calcDV } from '../rut'
import { getFeriados, diasHabiles, sumarDiasHabiles } from '../feriados'
import { calcularLiquido, calcularBrutoDesdeLiquido, impuestoUnico } from '../sueldo'

const iso = (d) => d.toISOString().slice(0, 10)
const names = (y) => getFeriados(y).map((f) => `${f.date.getMonth() + 1}-${f.date.getDate()}`)

describe('rut', () => {
  it('valida y formatea', () => {
    expect(calcDV('11111111')).toBe('1')
    expect(validateRut('11.111.111-1')).toBe(true)
    expect(validateRut('12.345.678-5')).toBe(true)
    expect(validateRut('12.345.678-9')).toBe(false)
    expect(validateRut('7.777.777-6')).toBe(true)
    expect(formatRut('123456785')).toBe('12.345.678-5')
  })
})

describe('feriados', () => {
  it('2025 conocidos', () => {
    const f = names(2025)
    for (const x of ['4-18', '4-19', '6-20', '6-29', '10-12', '10-31', '11-16', '12-14']) expect(f).toContain(x)
  })
  it('2024: 20 sep y San Pedro movido', () => {
    const f = names(2024)
    expect(f).toContain('9-20') // 19 cae jueves
    expect(f).toContain('6-29') // sábado, no se mueve
  })
  it('2026', () => {
    const f = names(2026)
    expect(f).toContain('4-3') // viernes santo
    expect(f).toContain('6-29') // lunes
    expect(f).toContain('10-12') // lunes
    expect(f).toContain('6-21')
    expect(f).toContain('10-31') // sabado
  })
  it('2023: 18 sep martes -> 17 no, lunes 18', () => {
    // 2018: 18 sep fue martes -> 17 feriado
    expect(names(2018)).toContain('9-17')
  })
  it('dias habiles', () => {
    // semana 21-25 sep 2026, sin feriados
    expect(diasHabiles(new Date(2026, 8, 21), new Date(2026, 8, 25))).toBe(5)
    // 14-18 sep 2026: 18 viernes feriado
    expect(diasHabiles(new Date(2026, 8, 14), new Date(2026, 8, 18))).toBe(4)
    expect(iso(sumarDiasHabiles(new Date(2026, 8, 17), 1))).toBe('2026-09-21')
  })
})

describe('sueldo', () => {
  const base = { comisionAFP: 0.0127, uf: 40000, utm: 70000 }
  it('sueldo exento de impuesto', () => {
    const r = calcularLiquido({ ...base, imponible: 800000 })
    expect(r.afp).toBe(Math.round(800000 * 0.1127))
    expect(r.salud).toBe(56000)
    expect(r.cesantia).toBe(4800)
    expect(r.impuesto).toBe(0)
  })
  it('impuesto tramo 2', () => {
    // 20 UTM -> 1.400.000*0.04 - 0.54*70000 = 56000-37800
    expect(impuestoUnico(1_400_000, 70000)).toBe(18200)
  })
  it('tope imponible', () => {
    const r = calcularLiquido({ ...base, imponible: 10_000_000 })
    expect(r.salud).toBe(Math.round(90 * 40000 * 0.07))
  })
  it('inverso', () => {
    const r = calcularBrutoDesdeLiquido(1_000_000, base)
    expect(Math.abs(r.liquido - 1_000_000)).toBeLessThanOrEqual(2)
  })
})
