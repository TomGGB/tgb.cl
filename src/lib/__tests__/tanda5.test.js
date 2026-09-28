import { describe, it, expect } from 'vitest'
import { notaPorPuntaje, redondearNota, promedioPonderado, notaNecesaria, puntajePonderado } from '../educacion'
import { periodosMaternidad, costoEmpleador, operacionRentaHonorarios, impuestoGlobal } from '../empleo'
import { dividirArriendo, tiempoRestante, proximaFecha } from '../hogar'

const D = (y, m, d) => new Date(y, m - 1, d)
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

describe('notas', () => {
  it('60% de exigencia: 60 de 100 = 4,0; 100 = 7,0; 0 = 1,0', () => {
    expect(notaPorPuntaje({ puntaje: 60, maximo: 100 })).toBeCloseTo(4)
    expect(notaPorPuntaje({ puntaje: 100, maximo: 100 })).toBeCloseTo(7)
    expect(notaPorPuntaje({ puntaje: 0, maximo: 100 })).toBeCloseTo(1)
    expect(notaPorPuntaje({ puntaje: 80, maximo: 100 })).toBeCloseTo(5.5)
  })
  it('redondeo chileno', () => {
    expect(redondearNota(3.95)).toBe(4)
    expect(redondearNota(3.94)).toBe(3.9)
  })
  it('promedio ponderado y nota necesaria', () => {
    expect(promedioPonderado([{ nota: 5, peso: 30 }, { nota: 3, peso: 70 }])).toBeCloseTo(3.6)
    expect(promedioPonderado([{ nota: 5 }, { nota: 6 }])).toBeCloseTo(5.5)
    // 60% ya evaluado con 3,5 → necesito (4*100 - 3,5*60)/40 = 4,75
    expect(notaNecesaria({ notas: [{ nota: 3.5, peso: 60 }], pesoRestante: 40 })).toBeCloseTo(4.75)
  })
  it('PAES ponderado', () => {
    const r = puntajePonderado([{ puntaje: 800, peso: 50 }, { puntaje: 600, peso: 50 }])
    expect(r.ponderado).toBe(700)
    expect(r.sumaPesos).toBe(100)
  })
})

describe('pre y postnatal', () => {
  it('prenatal 42 días antes, postnatal 84, parental 84', () => {
    const r = periodosMaternidad({ fpp: D(2027, 3, 1) })
    expect(iso(r.prenatal.desde)).toBe('2027-01-18')
    expect(iso(r.postnatal.hasta)).toBe('2027-05-23')
    expect(iso(r.parental.hasta)).toBe('2027-08-15')
  })
  it('parto adelantado: los días de prenatal no usados pasan al postnatal', () => {
    const r = periodosMaternidad({ fpp: D(2027, 3, 1), parto: D(2027, 2, 15) })
    expect(r.prenatal.dias).toBe(28)
    expect(r.postnatal.dias).toBe(84 + 14)
  })
  it('parto prematuro: postnatal de 126 días', () => {
    expect(periodosMaternidad({ fpp: D(2027, 3, 1), especial: true }).postnatal.dias).toBe(126)
  })
})

describe('costo empleador', () => {
  it('indefinido con mutual básica', () => {
    const r = costoEmpleador({ imponible: 1_000_000, uf: 40000 })
    expect(r.aportes).toBeCloseTo(1_000_000 * (0.035 + 0.024 + 0.0093))
  })
  it('casa particular incluye 1,11% y cesantía 3%', () => {
    const r = costoEmpleador({ imponible: 600_000, tipo: 'casa', uf: 40000 })
    expect(r.items.find((i) => i.id === 'indemnizacion').monto).toBeCloseTo(6660)
    expect(r.items.find((i) => i.id === 'cesantia').tasa).toBe(0.03)
  })
})

describe('Operación Renta honorarios (ejemplo de la guía SII 2026)', () => {
  it('impuesto global del ejemplo: $15.400.000 → $165.368', () => {
    expect(Math.round(impuestoGlobal(15_400_000, 834_504))).toBe(165368)
  })
  it('$5.000.000 con cobertura total: cotiza toda la retención ($725.000)', () => {
    const r = operacionRentaHonorarios({ honorarios: 5_000_000, anio: 2026, cobertura: 'total', comisionAFP: 0.02, utm: 70000, uf: 40000 })
    expect(Math.round(r.cotizaciones.total)).toBe(725000)
  })
  it('$5.000.000 con cobertura parcial: cotiza $705.200', () => {
    const r = operacionRentaHonorarios({ honorarios: 5_000_000, anio: 2026, cobertura: 'parcial', comisionAFP: 0.02, utm: 70000, uf: 40000 })
    expect(Math.round(r.cotizaciones.total)).toBe(705200)
  })
})

describe('hogar', () => {
  it('mixto: mitad igual, mitad por metros', () => {
    const r = dividirArriendo({ arriendo: 600_000, personas: [{ metros: 10 }, { metros: 20 }], metodo: 'mixto' })
    expect(Math.round(r[0].monto)).toBe(250000)
    expect(Math.round(r[1].monto)).toBe(350000)
  })
  it('cuenta regresiva', () => {
    const t = tiempoRestante(new Date('2026-09-18T00:00:00'), new Date('2026-09-17T22:30:00'))
    expect(t).toMatchObject({ dias: 0, horas: 1, minutos: 30 })
    expect(iso(proximaFecha(9, 18, D(2026, 9, 28)))).toBe('2027-09-18')
  })
})
