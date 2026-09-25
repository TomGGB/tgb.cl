import { describe, it, expect } from 'vitest'
import { cuotaFija, creditoConsumo, compararApv } from '../finanzas'
import { planificarFinesLargos } from '../findes'
import { proximasFechas, toICS } from '../calendario'

const D = (y, m, d) => new Date(y, m - 1, d)
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

describe('crédito y CAE', () => {
  it('cuota francesa conocida', () => {
    // 1.000.000 a 12 meses al 2% mensual = 94.559,6
    expect(cuotaFija(1_000_000, 0.02, 12)).toBeCloseTo(94559.6, 0)
  })
  it('sin seguros ni gastos, la CAE es la tasa anual', () => {
    const r = creditoConsumo({ monto: 1_000_000, cuotas: 24, tasaMensual: 0.015 })
    expect(r.cae).toBeCloseTo(0.18, 4)
  })
  it('los seguros suben la CAE', () => {
    const r = creditoConsumo({ monto: 1_000_000, cuotas: 24, tasaMensual: 0.015, seguroMensual: 3000 })
    expect(r.cae).toBeGreaterThan(0.18)
  })
})

describe('APV', () => {
  const p = { utm: 70000, uf: 40000 }
  it('exento de impuesto conviene régimen A', () => {
    const r = compararApv({ ...p, aporteMensual: 50_000, baseTributable: 800_000 })
    expect(r.beneficioB).toBe(0)
    expect(r.bonoA).toBe(90_000)
    expect(r.recomendado).toBe('A')
  })
  it('sueldo alto conviene régimen B', () => {
    const r = compararApv({ ...p, aporteMensual: 200_000, baseTributable: 5_000_000 })
    expect(r.tasaMarginal).toBeCloseTo(0.23, 2)
    expect(r.recomendado).toBe('B')
    expect(r.bonoA).toBe(360_000)
  })
})

describe('fines de semana largos', () => {
  it('2026: viernes santo es fin de semana largo sin pedir días', () => {
    const plan = planificarFinesLargos(2026)
    const ss = plan.find((p) => iso(p.feriado.date) === '2026-04-03')
    expect(ss.opciones[0].pedidos).toBe(0)
    expect(ss.opciones[0].total).toBe(3) // vie 3 a dom 5
  })
  it('2026: jueves 21 de mayo, pidiendo el viernes son 4 días', () => {
    const plan = planificarFinesLargos(2026)
    const m = plan.find((p) => iso(p.feriado.date) === '2026-05-21')
    const uno = m.opciones.find((o) => o.pedidos === 1)
    expect(iso(uno.vacaciones[0])).toBe('2026-05-22')
    expect(uno.total).toBe(4)
  })
})

describe('calendario', () => {
  it('incluye contribuciones, feriados y revisión técnica', () => {
    const ev = proximasFechas({ desde: D(2026, 9, 24), meses: 12, digito: 3 })
    const t = ev.map((e) => e.titulo)
    expect(t).toContain('Contribuciones (cuota 3 de 4)') // 30 sep 2026
    expect(t.some((x) => x.startsWith('Revisión técnica'))).toBe(true)
    expect(t.some((x) => x.includes('horario de invierno'))).toBe(true)
    expect(ev[0].date <= ev[ev.length - 1].date).toBe(true)
  })
  it('genera ICS válido', () => {
    const ics = toICS(proximasFechas({ desde: D(2026, 9, 24), meses: 2 }))
    expect(ics.startsWith('BEGIN:VCALENDAR')).toBe(true)
    expect(ics).toContain('DTSTART;VALUE=DATE:20261012')
  })
})
