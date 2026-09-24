import { useState } from 'react'
import { getFeriados, proximoFeriado, esFinDeSemanaLargo } from '../lib/feriados'
import { Note } from '../components/ui'

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

export default function Feriados() {
  const thisYear = new Date().getFullYear()
  const [year, setYear] = useState(thisYear)
  const feriados = getFeriados(year)
  const proximo = proximoFeriado()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dias = Math.round((proximo.date - today) / 86400000)
  const largos = feriados.filter(esFinDeSemanaLargo).length

  return (
    <>
      <div className="card next-holiday">
        <span className="eyebrow">Próximo feriado</span>
        <strong>{proximo.name}</strong>
        <span>
          {DIAS[proximo.date.getDay()]} {proximo.date.toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })} ·{' '}
          {dias === 0 ? '¡es hoy!' : `faltan ${dias} ${dias === 1 ? 'día' : 'días'}`}
        </span>
      </div>

      <div className="year-switch">
        <button type="button" className="btn-ghost" onClick={() => setYear(year - 1)} aria-label="Año anterior">‹ {year - 1}</button>
        <h2>Feriados {year}</h2>
        <button type="button" className="btn-ghost" onClick={() => setYear(year + 1)} aria-label="Año siguiente">{year + 1} ›</button>
      </div>
      <p className="muted small center">
        {feriados.length} feriados · {largos} fines de semana largos (feriado en lunes o viernes)
      </p>

      <ul className="holiday-list">
        {feriados.map((f) => {
          const past = f.date < today
          const dow = f.date.getDay()
          return (
            <li key={f.date.toISOString()} className={`${past ? 'past' : ''} ${dow === 0 || dow === 6 ? 'weekend' : ''}`}>
              <div className="holiday-date">
                <span className="day">{f.date.getDate()}</span>
                <span className="month">{f.date.toLocaleDateString('es-CL', { month: 'short' })}</span>
              </div>
              <div className="holiday-info">
                <strong>{f.name}</strong>
                <span className="dow">{DIAS[dow]}</span>
              </div>
              <div className="tags">
                {f.irrenunciable && <span className="tag red">Irrenunciable</span>}
                {esFinDeSemanaLargo(f) && <span className="tag blue">Fin de semana largo</span>}
              </div>
            </li>
          )
        })}
      </ul>

      <Note>
        Feriados nacionales calculados según la ley vigente. Los feriados irrenunciables también aplican al comercio. No
        incluye feriados regionales (7 de junio en Arica y Parinacota, 20 de agosto en Chillán y Chillán Viejo) ni feriados
        por elecciones que se definan después.
      </Note>
    </>
  )
}
