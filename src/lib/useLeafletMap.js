import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useResolvedTheme } from './theme'

// Mapa base de OpenStreetMap (sin clave). El aspecto claro/oscuro se logra con filtros CSS
// aplicados solo a la capa de teselas (ver .map-tiles-light/.map-tiles-dark en styles.css),
// así los marcadores y popups mantienen sus colores reales.
const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

/**
 * Crea un mapa Leaflet en `el` y cambia el mapa base al cambiar el tema claro/oscuro.
 * Devuelve { map, theme } como refs/valores para dibujar capas encima.
 */
export function useLeafletMap(el, { center = [-33.45, -70.66], zoom = 10, bounds, maxZoom = 18 } = {}) {
  const map = useRef(null)
  const tiles = useRef(null)
  const theme = useResolvedTheme()

  useEffect(() => {
    const m = L.map(el.current, { scrollWheelZoom: false, attributionControl: true, zoomControl: false })
    L.control.zoom({ position: 'topright', zoomInTitle: 'Acercar', zoomOutTitle: 'Alejar' }).addTo(m)
    m.attributionControl.setPrefix(false)
    if (bounds) m.fitBounds(bounds)
    else m.setView(center, zoom)
    map.current = m
    return () => {
      m.remove()
      map.current = null
      tiles.current = null
    }
    // el mapa se crea una sola vez
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!map.current) return
    if (!tiles.current) {
      tiles.current = L.tileLayer(TILES, { maxZoom, attribution: ATTRIBUTION }).addTo(map.current)
    }
    const pane = map.current.getPane('tilePane')
    pane.classList.toggle('map-tiles-dark', theme === 'dark')
    pane.classList.toggle('map-tiles-light', theme !== 'dark')
  }, [theme, maxZoom])

  return { map, theme }
}

export { L }
