import { useEffect, useMemo, useState } from 'react'
import playas from '../data/playas.json'
import { formatNum } from '../lib/format'
import { Field, Note } from '../components/ui'
import { Icon } from '../components/icons'
import { useUrlState } from '../lib/useUrlState'
import { useShareText } from '../lib/share'

const DIRS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO']
const dir = (deg) => (deg === null || deg === undefined ? '—' : DIRS[Math.round(deg / 22.5) % 16])
const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

// Descripción del estado del mar según altura significativa de ola (referencial)
function estadoMar(h) {
  if (h < 0.5) return { label: 'Mar calmo', color: 'var(--ok)' }
  if (h < 1.25) return { label: 'Olas pequeñas', color: 'var(--ok)' }
  if (h < 2) return { label: 'Olas moderadas', color: 'var(--warn)' }
  if (h < 3) return { label: 'Olas grandes', color: 'var(--copper)' }
  return { label: 'Marejada', color: 'var(--accent)' }
}

export default function Olas() {
  const [idx, setIdx] = useUrlState('playa', 7)
  const playa = playas[idx] ?? playas[0]
  const [data, setData] = useState({ marine: null, wind: null, error: null })

  useEffect(() => {
    let alive = true
    setData({ marine: null, wind: null, error: null })
    const m = new URLSearchParams({
      latitude: playa.lat,
      longitude: playa.lon,
      current: 'wave_height,wave_period,wave_direction,sea_surface_temperature',
      hourly: 'wave_height,wave_period',
      daily: 'wave_height_max,wave_period_max,wave_direction_dominant',
      timezone: 'auto',
      forecast_days: '6',
    })
    const w = new URLSearchParams({
      latitude: playa.lat,
      longitude: playa.lon,
      current: 'wind_speed_10m,wind_direction_10m,temperature_2m',
      daily: 'wind_speed_10m_max',
      timezone: 'auto',
      forecast_days: '6',
    })
    Promise.all([
      fetch(`https://marine-api.open-meteo.com/v1/marine?${m}`).then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status)))),
      fetch(`https://api.open-meteo.com/v1/forecast?${w}`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ])
      .then(([marine, wind]) => alive && setData({ marine, wind, error: null }))
      .catch((error) => alive && setData({ marine: null, wind: null, error }))
    return () => {
      alive = false
    }
  }, [playa])

  const c = data.marine?.current
  const estado = c ? estadoMar(c.wave_height) : null

  // próximas 48 horas, cada 3 horas
  const horas = useMemo(() => {
    const h = data.marine?.hourly
    if (!h) return []
    const now = data.marine.current.time.slice(0, 13)
    const start = Math.max(0, h.time.findIndex((t) => t.slice(0, 13) >= now))
    return h.time.slice(start, start + 48).map((t, i) => ({ t, h: h.wave_height[start + i], p: h.wave_period[start + i] })).filter((_, i) => i % 3 === 0)
  }, [data.marine])
  const maxH = Math.max(1, ...horas.map((x) => x.h ?? 0))

  useShareText(c ? `Olas en ${playa.nombre}: ${formatNum(c.wave_height, 1)} m cada ${formatNum(c.wave_period, 0)} s, agua a ${formatNum(c.sea_surface_temperature, 0)}°C` : null)

  return (
    <>
      <div className="card">
        <Field label="Playa">
          {(id) => (
            <select id={id} value={idx} onChange={(e) => setIdx(Number(e.target.value))}>
              {playas.map((p, i) => (
                <option key={p.nombre} value={i}>{p.nombre} ({p.region})</option>
              ))}
            </select>
          )}
        </Field>
      </div>

      {data.error && <Note>No se pudo obtener el pronóstico del mar. Intenta de nuevo en unos minutos.</Note>}
      {!data.marine && !data.error && <div className="card loading-block">Cargando pronóstico del mar…</div>}

      {c && (
        <>
          <div className="card result">
            <div className="big-result">
              <span>{playa.nombre}, ahora</span>
              <strong>{formatNum(c.wave_height, 1)} m</strong>
              <small style={{ color: estado.color, fontWeight: 700 }}>{estado.label}</small>
            </div>
            <dl className="sea-grid">
              <div><dt><Icon name="Timer" size={15} /> Período</dt><dd>{formatNum(c.wave_period, 0)} s</dd></div>
              <div><dt><Icon name="Navigation" size={15} /> Dirección del oleaje</dt><dd>{dir(c.wave_direction)}</dd></div>
              <div><dt><Icon name="Thermometer" size={15} /> Agua</dt><dd>{formatNum(c.sea_surface_temperature, 0)} °C</dd></div>
              {data.wind?.current && (
                <div><dt><Icon name="Wind" size={15} /> Viento</dt><dd>{formatNum(data.wind.current.wind_speed_10m, 0)} km/h {dir(data.wind.current.wind_direction_10m)}</dd></div>
              )}
            </dl>
          </div>

          {horas.length > 0 && (
            <div className="card">
              <h2>Próximas 48 horas</h2>
              <div className="wave-bars" role="img" aria-label="Altura de ola cada 3 horas">
                {horas.map((x) => (
                  <div key={x.t} className="wave-bar" title={`${x.t.slice(11, 16)}: ${formatNum(x.h, 1)} m, ${formatNum(x.p, 0)} s`}>
                    <small>{formatNum(x.h, 1)}</small>
                    <span style={{ height: `${((x.h ?? 0) / maxH) * 100}%` }} />
                    <em>{x.t.slice(11, 13) === '00' ? DIAS[new Date(`${x.t}:00`).getDay()] : x.t.slice(11, 13)}</em>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <h2>Próximos días</h2>
            <ul className="forecast">
              {data.marine.daily.time.map((d, i) => {
                const date = new Date(`${d}T12:00:00`)
                const h = data.marine.daily.wave_height_max[i]
                return (
                  <li key={d} className="sea-day">
                    <span className="fc-day">{i === 0 ? 'Hoy' : `${DIAS[date.getDay()]} ${date.getDate()}`}</span>
                    <span><strong>{formatNum(h, 1)} m</strong> <span className="muted small">máx.</span></span>
                    <span className="muted small">{formatNum(data.marine.daily.wave_period_max[i], 0)} s · {dir(data.marine.daily.wave_direction_dominant[i])}</span>
                    <span className="muted small">{data.wind?.daily ? `viento ${formatNum(data.wind.daily.wind_speed_10m_max[i], 0)} km/h` : ''}</span>
                    <span className="sea-tag" style={{ color: estadoMar(h).color }}>{estadoMar(h).label}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </>
      )}

      <Note>
        Pronóstico de oleaje de Open-Meteo (modelos globales), útil para surf, pesca o planificar un día de playa. No reemplaza
        los avisos oficiales: revisa las marejadas en el SHOA y respeta las banderas de la Armada. Bandera roja o playa no
        apta: no te bañes.
      </Note>
    </>
  )
}
