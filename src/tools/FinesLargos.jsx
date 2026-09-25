import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { planificarFinesLargos } from '../lib/findes'
import { Note } from '../components/ui'
import { useUrlState } from '../lib/useUrlState'

const fmt = (d, opts = { weekday: 'short', day: 'numeric', month: 'short' }) => d.toLocaleDateString('es-CL', opts)

function MiniCalendario({ desde, hasta, vacaciones, feriados }) {
  // mostrar desde el lunes anterior hasta el domingo posterior
  const start = new Date(desde)
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  const end = new Date(hasta)
  end.setDate(end.getDate() + ((7 - end.getDay()) % 7))
  const dias = []
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) dias.push(new Date(d))
  const esVac = (d) => vacaciones.some((v) => v.getTime() === d.getTime())
  const esFer = (d) => feriados.some((f) => f.date.getTime() === d.getTime())
  return (
    <div className="mini-cal" aria-hidden="true">
      {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((l, i) => (
        <span key={i} className="mini-cal-head">{l}</span>
      ))}
      {dias.map((d) => {
        const dentro = d >= desde && d <= hasta
        const cls = !dentro ? 'out' : esVac(d) ? 'vac' : esFer(d) ? 'fer' : 'free'
        return (
          <span key={d.getTime()} className={`mini-cal-day ${cls}`}>{d.getDate()}</span>
        )
      })}
    </div>
  )
}

export default function FinesLargos() {
  const thisYear = new Date().getFullYear()
  const [year, setYear] = useUrlState('anio', thisYear)
  const [maxDias, setMaxDias] = useUrlState('max', 2)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const plan = useMemo(() => planificarFinesLargos(year, { maxDias: 3 }), [year])
  const resumen = plan.reduce(
    (acc, p) => {
      const o = [...p.opciones].reverse().find((x) => x.pedidos <= maxDias && x.total >= 3)
      if (o) {
        acc.libres += o.total
        acc.pedidos += o.pedidos
      }
      return acc
    },
    { libres: 0, pedidos: 0 },
  )

  return (
    <>
      <div className="card controls-row">
        <div className="year-switch compact">
          <button type="button" className="btn-ghost" onClick={() => setYear(year - 1)} aria-label="Año anterior">‹</button>
          <strong>{year}</strong>
          <button type="button" className="btn-ghost" onClick={() => setYear(year + 1)} aria-label="Año siguiente">›</button>
        </div>
        <label className="inline-group">
          Pedir hasta
          <select value={maxDias} onChange={(e) => setMaxDias(Number(e.target.value))}>
            {[0, 1, 2, 3].map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? 'día' : 'días'}</option>
            ))}
          </select>
          de vacaciones por feriado
        </label>
      </div>

      <div className="card result">
        <div className="big-result">
          <span>Pidiendo {resumen.pedidos} días de vacaciones en {year}</span>
          <strong>{resumen.libres} días libres</strong>
          <small>en bloques de fin de semana largo (incluye sábados, domingos y feriados)</small>
        </div>
      </div>

      <ul className="bridge-list">
        {plan.map((p) => {
          const opciones = p.opciones.filter((o) => o.pedidos <= maxDias && o.total >= 3)
          if (!opciones.length) return null
          const mejor = opciones[opciones.length - 1]
          const pasado = mejor.hasta < hoy
          return (
            <li key={p.feriado.date.getTime()} className={`card bridge ${pasado ? 'past' : ''}`}>
              <div className="bridge-head">
                <div>
                  <strong>{p.feriados.map((f) => f.name).filter((v, i, a) => a.indexOf(v) === i).join(' + ')}</strong>
                  <span className="muted small"> · {fmt(p.feriado.date, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                </div>
                {pasado && <span className="tag">Ya pasó</span>}
              </div>
              <div className="bridge-body">
                <MiniCalendario desde={mejor.desde} hasta={mejor.hasta} vacaciones={mejor.vacaciones} feriados={p.feriados} />
                <ul className="bridge-options">
                  {opciones.map((o) => (
                    <li key={o.pedidos} className={o === mejor ? 'best' : ''}>
                      <strong>{o.total} días libres</strong>{' '}
                      {o.pedidos === 0 ? (
                        <span>sin pedir días</span>
                      ) : (
                        <span>
                          pidiendo {o.vacaciones.map((v) => fmt(v)).join(' y ')}
                        </span>
                      )}
                      <span className="muted small"> ({fmt(o.desde)} → {fmt(o.hasta)})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="legend">
        <span><i className="free" /> Fin de semana</span>
        <span><i className="fer" /> Feriado</span>
        <span><i className="vac" /> Vacaciones que pides</span>
      </div>

      <Note>
        Calculado con los <Link to="/feriados/">feriados nacionales</Link> y jornada de lunes a viernes. Los feriados que
        caen en fin de semana no generan fines de semana largos. Coordina tus vacaciones con tu empleador con anticipación.
      </Note>
    </>
  )
}
