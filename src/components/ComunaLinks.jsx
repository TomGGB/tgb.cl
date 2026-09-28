import { Link } from 'react-router-dom'
import { comunasDeRegion, COMUNAS, POR_COMUNA } from '../lib/comunas'
import regiones from '../data/regiones.json'

const normalize = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()

/**
 * Enlaces a la misma herramienta en otras comunas de la región (navegación y SEO).
 * @param region nombre de la región (del dataset o de la API) o `regionId`
 */
export default function ComunaLinks({ toolSlug, regionId, region, actual }) {
  let id = regionId
  if (!id && region) {
    const n = normalize(region).replace(/^(de la |del |de los |de )/, '')
    id = regiones.find((r) => normalize(r.nombre).includes(n.slice(0, 8)) || n.includes(normalize(r.nombre).slice(0, 8)))?.id
  }
  if (!id && actual) id = COMUNAS.find((c) => c.slug === actual)?.regionId
  if (!id) return null
  const comunas = comunasDeRegion(id).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  const nombreRegion = regiones.find((r) => r.id === id)?.nombre
  return (
    <nav className="comuna-links" aria-label={POR_COMUNA[toolSlug].enlaces(nombreRegion)}>
      <h2>{POR_COMUNA[toolSlug].enlaces(nombreRegion)}</h2>
      <ul>
        {comunas.map((c) => (
          <li key={c.slug}>
            {c.slug === actual ? <strong aria-current="page">{c.nombre}</strong> : <Link to={`/${toolSlug}/${c.slug}/`}>{c.nombre}</Link>}
          </li>
        ))}
      </ul>
    </nav>
  )
}
