import { useEffect, useMemo, useState } from 'react'
import { tiempoRestante, proximaFecha } from '../lib/hogar'
import { proximoFeriado } from '../lib/feriados'
import { Field, Note } from '../components/ui'
import { useResult } from '../components/ux'
import { useUrlState } from '../lib/useUrlState'
import { useShareText } from '../lib/share'

function eventosFijos() {
  const f = proximoFeriado()
  return [
    { id: 'dieciocho', nombre: 'Fiestas Patrias', fecha: proximaFecha(9, 18) },
    { id: 'navidad', nombre: 'Navidad', fecha: proximaFecha(12, 25) },
    { id: 'anionuevo', nombre: 'Año Nuevo', fecha: proximaFecha(1, 1) },
    { id: 'feriado', nombre: `Próximo feriado: ${f.name}`, fecha: f.date },
    { id: 'verano', nombre: 'Primer día de verano', fecha: proximaFecha(12, 21) },
  ]
}

export default function CuentaRegresiva() {
  const [evento, setEvento] = useUrlState('evento', 'dieciocho')
  const [nombre, setNombre] = useUrlState('nombre', '')
  const [fecha, setFecha] = useUrlState('fecha', '')
  const [ahora, setAhora] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const fijos = useMemo(eventosFijos, [])
  const propio = evento === 'propio'
  const destino = propio ? (fecha ? new Date(fecha.length > 10 ? fecha : `${fecha}T00:00`) : null) : fijos.find((e) => e.id === evento)?.fecha
  const titulo = propio ? nombre || 'Mi evento' : fijos.find((e) => e.id === evento)?.nombre
  const t = destino ? tiempoRestante(destino, ahora) : null

  useResult(titulo, t ? (t.pasado ? '¡Llegó!' : `${t.dias} días`) : null)
  useShareText(t ? (t.pasado ? `¡Llegó ${titulo}!` : `Faltan ${t.dias} días, ${t.horas} horas y ${t.minutos} minutos para ${titulo}`) : null)

  return (
    <>
      <div className="card">
        <div className="chip-picker" role="group" aria-label="Elige un evento">
          {fijos.map((e) => (
            <button key={e.id} type="button" className={evento === e.id ? 'active' : ''} onClick={() => setEvento(e.id)} aria-pressed={evento === e.id}>
              {e.nombre}
            </button>
          ))}
          <button type="button" className={propio ? 'active' : ''} onClick={() => setEvento('propio')} aria-pressed={propio}>
            Mi propio evento
          </button>
        </div>
        {propio && (
          <div className="form-grid spaced">
            <Field label="Nombre del evento">
              {(id) => <input id={id} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Mis vacaciones, cumpleaños, viaje…" />}
            </Field>
            <Field label="Fecha y hora">
              {(id) => <input id={id} type="datetime-local" value={fecha} onChange={(e) => setFecha(e.target.value)} />}
            </Field>
          </div>
        )}
      </div>

      {t ? (
        <div className="card next-holiday countdown-card">
          <span className="eyebrow">{t.pasado ? '¡Llegó el día!' : 'Faltan'}</span>
          <strong>{titulo}</strong>
          {!t.pasado && (
            <div className="countdown" role="timer" aria-live="off">
              {[
                [t.dias, 'días'],
                [t.horas, 'horas'],
                [t.minutos, 'min'],
                [t.segundos, 'seg'],
              ].map(([v, l]) => (
                <div key={l}>
                  <strong>{String(v).padStart(2, '0')}</strong>
                  <span>{l}</span>
                </div>
              ))}
            </div>
          )}
          <span className="small capitalize">
            {destino.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      ) : (
        <Note>Elige la fecha de tu evento para empezar la cuenta regresiva.</Note>
      )}

      <Note>
        Comparte tu cuenta regresiva con el botón de WhatsApp o copiando el enlace: quien lo abra verá el mismo evento y el
        tiempo que falta en su propio reloj.
      </Note>
    </>
  )
}
