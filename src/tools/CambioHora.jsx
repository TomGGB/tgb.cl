import { useEffect, useMemo, useState } from 'react'
import { ZONAS, resolverZona, offsetMinutos, formatOffset, proximosCambios, formatEnZona } from '../lib/hora'
import { Note } from '../components/ui'

const TZ = 'America/Santiago'

function useNow(ms = 1000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), ms)
    return () => clearInterval(id)
  }, [ms])
  return now
}

function Countdown({ to, now }) {
  let s = Math.max(0, Math.floor((to - now) / 1000))
  const d = Math.floor(s / 86400)
  s -= d * 86400
  const h = Math.floor(s / 3600)
  s -= h * 3600
  const m = Math.floor(s / 60)
  s -= m * 60
  return (
    <div className="countdown" role="timer">
      {[
        [d, 'días'],
        [h, 'horas'],
        [m, 'min'],
        [s, 'seg'],
      ].map(([v, l]) => (
        <div key={l}>
          <strong>{String(v).padStart(2, '0')}</strong>
          <span>{l}</span>
        </div>
      ))}
    </div>
  )
}

// Describe la transición en hora local: "a las 24:00 del sábado 4 de abril los relojes pasan a las 23:00"
function describir(c) {
  const antes = new Date(c.instante.getTime() + c.antes * 60000)
  const despues = new Date(c.instante.getTime() + c.despues * 60000)
  const fmt = (d) => `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
  const horaAntes = fmt(antes) === '00:00' ? '24:00' : fmt(antes)
  const diaAntes = new Date(antes.getTime() - (fmt(antes) === '00:00' ? 60000 : 0))
  const dia = diaAntes.toLocaleDateString('es-CL', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const atrasa = c.despues < c.antes
  return {
    atrasa,
    titulo: atrasa ? 'Se atrasa una hora (comienza el horario de invierno)' : 'Se adelanta una hora (comienza el horario de verano)',
    texto: `El ${dia}, a las ${horaAntes}, los relojes pasan a las ${fmt(despues)}.`,
    consejo: atrasa ? 'Esa noche dormirás una hora más.' : 'Esa noche dormirás una hora menos.',
  }
}

export default function CambioHora() {
  const now = useNow()
  const horaActual = now.getUTCHours()
  // se recalcula una vez por hora, no en cada tic del reloj
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cambios = useMemo(() => proximosCambios(TZ, new Date(), 2), [horaActual])
  const proximo = cambios[0]
  const info = proximo && describir(proximo)

  return (
    <>
      {proximo ? (
        <div className="card next-holiday">
          <span className="eyebrow">Próximo cambio de hora en Chile continental</span>
          <strong>{info.titulo}</strong>
          <span>{info.texto}</span>
          <Countdown to={proximo.instante} now={now} />
          <span className="small">{info.consejo} Los celulares y computadores se ajustan solos.</span>
        </div>
      ) : (
        <Note>No hay cambios de hora programados en la base de datos de tu navegador.</Note>
      )}

      <h2 className="section-title">Hora actual en Chile</h2>
      <div className="clock-grid">
        {ZONAS.map((z) => {
          const tz = resolverZona(z)
          const off = offsetMinutos(tz, now)
          return (
            <div key={z.id} className="clock">
              <span className="clock-name">{z.nombre}</span>
              <strong className="clock-time">{formatEnZona(now, tz, { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })}</strong>
              <span className="clock-meta">{formatOffset(off)} · {z.detalle}</span>
            </div>
          )
        })}
      </div>

      {cambios.length > 1 && (
        <div className="card">
          <h2>Cambios siguientes</h2>
          <ul className="simple-list">
            {cambios.map((c) => {
              const d = describir(c)
              return (
                <li key={c.instante.toISOString()}>
                  <span>{d.texto}</span>
                  <span className="tag blue">{d.atrasa ? '−1 hora' : '+1 hora'}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <Note>
        En Chile continental el horario de invierno (UTC−4) comienza el primer domingo de abril y el de verano (UTC−3) el
        primer domingo de septiembre. Magallanes y Aysén mantienen UTC−3 todo el año, y Rapa Nui cambia en las mismas
        fechas con dos horas menos que el continente. Las fechas se calculan con la base de datos de zonas horarias de tu
        dispositivo; si el Gobierno modifica el calendario, mantén tu sistema actualizado.
      </Note>
    </>
  )
}
