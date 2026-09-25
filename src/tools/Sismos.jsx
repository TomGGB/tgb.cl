import { useEffect, useMemo, useRef, useState } from 'react'
import { useLeafletMap, L } from '../lib/useLeafletMap'
import { formatNum } from '../lib/format'
import { Segmented, Note } from '../components/ui'
import { useUrlState } from '../lib/useUrlState'

const API = 'https://earthquake.usgs.gov/fdsnws/event/1/query'
const BBOX = { minlatitude: -57, maxlatitude: -17, minlongitude: -80, maxlongitude: -65 }
const PERIODOS = { '1': 1, '7': 7, '30': 30 }
const REFRESH_MS = 2 * 60 * 1000

const DIR = { N: 'N', S: 'S', E: 'E', W: 'O' }
// "53 km WSW of San Antonio, Chile" -> "53 km al OSO de San Antonio"
function traducirLugar(place = '') {
  const m = place.match(/^(\d+) km ([NSEW]+) of (.+?)(, Chile)?$/)
  if (m) return `${m[1]} km al ${[...m[2]].map((c) => DIR[c]).join('')} de ${m[3]}`
  return place
    .replace(/, Chile$/, '')
    .replace(/^off the coast of /, 'Frente a la costa de ')
    .replace(/ border region$/, ' (zona fronteriza)')
}

const esc = (t) => String(t).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

const magColor = (m) => (m >= 6 ? '#c8102e' : m >= 5 ? '#e0620d' : m >= 4 ? '#e8a317' : '#3a9d6a')

function tiempoRelativo(ms) {
  const min = Math.round((Date.now() - ms) / 60000)
  if (min < 1) return 'recién'
  if (min < 60) return `hace ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.round(h / 24)
  return `hace ${d} ${d === 1 ? 'día' : 'días'}`
}

export default function Sismos() {
  const [periodo, setPeriodo] = useUrlState('dias', '7')
  const [minMag, setMinMag] = useUrlState('mag', '3')
  const [soloChile, setSoloChile] = useUrlState('chile', true)
  const [state, setState] = useState({ data: null, error: null, updated: null })
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    let alive = true
    const load = () => {
      const start = new Date(Date.now() - (PERIODOS[periodo] ?? 7) * 86400000).toISOString()
      const qs = new URLSearchParams({ format: 'geojson', orderby: 'time', starttime: start, minmagnitude: minMag, limit: '500', ...BBOX })
      fetch(`${API}?${qs}`)
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          return r.json()
        })
        .then((json) => alive && setState({ data: json.features, error: null, updated: new Date() }))
        .catch((error) => alive && setState((s) => ({ ...s, error })))
    }
    load()
    const id = setInterval(load, REFRESH_MS)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [periodo, minMag])

  const sismos = useMemo(
    () =>
      (state.data ?? [])
        .filter((f) => !soloChile || /Chile/i.test(f.properties.place ?? ''))
        .map((f) => ({
          id: f.id,
          mag: f.properties.mag,
          lugar: traducirLugar(f.properties.place),
          time: f.properties.time,
          url: f.properties.url,
          lon: f.geometry.coordinates[0],
          lat: f.geometry.coordinates[1],
          prof: f.geometry.coordinates[2],
        })),
    [state.data, soloChile],
  )

  const mayor = sismos.reduce((a, s) => (!a || s.mag > a.mag ? s : a), null)

  return (
    <>
      <div className="card controls-row">
        <Segmented
          label="Período"
          value={periodo}
          onChange={setPeriodo}
          options={[
            { value: '1', label: '24 horas' },
            { value: '7', label: '7 días' },
            { value: '30', label: '30 días' },
          ]}
        />
        <Segmented
          label="Magnitud mínima"
          value={minMag}
          onChange={setMinMag}
          options={[
            { value: '2.5', label: '≥ 2,5' },
            { value: '3', label: '≥ 3' },
            { value: '4', label: '≥ 4' },
            { value: '5', label: '≥ 5' },
          ]}
        />
        <label className="checkbox inline">
          <input type="checkbox" checked={soloChile} onChange={(e) => setSoloChile(e.target.checked)} />
          Solo Chile
        </label>
      </div>

      {state.error && !state.data && <Note>No se pudo conectar con el servicio de sismos. Intenta más tarde.</Note>}
      {!state.data && !state.error && <div className="card loading-block">Cargando sismos…</div>}

      {state.data && (
        <>
          <div className="stats-row">
            <div className="mini-stat">
              <span>Sismos</span>
              <strong>{sismos.length}</strong>
            </div>
            {mayor && (
              <div className="mini-stat">
                <span>Mayor magnitud</span>
                <strong style={{ color: magColor(mayor.mag) }}>{formatNum(mayor.mag, 1)}</strong>
              </div>
            )}
            <div className="mini-stat">
              <span>Actualizado</span>
              <strong>{state.updated?.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</strong>
            </div>
          </div>

          <SismoMap sismos={sismos} selected={selected} onSelect={setSelected} />

          <ul className="quake-list">
            {sismos.slice(0, 100).map((s) => (
              <li key={s.id} className={selected === s.id ? 'active' : ''}>
                <button type="button" onClick={() => setSelected(s.id)}>
                  <span className="mag" style={{ background: magColor(s.mag) }}>{formatNum(s.mag, 1)}</span>
                  <span className="quake-info">
                    <strong>{s.lugar}</strong>
                    <span>
                      {new Date(s.time).toLocaleString('es-CL', { timeZone: 'America/Santiago', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}{' '}
                      · {tiempoRelativo(s.time)} · {formatNum(s.prof, 0)} km de profundidad
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {sismos.length === 0 && <p className="muted center">No hay sismos con esos filtros.</p>}
        </>
      )}

      <Note>
        Datos del Servicio Geológico de Estados Unidos (USGS), que se actualizan cada 2 minutos. Las magnitudes y
        ubicaciones pueden diferir levemente del informe oficial del{' '}
        <a href="https://www.sismologia.cl" target="_blank" rel="noreferrer">Centro Sismológico Nacional</a>. Ante un sismo
        fuerte en la costa, sigue las instrucciones de SENAPRED y el SHOA.
      </Note>
    </>
  )
}

function SismoMap({ sismos, selected, onSelect }) {
  const el = useRef(null)
  const { map, theme } = useLeafletMap(el, { bounds: [[-55, -76], [-17.5, -66]], maxZoom: 12 })
  const layer = useRef(null)
  const markers = useRef({})

  useEffect(() => {
    layer.current?.remove()
    layer.current = L.layerGroup().addTo(map.current)
    markers.current = {}
    const borde = theme === 'dark' ? '#0e1624' : '#ffffff'
    // los más grandes se dibujan al final para quedar encima
    for (const s of [...sismos].sort((a, b) => a.mag - b.mag)) {
      const reciente = Date.now() - s.time < 3 * 3600 * 1000
      const m = L.circleMarker([s.lat, s.lon], {
        radius: Math.max(4, (s.mag - 1.5) * 3.2),
        color: borde,
        weight: 1.5,
        fillColor: magColor(s.mag),
        fillOpacity: 0.85,
        className: reciente ? 'quake-recent' : '',
      })
        .bindPopup(
          `<div class="map-popup"><strong>Magnitud ${formatNum(s.mag, 1)}</strong><span>${esc(s.lugar)}</span><span>${new Date(s.time).toLocaleString('es-CL', { timeZone: 'America/Santiago', dateStyle: 'medium', timeStyle: 'short' })}</span><span>${formatNum(s.prof, 0)} km de profundidad</span><a href="${esc(s.url)}" target="_blank" rel="noreferrer">Ver detalle en USGS</a></div>`,
        )
        .on('click', () => onSelect(s.id))
      m.addTo(layer.current)
      markers.current[s.id] = m
    }
  }, [sismos, onSelect, theme, map])

  useEffect(() => {
    const m = selected && markers.current[selected]
    if (m) {
      map.current.setView(m.getLatLng(), Math.max(map.current.getZoom(), 6))
      m.openPopup()
      el.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selected, map])

  return <div ref={el} className="map" role="region" aria-label="Mapa de sismos" />
}
