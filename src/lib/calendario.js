import { getFeriados } from './feriados'
import { proximosCambios } from './hora'

const d = (y, m, day) => new Date(y, m - 1, day)
const ultimoDia = (y, m) => new Date(y, m, 0)

// Mes de revisión técnica de vehículos particulares según el último dígito de la patente (MTT)
export const MES_REVISION = { 1: 4, 2: 5, 3: 6, 4: 7, 5: 8, 6: 9, 7: 10, 8: 11, 9: 1, 0: 2 }

export const CATEGORIAS = {
  feriado: { label: 'Feriado', color: 'red' },
  vehiculo: { label: 'Vehículo', color: 'blue' },
  impuestos: { label: 'Impuestos y pagos', color: 'green' },
  hora: { label: 'Cambio de hora', color: 'purple' },
}

function eventosDelAnio(y, { digito } = {}) {
  const ev = [
    { date: d(y, 2, 1), fin: d(y, 3, 31), titulo: 'Permiso de circulación', detalle: 'Pago completo o primera cuota de autos particulares, motos y camionetas, junto con el SOAP.', cat: 'vehiculo' },
    { date: d(y, 8, 1), fin: d(y, 8, 31), titulo: 'Segunda cuota del permiso de circulación', detalle: 'Si pagaste en dos cuotas, la segunda vence el 31 de agosto.', cat: 'vehiculo' },
    { date: d(y, 4, 1), fin: d(y, 4, 30), titulo: 'Operación Renta', detalle: 'Declaración anual de impuestos a la renta en el SII. Si tienes devolución, declara temprano.', cat: 'impuestos' },
    { date: ultimoDia(y, 1), titulo: 'Patentes municipales (1.ª cuota)', detalle: 'Primera cuota semestral de patentes comerciales.', cat: 'impuestos' },
    { date: ultimoDia(y, 7), titulo: 'Patentes municipales (2.ª cuota)', detalle: 'Segunda cuota semestral de patentes comerciales.', cat: 'impuestos' },
    ...[4, 6, 9, 11].map((m, i) => ({
      date: ultimoDia(y, m),
      titulo: `Contribuciones (cuota ${i + 1} de 4)`,
      detalle: 'Vence la cuota del impuesto territorial en la Tesorería (TGR).',
      cat: 'impuestos',
    })),
    ...getFeriados(y).map((f) => ({ date: f.date, titulo: f.name, detalle: f.irrenunciable ? 'Feriado irrenunciable' : 'Feriado nacional', cat: 'feriado' })),
  ]
  if (digito !== undefined && digito !== null && digito !== '') {
    const m = MES_REVISION[digito]
    ev.push({
      date: d(y, m, 1),
      fin: ultimoDia(y, m),
      titulo: `Revisión técnica (patente terminada en ${digito})`,
      detalle: 'Mes en que vence la revisión técnica de tu vehículo particular. Marzo y diciembre quedan libres para atrasados.',
      cat: 'vehiculo',
    })
  }
  return ev
}

// Eventos de los próximos `meses` meses desde `desde`, incluidos los que están en curso
export function proximasFechas({ desde = new Date(), meses = 12, digito } = {}) {
  const hoy = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate())
  const limite = new Date(hoy.getFullYear(), hoy.getMonth() + meses, hoy.getDate())
  const eventos = [...eventosDelAnio(hoy.getFullYear(), { digito }), ...eventosDelAnio(hoy.getFullYear() + 1, { digito })]

  for (const c of proximosCambios('America/Santiago', desde, 2)) {
    const local = new Date(c.instante.getTime() - 60000)
    eventos.push({
      date: new Date(local.getFullYear(), local.getMonth(), local.getDate()),
      titulo: c.despues < c.antes ? 'Cambio a horario de invierno (−1 hora)' : 'Cambio a horario de verano (+1 hora)',
      detalle: c.despues < c.antes ? 'A las 24:00 los relojes se atrasan a las 23:00.' : 'A las 24:00 los relojes se adelantan a la 01:00.',
      cat: 'hora',
    })
  }

  return eventos
    .filter((e) => (e.fin ?? e.date) >= hoy && e.date < limite)
    .sort((a, b) => a.date - b.date)
}

// Exporta eventos al formato iCalendar (.ics) para Google Calendar, Outlook o Apple
export function toICS(eventos) {
  const fmt = (x) => `${x.getFullYear()}${String(x.getMonth() + 1).padStart(2, '0')}${String(x.getDate()).padStart(2, '0')}`
  const esc = (s) => s.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n')
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//tgb.cl//Fechas clave Chile//ES', 'CALSCALE:GREGORIAN']
  for (const e of eventos) {
    const fin = e.fin ?? e.date
    const end = new Date(fin.getFullYear(), fin.getMonth(), fin.getDate() + 1)
    lines.push(
      'BEGIN:VEVENT',
      `UID:${fmt(e.date)}-${e.titulo.replace(/[^a-z0-9]/gi, '').slice(0, 40)}@tgb.cl`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${fmt(e.date)}`,
      `DTEND;VALUE=DATE:${fmt(end)}`,
      `SUMMARY:${esc(e.titulo)}`,
      `DESCRIPTION:${esc(e.detalle)}`,
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}
