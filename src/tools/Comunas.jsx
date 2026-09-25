import { useMemo } from 'react'
import regiones from '../data/regiones.json'
import { formatNum } from '../lib/format'
import { CopyButton } from '../components/ui'
import { useUrlState } from '../lib/useUrlState'

const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const FILAS = regiones.flatMap((r) =>
  r.comunas.map((c) => ({ ...c, region: r.nombre, regionId: r.id, romano: r.romano })),
)

function descargar(nombre, contenido, tipo) {
  const url = URL.createObjectURL(new Blob([contenido], { type: tipo }))
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const toCSV = (rows) => {
  const cols = ['cut', 'nombre', 'provincia', 'region', 'region_id', 'superficie_km2', 'lat', 'lon']
  const q = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v)
  return [cols.join(','), ...rows.map((r) => [r.cut, r.nombre, r.provincia, r.region, r.regionId, r.superficie, r.lat, r.lon].map(q).join(','))].join('\n')
}

const toJSON = (regs) =>
  JSON.stringify(
    regs.map((r) => ({ id: r.id, romano: r.romano, nombre: r.nombre, comunas: r.comunas })),
    null,
    2,
  )

export default function Comunas() {
  const [q, setQ] = useUrlState('q', '')
  const [regionId, setRegionId] = useUrlState('region', 0)

  const filas = useMemo(() => {
    const nq = normalize(q.trim())
    return FILAS.filter(
      (f) =>
        (!regionId || f.regionId === regionId) &&
        (!nq || normalize(`${f.nombre} ${f.provincia} ${f.region} ${f.cut}`).includes(nq)),
    )
  }, [q, regionId])

  const regsFiltradas = regionId ? regiones.filter((r) => r.id === regionId) : regiones
  const sufijo = regionId ? `-region-${regionId}` : ''

  return (
    <>
      <div className="region-chips" role="group" aria-label="Filtrar por región">
        <button type="button" className={!regionId ? 'active' : ''} onClick={() => setRegionId(0)}>Todas</button>
        {regiones.map((r) => (
          <button key={r.id} type="button" className={regionId === r.id ? 'active' : ''} onClick={() => setRegionId(r.id)} title={r.nombre}>
            {r.romano}
          </button>
        ))}
      </div>

      <div className="card toolbar">
        <input type="search" placeholder="Buscar comuna, provincia o código…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar comuna" />
        <div className="toolbar-actions">
          <button type="button" className="btn-ghost" onClick={() => descargar(`comunas-chile${sufijo}.csv`, toCSV(filas), 'text/csv;charset=utf-8')}>
            ⬇ CSV
          </button>
          <button type="button" className="btn-ghost" onClick={() => descargar(`regiones-comunas-chile${sufijo}.json`, toJSON(regsFiltradas), 'application/json')}>
            ⬇ JSON
          </button>
          <CopyButton text={toJSON(regsFiltradas)} label="Copiar JSON" />
        </div>
      </div>

      <p className="muted small">
        {filas.length} {filas.length === 1 ? 'comuna' : 'comunas'}
        {regionId ? ` en la Región de ${regiones.find((r) => r.id === regionId).nombre}` : ` · ${regiones.length} regiones`}
      </p>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Comuna</th>
              <th>Provincia</th>
              <th>Región</th>
              <th className="num">Superficie</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.cut}>
                <td className="mono">{String(f.cut).padStart(5, '0')}</td>
                <td><strong>{f.nombre}</strong></td>
                <td>{f.provincia}</td>
                <td title={f.region}>{f.romano}</td>
                <td className="num">{formatNum(f.superficie, 1)} km²</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="muted small">
        Códigos Únicos Territoriales (CUT) de la SUBDERE, incluida la Región de Ñuble. Los archivos descargables incluyen
        las coordenadas de cada comuna. Fuente: Wikipedia, Anexo: Comunas de Chile.
      </p>
    </>
  )
}
