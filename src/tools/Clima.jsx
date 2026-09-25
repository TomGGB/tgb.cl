import { useEffect, useMemo, useState } from 'react'
import regiones from '../data/regiones.json'
import { formatNum } from '../lib/format'
import { Field, Note } from '../components/ui'
import { useUrlState } from '../lib/useUrlState'

const COMUNAS = regiones.flatMap((r) => r.comunas.map((c) => ({ ...c, region: r.nombre, regionId: r.id })))
const byCut = (cut) => COMUNAS.find((c) => c.cut === cut)

const WMO = {
  0: ['Despejado', '☀️', '🌙'],
  1: ['Mayormente despejado', '🌤️', '🌙'],
  2: ['Parcialmente nublado', '⛅', '☁️'],
  3: ['Nublado', '☁️', '☁️'],
  45: ['Niebla', '🌫️'],
  48: ['Niebla con escarcha', '🌫️'],
  51: ['Llovizna débil', '🌦️'],
  53: ['Llovizna', '🌦️'],
  55: ['Llovizna intensa', '🌧️'],
  56: ['Llovizna helada', '🌧️'],
  57: ['Llovizna helada intensa', '🌧️'],
  61: ['Lluvia débil', '🌦️'],
  63: ['Lluvia', '🌧️'],
  65: ['Lluvia intensa', '🌧️'],
  66: ['Lluvia helada', '🌧️'],
  67: ['Lluvia helada intensa', '🌧️'],
  71: ['Nieve débil', '🌨️'],
  73: ['Nieve', '🌨️'],
  75: ['Nieve intensa', '❄️'],
  77: ['Granizo fino', '🌨️'],
  80: ['Chubascos débiles', '🌦️'],
  81: ['Chubascos', '🌧️'],
  82: ['Chubascos fuertes', '⛈️'],
  85: ['Chubascos de nieve', '🌨️'],
  86: ['Chubascos de nieve fuertes', '❄️'],
  95: ['Tormenta eléctrica', '⛈️'],
  96: ['Tormenta con granizo', '⛈️'],
  99: ['Tormenta con granizo fuerte', '⛈️'],
}
const wmo = (code, isDay = 1) => {
  const w = WMO[code] ?? ['—', '🌡️']
  return { text: w[0], icon: !isDay && w[2] ? w[2] : w[1] }
}

// Escala de índice UV de la OMS
function uvInfo(uv) {
  if (uv < 3) return { label: 'Bajo', color: '#2e7d32', tip: 'No se necesita protección especial.' }
  if (uv < 6) return { label: 'Moderado', color: '#f9a825', tip: 'Usa bloqueador y lentes de sol si estás mucho rato al aire libre.' }
  if (uv < 8) return { label: 'Alto', color: '#ef6c00', tip: 'Bloqueador FPS 30+, sombrero y evita el sol entre 11:00 y 16:00.' }
  if (uv < 11) return { label: 'Muy alto', color: '#c62828', tip: 'Protección extra: bloqueador cada 2 horas, ropa que cubra y sombra.' }
  return { label: 'Extremo', color: '#6a1b9a', tip: 'Evita exponerte al sol en las horas centrales del día.' }
}

// Categorías de MP2,5 según la norma chilena (promedio de 24 horas)
function pmInfo(v) {
  if (v < 50) return { label: 'Bueno', color: '#2e7d32' }
  if (v < 80) return { label: 'Regular', color: '#f9a825' }
  if (v < 110) return { label: 'Nivel de alerta', color: '#ef6c00' }
  if (v < 170) return { label: 'Nivel de preemergencia', color: '#c62828' }
  return { label: 'Nivel de emergencia', color: '#6a1b9a' }
}

function distanciaKm(a, b) {
  const R = 6371
  const toRad = (x) => (x * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

const hora = (iso) => iso.slice(11, 16)
const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

export default function Clima() {
  const [cut, setCut] = useUrlState('comuna', 13101)
  const comuna = byCut(cut) ?? byCut(13101)
  const [regionId, setRegionId] = useState(comuna.regionId)
  const [geoMsg, setGeoMsg] = useState(null)
  const [data, setData] = useState({ wx: null, air: null, error: null })

  useEffect(() => setRegionId(comuna.regionId), [comuna.regionId])

  useEffect(() => {
    let alive = true
    setData((d) => ({ ...d, error: null }))
    const { lat, lon } = comuna
    const wxQs = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day,precipitation',
      hourly: 'uv_index,temperature_2m,precipitation_probability,weather_code,is_day',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset',
      timezone: 'auto',
      forecast_days: '7',
    })
    const airQs = new URLSearchParams({ latitude: lat, longitude: lon, current: 'pm2_5,pm10', hourly: 'pm2_5', past_days: '1', forecast_days: '1', timezone: 'auto' })
    Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?${wxQs}`).then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status)))),
      fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${airQs}`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ])
      .then(([wx, air]) => alive && setData({ wx, air, error: null }))
      .catch((error) => alive && setData({ wx: null, air: null, error }))
    return () => {
      alive = false
    }
  }, [comuna])

  const usarUbicacion = () => {
    if (!navigator.geolocation) return setGeoMsg('Tu navegador no permite obtener la ubicación.')
    setGeoMsg('Buscando tu ubicación…')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lon: pos.coords.longitude }
        const near = COMUNAS.reduce((best, c) => {
          const d = distanciaKm(here, c)
          return !best || d < best.d ? { c, d } : best
        }, null)
        if (near.d > 150) setGeoMsg('Parece que no estás en Chile; se mantiene la comuna elegida.')
        else {
          setGeoMsg(null)
          setCut(near.c.cut)
        }
      },
      () => setGeoMsg('No se pudo obtener tu ubicación. Revisa los permisos del navegador.'),
      { timeout: 10000, maximumAge: 600000 },
    )
  }

  const region = regiones.find((r) => r.id === regionId)
  const wx = data.wx

  const uvHoy = useMemo(() => {
    if (!wx) return []
    const today = wx.daily.time[0]
    return wx.hourly.time
      .map((t, i) => ({ t, uv: wx.hourly.uv_index[i] }))
      .filter((h) => h.t.startsWith(today) && Number(hora(h.t).slice(0, 2)) >= 7 && Number(hora(h.t).slice(0, 2)) <= 20)
  }, [wx])

  const pm24 = useMemo(() => {
    const vals = data.air?.hourly?.pm2_5?.filter((v, i) => v !== null && data.air.hourly.time[i] <= data.air.current?.time).slice(-24)
    return vals?.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  }, [data.air])

  return (
    <>
      <div className="card">
        <div className="form-grid">
          <Field label="Región">
            {(id) => (
              <select
                id={id}
                value={regionId}
                onChange={(e) => {
                  const r = regiones.find((x) => x.id === Number(e.target.value))
                  setRegionId(r.id)
                  setCut(r.comunas[0].cut)
                }}
              >
                {regiones.map((r) => (
                  <option key={r.id} value={r.id}>{r.romano} · {r.nombre}</option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Comuna">
            {(id) => (
              <select id={id} value={comuna.cut} onChange={(e) => setCut(Number(e.target.value))}>
                {[...region.comunas].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')).map((c) => (
                  <option key={c.cut} value={c.cut}>{c.nombre}</option>
                ))}
              </select>
            )}
          </Field>
        </div>
        <button type="button" className="btn-ghost geo-btn" onClick={usarUbicacion}>📍 Usar mi ubicación</button>
        {geoMsg && <p className="muted small">{geoMsg}</p>}
      </div>

      {data.error && <Note>No se pudo obtener el pronóstico. Intenta de nuevo en unos minutos.</Note>}
      {!wx && !data.error && <div className="card loading-block">Cargando pronóstico…</div>}

      {wx && (
        <>
          <div className="card weather-now">
            <div className="weather-main">
              <span className="weather-icon" aria-hidden="true">{wmo(wx.current.weather_code, wx.current.is_day).icon}</span>
              <div>
                <span className="muted small">{comuna.nombre}, ahora</span>
                <strong className="weather-temp">{formatNum(wx.current.temperature_2m, 0)}°</strong>
                <span>{wmo(wx.current.weather_code, wx.current.is_day).text}</span>
              </div>
            </div>
            <dl className="weather-details">
              <div><dt>Sensación térmica</dt><dd>{formatNum(wx.current.apparent_temperature, 0)}°</dd></div>
              <div><dt>Humedad</dt><dd>{wx.current.relative_humidity_2m}%</dd></div>
              <div><dt>Viento</dt><dd>{formatNum(wx.current.wind_speed_10m, 0)} km/h</dd></div>
              <div><dt>Sol</dt><dd>{hora(wx.daily.sunrise[0])} – {hora(wx.daily.sunset[0])}</dd></div>
            </dl>
          </div>

          <div className="two-col">
            <UvCard max={wx.daily.uv_index_max[0]} horas={uvHoy} />
            {data.air?.current && pm24 !== null && (
              <div className="card">
                <h2>Calidad del aire</h2>
                <div className="gauge-value" style={{ color: pmInfo(pm24).color }}>
                  {formatNum(pm24, 0)} <small>µg/m³</small>
                </div>
                <p><strong style={{ color: pmInfo(pm24).color }}>{pmInfo(pm24).label}</strong></p>
                <p className="muted small">
                  Promedio de MP2,5 de las últimas 24 horas (ahora: {formatNum(data.air.current.pm2_5, 0)} µg/m³). Valor
                  estimado por modelo; los episodios críticos oficiales los informa el{' '}
                  <a href="https://sinca.mma.gob.cl" target="_blank" rel="noreferrer">SINCA</a>.
                </p>
              </div>
            )}
          </div>

          <div className="card">
            <h2>Próximos 7 días</h2>
            <ul className="forecast">
              {wx.daily.time.map((d, i) => {
                const w = wmo(wx.daily.weather_code[i])
                const date = new Date(`${d}T12:00:00`)
                return (
                  <li key={d}>
                    <span className="fc-day">{i === 0 ? 'Hoy' : `${DIAS[date.getDay()]} ${date.getDate()}`}</span>
                    <span className="fc-icon" title={w.text} aria-label={w.text}>{w.icon}</span>
                    <span className="fc-rain">{wx.daily.precipitation_probability_max[i] ?? 0}% 💧</span>
                    <span className="fc-temp">
                      <strong>{formatNum(wx.daily.temperature_2m_max[i], 0)}°</strong>{' '}
                      <span className="muted">{formatNum(wx.daily.temperature_2m_min[i], 0)}°</span>
                    </span>
                    <span className="fc-uv" style={{ background: uvInfo(wx.daily.uv_index_max[i]).color }} title="Índice UV máximo">
                      UV {formatNum(wx.daily.uv_index_max[i], 0)}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </>
      )}

      <Note>
        Pronóstico de <a href="https://open-meteo.com" target="_blank" rel="noreferrer">Open-Meteo</a> (modelos
        meteorológicos globales). Para alertas oficiales, revisa la{' '}
        <a href="https://www.meteochile.gob.cl" target="_blank" rel="noreferrer">Dirección Meteorológica de Chile</a>.
      </Note>
    </>
  )
}

function UvCard({ max, horas }) {
  const info = uvInfo(max)
  const top = Math.max(11, ...horas.map((h) => h.uv))
  return (
    <div className="card">
      <h2>Índice UV de hoy</h2>
      <div className="gauge-value" style={{ color: info.color }}>{formatNum(max, 1)}</div>
      <p><strong style={{ color: info.color }}>{info.label}</strong>. {info.tip}</p>
      {horas.length > 0 && (
        <div className="uv-bars" aria-label="Índice UV por hora">
          {horas.map((h) => (
            <div key={h.t} className="uv-bar" title={`${hora(h.t)}: UV ${formatNum(h.uv, 1)}`}>
              <span style={{ height: `${(h.uv / top) * 100}%`, background: uvInfo(h.uv).color }} />
              <small>{hora(h.t).slice(0, 2)}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
