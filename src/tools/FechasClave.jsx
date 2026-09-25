import { useMemo } from 'react'
import { proximasFechas, toICS, CATEGORIAS, MES_REVISION } from '../lib/calendario'
import { descargar } from '../lib/download'
import { Field, Note } from '../components/ui'
import { useUrlState } from '../lib/useUrlState'
import { Icon } from '../components/icons'

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function faltan(date, fin, hoy) {
  if (date <= hoy && fin && fin >= hoy) {
    const d = Math.round((fin - hoy) / 86400000)
    return { text: d === 0 ? 'Vence hoy' : `En curso · quedan ${d} ${d === 1 ? 'día' : 'días'}`, urgente: d <= 7 }
  }
  const d = Math.round((date - hoy) / 86400000)
  if (d === 0) return { text: 'Hoy', urgente: true }
  if (d === 1) return { text: 'Mañana', urgente: true }
  return { text: `En ${d} días`, urgente: d <= 7 }
}

export default function FechasClave() {
  const [digito, setDigito] = useUrlState('patente', '')
  const [filtro, setFiltro] = useUrlState('cat', '')
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const eventos = useMemo(() => proximasFechas({ meses: 12, digito: digito === '' ? undefined : Number(digito) }), [digito])
  const visibles = filtro ? eventos.filter((e) => e.cat === filtro) : eventos

  // agrupar por mes
  const grupos = []
  for (const e of visibles) {
    const key = `${e.date.getFullYear()}-${e.date.getMonth()}`
    let g = grupos.find((x) => x.key === key)
    if (!g) grupos.push((g = { key, titulo: `${MESES[e.date.getMonth()]} ${e.date.getFullYear()}`, items: [] }))
    g.items.push(e)
  }

  return (
    <>
      <div className="card">
        <div className="form-grid">
          <Field label="Último dígito de tu patente" hint="Para mostrar el mes de tu revisión técnica">
            {(id) => (
              <select id={id} value={digito} onChange={(e) => setDigito(e.target.value)}>
                <option value="">No tengo auto / no mostrar</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d) => (
                  <option key={d} value={String(d)}>Termina en {d} ({MESES[MES_REVISION[d] - 1]})</option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Mostrar">
            {(id) => (
              <select id={id} value={filtro} onChange={(e) => setFiltro(e.target.value)}>
                <option value="">Todas las fechas</option>
                {Object.entries(CATEGORIAS).map(([k, c]) => (
                  <option key={k} value={k}>{c.label}</option>
                ))}
              </select>
            )}
          </Field>
        </div>
        <div className="inline-actions">
          <button
            type="button"
            className="btn"
            onClick={() => descargar('fechas-clave-chile.ics', toICS(visibles), 'text/calendar;charset=utf-8')}
          >
            <Icon name="CalendarPlus" size={17} /> Agregar a mi calendario (.ics)
          </button>
          <span className="muted small">Funciona con Google Calendar, Outlook y el calendario del iPhone.</span>
        </div>
      </div>

      {grupos.map((g) => (
        <section key={g.key} className="month-group">
          <h2 className="month-title">{g.titulo}</h2>
          <ul className="event-list">
            {g.items.map((e) => {
              const f = faltan(e.date, e.fin, hoy)
              const cat = CATEGORIAS[e.cat]
              return (
                <li key={`${e.titulo}-${e.date.getTime()}`} className={`event ${cat.color}`}>
                  <div className="event-date">
                    <span className="day">{e.date.getDate()}</span>
                    <span className="month">{MESES[e.date.getMonth()].slice(0, 3)}</span>
                  </div>
                  <div className="event-info">
                    <strong>{e.titulo}</strong>
                    <span>
                      {e.fin && `Hasta el ${e.fin.getDate()} de ${MESES[e.fin.getMonth()]}. `}
                      {e.detalle}
                    </span>
                  </div>
                  <span className={`event-when ${f.urgente ? 'urgent' : ''}`}>{f.text}</span>
                </li>
              )
            })}
          </ul>
        </section>
      ))}

      <Note>
        Fechas generales para personas. Si el vencimiento cae en fin de semana o feriado, suele correrse al siguiente día
        hábil; confirma siempre en el SII, la Tesorería o tu municipalidad. Los vehículos de carga, taxis y buses tienen
        calendarios distintos para el permiso de circulación.
      </Note>
    </>
  )
}
