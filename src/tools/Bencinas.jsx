import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { fetchBencinas, precioDe, mediana, distanciaKm, COMBUSTIBLES } from '../lib/bencinas'
import { formatCLP, formatNum } from '../lib/format'
import { Field, Segmented, Note } from '../components/ui'
import { useUrlState } from '../lib/useUrlState'

const esc = (t) => String(t).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
const byName = (a, b) => a.localeCompare(b, 'es')

// verde (barata) → rojo (cara) según la posición del precio en el rango
function colorPrecio(p, min, max) {
  const t = max > min ? (p - min) / (max - min) : 0
  const hue = 130 - t * 130
  return `hsl(${hue} 70% 40%)`
}

export default function Bencinas() {
  const [comb, setComb] = useUrlState('comb', '93')
  const [region, setRegion] = useUrlState('region', 'Metropolitana de Santiago')
  const [comuna, setComuna] = useUrlState('comuna', '')
  const [orden, setOrden] = useUrlState('orden', 'precio')
  const [data, setData] = useState({ estaciones: null, error: null })
  const [pos, setPos] = useState(null)
  const [geoMsg, setGeoMsg] = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetchBencinas()
      .then((estaciones) => setData({ estaciones, error: null }))
      .catch((error) => setData({ estaciones: null, error }))
  }, [])

  const regiones = useMemo(() => [...new Set((data.estaciones ?? []).map((e) => e.region).filter(Boolean))].sort(byName), [data.estaciones])
  const comunas = useMemo(
    () => [...new Set((data.estaciones ?? []).filter((e) => e.region === region).map((e) => e.comuna).filter(Boolean))].sort(byName),
    [data.estaciones, region],
  )

  const lista = useMemo(() => {
    if (!data.estaciones) return []
    let l = data.estaciones
      .map((e) => ({ ...e, precio: precioDe(e, comb), dist: pos ? distanciaKm(pos, e) : null }))
      .filter((e) => e.precio)
    if (pos) l = l.filter((e) => e.dist <= 15)
    else l = l.filter((e) => e.region === region && (!comuna || e.comuna === comuna))
    const key = orden === 'distancia' && pos ? 'dist' : 'precio'
    return l.sort((a, b) => a[key] - b[key])
  }, [data.estaciones, comb, region, comuna, pos, orden])

  const precios = lista.map((e) => e.precio)
  const min = precios.length ? Math.min(...precios) : 0
  const max = precios.length ? Math.max(...precios) : 0
  const med = mediana(precios)
  const nacional = useMemo(() => mediana((data.estaciones ?? []).map((e) => precioDe(e, comb)).filter(Boolean)), [data.estaciones, comb])

  const cercaDeMi = () => {
    if (!navigator.geolocation) return setGeoMsg('Tu navegador no permite obtener la ubicación.')
    setGeoMsg('Buscando tu ubicación…')
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lon: p.coords.longitude })
        setOrden('distancia')
        setGeoMsg(null)
      },
      () => setGeoMsg('No se pudo obtener tu ubicación. Revisa los permisos del navegador.'),
      { timeout: 10000, maximumAge: 300000 },
    )
  }

  const combLabel = COMBUSTIBLES.find((c) => c.id === comb)?.label

  return (
    <>
      <div className="card">
        <div className="form-grid">
          <Field label="Combustible">
            {(id) => (
              <select id={id} value={comb} onChange={(e) => setComb(e.target.value)}>
                {COMBUSTIBLES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            )}
          </Field>
          {!pos && (
            <>
              <Field label="Región">
                {(id) => (
                  <select id={id} value={region} onChange={(e) => { setRegion(e.target.value); setComuna('') }} disabled={!regiones.length}>
                    {(regiones.length ? regiones : [region]).map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                )}
              </Field>
              <Field label="Comuna">
                {(id) => (
                  <select id={id} value={comuna} onChange={(e) => setComuna(e.target.value)} disabled={!comunas.length}>
                    <option value="">Todas las comunas</option>
                    {comunas.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                )}
              </Field>
            </>
          )}
        </div>
        <div className="inline-actions">
          {pos ? (
            <button type="button" className="btn-ghost" onClick={() => { setPos(null); setOrden('precio') }}>✕ Dejar de usar mi ubicación</button>
          ) : (
            <button type="button" className="btn-ghost" onClick={cercaDeMi}>📍 Cerca de mí (15 km)</button>
          )}
          {pos && (
            <Segmented
              label="Ordenar"
              value={orden}
              onChange={setOrden}
              options={[
                { value: 'precio', label: 'Más barata' },
                { value: 'distancia', label: 'Más cercana' },
              ]}
            />
          )}
        </div>
        {geoMsg && <p className="muted small">{geoMsg}</p>}
      </div>

      {data.error && <Note>No se pudieron cargar los precios desde Bencina en Línea. Intenta más tarde.</Note>}
      {!data.estaciones && !data.error && <div className="card loading-block">Cargando precios de 1.800 bencineras…</div>}

      {data.estaciones && (
        <>
          <div className="stats-row">
            <div className="mini-stat">
              <span>Más barata</span>
              <strong style={{ color: 'hsl(130 70% 35%)' }}>{precios.length ? formatCLP(min) : '—'}</strong>
            </div>
            <div className="mini-stat">
              <span>Precio mediano</span>
              <strong>{med ? formatCLP(med) : '—'}</strong>
            </div>
            <div className="mini-stat">
              <span>Mediana nacional</span>
              <strong>{nacional ? formatCLP(nacional) : '—'}</strong>
            </div>
          </div>
          {precios.length > 1 && (
            <p className="muted small">
              Entre la más barata y la más cara hay {formatCLP(max - min)} por litro: en un estanque de 45 litros son{' '}
              {formatCLP((max - min) * 45)} de diferencia.
            </p>
          )}

          <BencinaMap estaciones={lista} min={min} max={max} pos={pos} selected={selected} onSelect={setSelected} />

          <ul className="station-list">
            {lista.slice(0, 60).map((e, i) => (
              <li key={e.id} className={selected === e.id ? 'active' : ''}>
                <button type="button" onClick={() => setSelected(e.id)}>
                  <span className="rank">{i + 1}</span>
                  <span className="station-info">
                    <strong>{e.marca}</strong>
                    <span>{e.direccion}, {e.comuna}{e.dist !== null && ` · ${formatNum(e.dist, 1)} km`}</span>
                    {e.precios[comb]?.asistido && e.precios[comb]?.auto && (
                      <span className="muted small">Asistido: {formatCLP(e.precios[comb].asistido)}</span>
                    )}
                  </span>
                  <span className="station-price" style={{ color: colorPrecio(e.precio, min, max) }}>
                    {formatCLP(e.precio)}
                    <small>/{e.precios[comb]?.unidad?.replace('$/', '') ?? 'L'}</small>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {lista.length === 0 && <p className="muted center">No hay estaciones con {combLabel} en esta zona.</p>}
          {lista.length > 60 && <p className="muted small center">Mostrando las 60 primeras de {lista.length} estaciones.</p>}
        </>
      )}

      <Note>
        Precios informados por las estaciones a la Comisión Nacional de Energía en{' '}
        <a href="https://www.bencinaenlinea.cl" target="_blank" rel="noreferrer">Bencina en Línea</a>. Se muestra el precio
        de autoservicio cuando existe y se ocultan precios sin actualizar en más de 45 días. El precio final puede variar
        por descuentos de tarjetas o convenios.
      </Note>
    </>
  )
}

function BencinaMap({ estaciones, min, max, pos, selected, onSelect }) {
  const el = useRef(null)
  const map = useRef(null)
  const layer = useRef(null)
  const markers = useRef({})

  useEffect(() => {
    map.current = L.map(el.current, { scrollWheelZoom: false }).setView([-33.45, -70.66], 10)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map.current)
    layer.current = L.layerGroup().addTo(map.current)
    return () => map.current.remove()
  }, [])

  useEffect(() => {
    layer.current.clearLayers()
    markers.current = {}
    const pts = []
    for (const e of estaciones) {
      const m = L.circleMarker([e.lat, e.lon], { radius: 7, color: '#fff', weight: 1.5, fillColor: colorPrecio(e.precio, min, max), fillOpacity: 0.9 })
        .bindPopup(
          `<strong>${esc(e.marca)}</strong> · ${formatCLP(e.precio)}<br>${esc(e.direccion)}, ${esc(e.comuna)}<br><a href="https://www.google.com/maps/dir/?api=1&destination=${e.lat},${e.lon}" target="_blank" rel="noreferrer">Cómo llegar</a>`,
        )
        .on('click', () => onSelect(e.id))
      m.addTo(layer.current)
      markers.current[e.id] = m
      pts.push([e.lat, e.lon])
    }
    if (pos) {
      L.circleMarker([pos.lat, pos.lon], { radius: 8, color: '#fff', weight: 2, fillColor: '#1a73e8', fillOpacity: 1 }).bindTooltip('Tú').addTo(layer.current)
      pts.push([pos.lat, pos.lon])
    }
    if (pts.length) map.current.fitBounds(pts, { padding: [24, 24], maxZoom: 14 })
  }, [estaciones, min, max, pos, onSelect])

  useEffect(() => {
    const m = selected && markers.current[selected]
    if (m) {
      map.current.setView(m.getLatLng(), Math.max(map.current.getZoom(), 14))
      m.openPopup()
      el.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selected])

  return <div ref={el} className="map" role="region" aria-label="Mapa de bencineras" />
}
