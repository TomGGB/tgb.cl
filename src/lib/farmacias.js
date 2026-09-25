// Farmacias de turno del MINSAL (Farmanet). Solo se muestran los turnos del día más reciente.
import regiones from '../data/regiones.json'

const API = 'https://midas.minsal.cl/farmacia_v2/WS/getLocalesTurnos.php'

const normalize = (s) =>
  String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .trim()

// comuna normalizada -> { nombre, region }
const COMUNAS = new Map(regiones.flatMap((r) => r.comunas.map((c) => [normalize(c.nombre), { nombre: c.nombre, region: r.nombre }])))

const titleCase = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/(^|[\s(/-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase())
    .replace(/\b(De|Del|La|Las|Los|Y|El)\b/g, (w) => w.toLowerCase())
    .replace(/^./, (c) => c.toUpperCase())

const hora = (h) => (h ? h.slice(0, 5) : '')

export async function fetchFarmacias() {
  const r = await fetch(API)
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  const data = await r.json()
  const fechas = [...new Set(data.map((d) => d.fecha))].sort()
  const ultima = fechas[fechas.length - 1]
  return {
    fecha: ultima,
    locales: data
      .filter((d) => d.fecha === ultima && d.local_lat && d.local_lng)
      .map((d) => {
        const c = COMUNAS.get(normalize(d.comuna_nombre))
        const abre = hora(d.funcionamiento_hora_apertura)
        const cierra = hora(d.funcionamiento_hora_cierre)
        return {
          id: d.local_id,
          nombre: titleCase(d.local_nombre),
          direccion: titleCase(d.local_direccion),
          comuna: c?.nombre ?? titleCase(d.comuna_nombre),
          region: c?.region ?? 'Otra',
          telefono: (d.local_telefono ?? '').replace(/\D/g, ''),
          lat: parseFloat(d.local_lat),
          lon: parseFloat(d.local_lng),
          abre,
          cierra,
          // 09:00 a 08:59, 00:00 a 23:59 o 00:00 a 00:00 = turno de 24 horas
          h24: abre === cierra || (abre === '00:00' && cierra === '23:59') || (cierra < abre && minutos(abre) - minutos(cierra) <= 1),
        }
      }),
  }
}

const minutos = (h) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5))

// Teléfono con prefijo para enlace tel: (fijos de 7-9 dígitos sin código de área se dejan tal cual)
export const telHref = (t) => (t.length === 9 ? `tel:+56${t}` : `tel:${t}`)
