import { describe, it, expect } from 'vitest'
import { antiguedad, aniosIndemnizacion, habilesACorridos, calcularFiniquito } from '../finiquito'
import { valorHoraExtra, gratificacionArt50 } from '../sueldo'
import { offsetMinutos, proximosCambios } from '../hora'
import regiones from '../../data/regiones.json'

const D = (y, m, d) => new Date(y, m - 1, d)

describe('finiquito', () => {
  it('antigüedad inclusiva', () => {
    expect(antiguedad(D(2020, 3, 1), D(2026, 2, 28))).toEqual({ anios: 6, meses: 0, dias: 0 })
    expect(antiguedad(D(2020, 3, 1), D(2026, 9, 15))).toEqual({ anios: 6, meses: 6, dias: 15 })
  })
  it('fracción superior a 6 meses cuenta como año, tope 11', () => {
    expect(aniosIndemnizacion({ anios: 6, meses: 6, dias: 0 })).toBe(6)
    expect(aniosIndemnizacion({ anios: 6, meses: 6, dias: 1 })).toBe(7)
    expect(aniosIndemnizacion({ anios: 0, meses: 11, dias: 0 })).toBe(0)
    expect(aniosIndemnizacion({ anios: 15, meses: 0, dias: 0 })).toBe(11)
  })
  it('hábiles a corridos incluye fines de semana y feriados', () => {
    // término viernes 11 sep 2026; 5 hábiles: lun 14, mar 15, mié 16, jue 17, (vie 18 feriado, sáb 19 feriado, dom 20) lun 21
    expect(habilesACorridos(D(2026, 9, 11), 5)).toBe(10)
    expect(habilesACorridos(D(2026, 9, 11), 0.5)).toBe(0.5)
  })
  it('necesidades de la empresa sin aviso', () => {
    const r = calcularFiniquito({ inicio: D(2021, 1, 4), termino: D(2026, 9, 30), sueldo: 1_000_000, causal: 'necesidades', uf: 40000 })
    expect(r.aniosIndemnizacion).toBe(6) // 5 años 8 meses
    expect(r.indemnizacion).toBe(6_000_000)
    expect(r.aviso).toBe(1_000_000)
    expect(r.vacaciones).toBeGreaterThan(0)
  })
  it('renuncia no indemniza y tope 90 UF', () => {
    const r = calcularFiniquito({ inicio: D(2015, 1, 1), termino: D(2026, 6, 30), sueldo: 5_000_000, causal: 'renuncia', uf: 40000 })
    expect(r.indemnizacion + r.aviso).toBe(0)
    const n = calcularFiniquito({ inicio: D(2015, 1, 1), termino: D(2026, 6, 30), sueldo: 5_000_000, causal: 'necesidades', avisoDado: true, uf: 40000 })
    expect(n.indemnizacion).toBe(11 * 3_600_000)
    expect(n.aviso).toBe(0)
  })
})

describe('horas extra y gratificación', () => {
  it('factor 42 horas = 0,0083333', () => {
    const r = valorHoraExtra({ sueldoBase: 1_000_000, jornada: 42 })
    expect(r.valorExtra).toBeCloseTo(8333.33, 1)
  })
  it('usa el mínimo si el sueldo es menor', () => {
    expect(valorHoraExtra({ sueldoBase: 400_000 }).usaMinimo).toBe(true)
  })
  it('gratificación con tope', () => {
    expect(gratificacionArt50(600_000).gratificacion).toBe(150_000)
    const g = gratificacionArt50(2_000_000)
    expect(g.topada).toBe(true)
    expect(g.gratificacion).toBe(Math.round((4.75 * 553553) / 12))
  })
})

describe('hora', () => {
  it('offset Santiago invierno y verano', () => {
    expect(offsetMinutos('America/Santiago', new Date('2026-07-01T12:00:00Z'))).toBe(-240)
    expect(offsetMinutos('America/Santiago', new Date('2026-01-15T12:00:00Z'))).toBe(-180)
    expect(offsetMinutos('America/Punta_Arenas', new Date('2026-07-01T12:00:00Z'))).toBe(-180)
  })
  it('próximo cambio desde sept 2026 es en abril 2027', () => {
    const [c] = proximosCambios('America/Santiago', new Date('2026-09-24T12:00:00Z'), 1)
    expect(c.instante.toISOString()).toBe('2027-04-04T03:00:00.000Z')
    expect(c.antes).toBe(-180)
    expect(c.despues).toBe(-240)
  })
})

describe('regiones', () => {
  it('346 comunas en 16 regiones', () => {
    expect(regiones).toHaveLength(16)
    expect(regiones.reduce((a, r) => a + r.comunas.length, 0)).toBe(346)
  })
})
