import { useMemo } from 'react'
import regiones from '../data/regiones.json'
import { Field, Note } from '../components/ui'
import { useResult } from '../components/ux'
import { useUrlState } from '../lib/useUrlState'
import { useShareText } from '../lib/share'

const D = (m, d) => new Date(2026, m - 1, d)

// Calendario escolar 2026 (Mineduc). Vacaciones de invierno por región.
const INVIERNO = {
  15: [D(7, 13), D(7, 24)], // Arica y Parinacota
  1: [D(7, 13), D(7, 24)], // Tarapacá
  2: [D(7, 6), D(7, 17)], // Antofagasta
  10: [D(7, 6), D(7, 17)], // Los Lagos
  11: [D(7, 6), D(7, 24)], // Aysén
  12: [D(6, 29), D(7, 17)], // Magallanes
}
const INVIERNO_GENERAL = [D(6, 22), D(7, 3)] // de Atacama a Los Ríos

const INICIO = D(3, 4)
const TERMINO = [D(12, 4), D(12, 18)] // "entre el 4 y el 18 de diciembre en la mayoría de las regiones"

const fmt = (d, opts = { weekday: 'long', day: 'numeric', month: 'long' }) => d.toLocaleDateString('es-CL', opts)
const diasEntre = (a, b) => Math.round((b - a) / 86400000)

export default function CalendarioEscolar() {
  const [regionId, setRegionId] = useUrlState('region', 13)
  const region = regiones.find((r) => r.id === regionId) ?? regiones.find((r) => r.id === 13)
  const invierno = INVIERNO[region.id] ?? INVIERNO_GENERAL
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const eventos = useMemo(
    () => [
      { id: 'inicio', titulo: 'Inicio de clases', desde: INICIO, detalle: 'Los docentes vuelven el lunes 2 de marzo.' },
      { id: 'invierno', titulo: 'Vacaciones de invierno', desde: invierno[0], hasta: invierno[1], detalle: `Vuelta a clases el ${fmt(new Date(invierno[1].getFullYear(), invierno[1].getMonth(), invierno[1].getDate() + 3))}.` },
      { id: 'termino', titulo: 'Término del año escolar', desde: TERMINO[0], hasta: TERMINO[1], rango: true, detalle: 'La fecha exacta depende de la región y del nivel; 4.º medio termina antes.' },
    ],
    [invierno],
  )

  const siguiente = eventos.find((e) => (e.hasta ?? e.desde) >= hoy)
  const faltan = siguiente ? Math.max(0, diasEntre(hoy, siguiente.desde)) : null
  const enCurso = siguiente && siguiente.hasta && !siguiente.rango && siguiente.desde <= hoy

  useResult(siguiente ? siguiente.titulo : 'Año escolar', siguiente ? (enCurso ? 'En curso' : `En ${faltan} días`) : 'Terminado')
  useShareText(siguiente ? `${siguiente.titulo} en ${region.nombre}: ${enCurso ? 'en curso' : `faltan ${faltan} días`}` : null)

  return (
    <>
      <div className="card">
        <Field label="Región">
          {(id) => (
            <select id={id} value={region.id} onChange={(e) => setRegionId(Number(e.target.value))}>
              {regiones.map((r) => (
                <option key={r.id} value={r.id}>{r.romano} · {r.nombre}</option>
              ))}
            </select>
          )}
        </Field>
      </div>

      {siguiente && (
        <div className="card next-holiday">
          <span className="eyebrow">Lo que viene en {region.nombre}</span>
          <strong>{siguiente.titulo}</strong>
          <span>
            {enCurso
              ? `En curso hasta el ${fmt(siguiente.hasta)}`
              : siguiente.rango
                ? `Entre el ${fmt(siguiente.desde, { day: 'numeric', month: 'long' })} y el ${fmt(siguiente.hasta, { day: 'numeric', month: 'long' })}: faltan unos ${faltan} días`
                : `${fmt(siguiente.desde)}: faltan ${faltan} días`}
          </span>
        </div>
      )}

      <ul className="event-list">
        {eventos.map((e) => {
          const pasado = (e.hasta ?? e.desde) < hoy
          return (
            <li key={e.id} className={`event blue ${pasado ? 'past-event' : ''}`}>
              <div className="event-date">
                <span className="day">{e.desde.getDate()}</span>
                <span className="month">{fmt(e.desde, { month: 'short' })}</span>
              </div>
              <div className="event-info">
                <strong>{e.titulo}</strong>
                <span>
                  {e.hasta
                    ? `${e.rango ? 'Entre el' : 'Del'} ${fmt(e.desde, { day: 'numeric', month: 'long' })} ${e.rango ? 'y el' : 'al'} ${fmt(e.hasta, { day: 'numeric', month: 'long' })}. `
                    : `${fmt(e.desde)}. `}
                  {e.detalle}
                </span>
              </div>
              {pasado && <span className="tag">Ya pasó</span>}
            </li>
          )
        })}
      </ul>

      <Note>
        Calendario escolar 2026 oficializado por el Ministerio de Educación para establecimientos con financiamiento del Estado.
        Los colegios particulares pagados pueden tener fechas propias. Las fechas exactas de término por región y nivel están en
        los calendarios regionales de ayudamineduc.cl. El calendario 2027 se agregará cuando el Mineduc lo publique.
      </Note>
    </>
  )
}
