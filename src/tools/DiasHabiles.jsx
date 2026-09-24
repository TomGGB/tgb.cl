import { useState } from 'react'
import { diasHabiles, sumarDiasHabiles, getFeriados } from '../lib/feriados'
import { toISODate, fromISODate, formatDateLong } from '../lib/format'
import { Field, NumberInput, Segmented } from '../components/ui'

export default function DiasHabiles() {
  const today = toISODate(new Date())
  const [modo, setModo] = useState('contar')
  const [desde, setDesde] = useState(today)
  const [hasta, setHasta] = useState(toISODate(new Date(Date.now() + 30 * 86400000)))
  const [n, setN] = useState(10)
  const [sabado, setSabado] = useState(false)

  const opts = { incluirSabado: sabado }
  const d1 = desde ? fromISODate(desde) : null
  const d2 = hasta ? fromISODate(hasta) : null

  let content = null
  if (modo === 'contar' && d1 && d2) {
    const habiles = diasHabiles(d1, d2, opts)
    const corridos = Math.abs(Math.round((d2 - d1) / 86400000)) + 1
    const [a, b] = d1 <= d2 ? [d1, d2] : [d2, d1]
    const feriadosEnRango = [...new Set([a.getFullYear(), b.getFullYear()])]
      .flatMap(getFeriados)
      .filter((f) => f.date >= a && f.date <= b && f.date.getDay() !== 0)
    content = (
      <div className="card result">
        <div className="big-result">
          <span>Días hábiles</span>
          <strong>{habiles}</strong>
          <small>{corridos} días corridos (ambas fechas incluidas)</small>
        </div>
        {feriadosEnRango.length > 0 && (
          <>
            <h3>Feriados descontados</h3>
            <ul className="simple-list">
              {feriadosEnRango.map((f) => (
                <li key={f.date.toISOString()}>
                  {f.date.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}: {f.name}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    )
  } else if (modo === 'sumar' && d1 && n > 0) {
    const fin = sumarDiasHabiles(d1, Math.min(n, 3650), opts)
    content = (
      <div className="card result">
        <div className="big-result">
          <span>El plazo vence el</span>
          <strong className="capitalize">{formatDateLong(fin)}</strong>
          <small>{Math.round((fin - d1) / 86400000)} días corridos desde la fecha de inicio</small>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="card">
        <Segmented
          label="Modo"
          value={modo}
          onChange={setModo}
          options={[
            { value: 'contar', label: 'Contar entre fechas' },
            { value: 'sumar', label: 'Sumar días hábiles' },
          ]}
        />
        <div className="form-grid">
          <Field label={modo === 'contar' ? 'Desde' : 'Fecha de inicio'}>
            {(id) => <input id={id} type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />}
          </Field>
          {modo === 'contar' ? (
            <Field label="Hasta">
              {(id) => <input id={id} type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />}
            </Field>
          ) : (
            <Field label="Días hábiles a sumar" hint="No cuenta el día de inicio">
              {(id) => <NumberInput id={id} value={n} onChange={setN} />}
            </Field>
          )}
        </div>
        <label className="checkbox">
          <input type="checkbox" checked={sabado} onChange={(e) => setSabado(e.target.checked)} />
          Contar sábados como hábiles (por ejemplo, plazos del Código Civil)
        </label>
      </div>
      {content}
    </>
  )
}
