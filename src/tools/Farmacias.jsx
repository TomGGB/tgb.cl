import { useEffect, useMemo, useRef, useState } from 'react'
import { fetchFarmacias, telHref } from '../lib/farmacias'
import { distanciaKm } from '../lib/bencinas'
import { formatNum } from '../lib/format'
import { Field, Note } from '../components/ui'
import { Icon } from '../components/icons'
import { useUrlState } from '../lib/useUrlState'
import { useShareText } from '../lib/share'
import { useLeafletMap, L } from '../lib/useLeafletMap'

const esc = (t) => String(t).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
const byName = (a, b) => a.localeCompare(b, 'es')
const mapsUrl = (f) => `https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lon}`

export default function Farmacias() {
  const [region, setRegion] = useUrlState('region', 'Metropolitana de Santiago')
  const [comuna, setComuna] = useUrlState('comuna', '')
  const [data, setData] = useState({ fecha: null, locales: null, error: null })
  const [pos, setPos] = useState(null)
  const [geoMsg, setGeoMsg] = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetchFarmacias()
      .then((d) => setData({ ...d, error: null }))
      .catch((error) => setData({ fecha: null, locales: null, error }))
  }, [])

  const regiones = useMemo(() => [...new Set((data.locales ?? []).map((f) => f.region))].sort(byName), [data.locales])
  const comunas = useMemo(
    () => [...new Set((data.locales ?? []).filter((f) => f.region === region).map((f) => f.comuna))].sort(byName),
    [data.locales, region],
  )

  const lista = useMemo(() => {
    if (!data.locales) return []
    if (pos) {
      return data.locales
        .map((f) => ({ ...f, dist: distanciaKm(pos, f) }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 15)
    }
    return data.locales
      .filter((f) => f.region === region && (!comuna || f.comuna === comuna))
      .sort((a, b) => byName(a.comuna, b.comuna))
  }, [data.locales, region, comuna, pos])

  const cercaDeMi = () => {
    if (!navigator.geolocation) return setGeoMsg('Tu navegador no permite obtener la ubicación.')
    setGeoMsg('Buscando tu ubicación…')
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lon: p.coords.longitude })
        setGeoMsg(null)
      },
      () => setGeoMsg('No se pudo obtener tu ubicación. Revisa los permisos del navegador y elige tu comuna.'),
      { timeout: 10000, maximumAge: 300000 },
    )
  }

  const primera = lista[0]
  useShareText(primera ? `Farmacia de turno${pos ? ' más cercana' : ` en ${primera.comuna}`}: ${primera.nombre}, ${primera.direccion}` : null)

  const fechaTexto = data.fecha
    ? new Date(`${data.fecha}T12:00:00`).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })
    : null

  return (
    <>
      <div className="card">
        {!pos && (
          <div className="form-grid">
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
                  <option value="">Todas las comunas con turno</option>
                  {comunas.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )}
            </Field>
          </div>
        )}
        <div className="inline-actions">
          {pos ? (
            <button type="button" className="btn-ghost" onClick={() => setPos(null)}><Icon name="X" size={15} /> Elegir comuna</button>
          ) : (
            <button type="button" className="btn" onClick={cercaDeMi}><Icon name="LocateFixed" size={17} /> Farmacias de turno cerca de mí</button>
          )}
          {fechaTexto && <span className="muted small">Turnos del {fechaTexto}</span>}
        </div>
        {geoMsg && <p className="muted small">{geoMsg}</p>}
      </div>

      {data.error && (
        <Note>No se pudo conectar con el sistema de farmacias del MINSAL. Intenta de nuevo o consulta en farmanet.minsal.cl.</Note>
      )}
      {!data.locales && !data.error && <div className="card loading-block">Buscando farmacias de turno…</div>}

      {data.locales && (
        <>
          <FarmaciaMap farmacias={lista} pos={pos} selected={selected} onSelect={setSelected} />
          {lista.length === 0 && (
            <Note>No hay farmacias de turno informadas en esta zona hoy. Prueba con “Farmacias de turno cerca de mí” o con otra comuna.</Note>
          )}
          <ul className="station-list">
            {lista.map((f) => (
              <li key={f.id} className={selected === f.id ? 'active' : ''}>
                <div className="pharmacy">
                  <button type="button" className="pharmacy-main" onClick={() => setSelected(f.id)}>
                    <span className="station-info">
                      <strong>{f.nombre}</strong>
                      <span>{f.direccion}, {f.comuna}{f.dist !== undefined && ` · a ${formatNum(f.dist, 1)} km`}</span>
                      <span className={`pharmacy-hours ${f.h24 ? 'h24' : ''}`}>
                        <Icon name="Clock" size={13} /> {f.h24 ? 'Abierta las 24 horas' : `De ${f.abre} a ${f.cierra}`}
                      </span>
                    </span>
                  </button>
                  <div className="pharmacy-actions">
                    {f.telefono && (
                      <a className="btn-ghost" href={telHref(f.telefono)} aria-label={`Llamar a ${f.nombre}`}><Icon name="Phone" size={15} /> Llamar</a>
                    )}
                    <a className="btn-ghost" href={mapsUrl(f)} target="_blank" rel="noreferrer"><Icon name="Navigation" size={15} /> Cómo llegar</a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <Note>
        Datos oficiales de turnos del Ministerio de Salud (Farmanet). Los turnos cambian cada día: antes de ir, llama para
        confirmar que está atendiendo. En una emergencia llama al 131 (SAMU).
      </Note>
    </>
  )
}

function FarmaciaMap({ farmacias, pos, selected, onSelect }) {
  const el = useRef(null)
  const { map, theme } = useLeafletMap(el, { center: [-33.45, -70.66], zoom: 11 })
  const layer = useRef(null)
  const markers = useRef({})

  useEffect(() => {
    layer.current?.remove()
    layer.current = L.layerGroup().addTo(map.current)
    markers.current = {}
    const pts = []
    for (const f of farmacias) {
      const m = L.marker([f.lat, f.lon], {
        icon: L.divIcon({ className: `pharmacy-marker ${theme}`, html: '<span>+</span>', iconSize: [28, 28] }),
        title: f.nombre,
      })
        .bindPopup(
          `<div class="map-popup"><strong>${esc(f.nombre)}</strong><span>${esc(f.direccion)}, ${esc(f.comuna)}</span><span>${f.h24 ? 'Abierta las 24 horas' : `De ${f.abre} a ${f.cierra}`}</span><a href="${mapsUrl(f)}" target="_blank" rel="noreferrer">Cómo llegar</a></div>`,
        )
        .on('click', () => onSelect(f.id))
      m.addTo(layer.current)
      markers.current[f.id] = m
      pts.push([f.lat, f.lon])
    }
    if (pos) {
      L.marker([pos.lat, pos.lon], { icon: L.divIcon({ className: 'me-marker', html: '<span></span>', iconSize: [18, 18] }), keyboard: false })
        .bindTooltip('Estás aquí')
        .addTo(layer.current)
      pts.push([pos.lat, pos.lon])
    }
    if (pts.length) map.current.fitBounds(pts, { padding: [30, 30], maxZoom: 15 })
  }, [farmacias, pos, onSelect, theme, map])

  useEffect(() => {
    const m = selected && markers.current[selected]
    if (m) {
      map.current.setView(m.getLatLng(), Math.max(map.current.getZoom(), 15))
      m.openPopup()
      el.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selected, map])

  return <div ref={el} className="map" role="region" aria-label="Mapa de farmacias de turno" />
}
