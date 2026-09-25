import { describe, it, expect } from 'vitest'
import { proyectarAhorro, depositoPlazo, descuentosEncadenados, promocion, pensionAlimentos } from '../calculos'

describe('ahorro', () => {
  it('sin interés suma los aportes', () => {
    const r = proyectarAhorro({ inicial: 100, mensual: 10, tasaAnual: 0, meses: 12 })
    expect(r.final).toBeCloseTo(220)
    expect(r.intereses).toBeCloseTo(0)
  })
  it('12% anual efectivo sobre 1.000.000 en un año', () => {
    const r = proyectarAhorro({ inicial: 1_000_000, tasaAnual: 0.12, meses: 12 })
    expect(r.final).toBeCloseTo(1_120_000, 0)
  })
  it('depósito a plazo 0,4% por 30 días', () => {
    expect(depositoPlazo({ monto: 1_000_000, tasaPeriodo: 0.004, dias: 30 }).interes).toBeCloseTo(4000)
  })
})

describe('descuentos', () => {
  it('30% + 10% equivale a 37%', () => {
    expect(descuentosEncadenados(100, [30, 10]).equivalente).toBeCloseTo(37)
  })
  it('lleva 3 paga 2 = 33,3% en 3 unidades', () => {
    expect(promocion({ tipo: 'llevaPaga', precio: 1000, unidades: 3, lleva: 3, paga: 2 }).descuento).toBeCloseTo(33.33, 1)
  })
  it('50% en la segunda unidad = 25% en 2 unidades', () => {
    expect(promocion({ tipo: 'segunda', precio: 1000, unidades: 2, pct: 50 }).descuento).toBeCloseTo(25)
  })
})

describe('pensión de alimentos', () => {
  it('un hijo: 40% del ingreso mínimo', () => {
    expect(pensionAlimentos({ hijos: 1, imm: 553553 }).porHijo).toBe(221421)
  })
  it('dos hijos: 30% cada uno y tope 50%', () => {
    const r = pensionAlimentos({ hijos: 2, ingresos: 600_000, imm: 553553 })
    expect(r.porHijo).toBe(166066)
    expect(r.superaTope).toBe(true)
  })
})
