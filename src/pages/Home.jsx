import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES, TOOLS } from '../tools/meta'
import { useIndicadores } from '../lib/indicadores'
import { proximoFeriado } from '../lib/feriados'
import { formatNum } from '../lib/format'
import { buscarHerramientas } from '../components/CommandPalette'
import { useFavoritos, useRecientes } from '../lib/preferencias'
import { Icon, ToolIcon } from '../components/icons'

const POPULARES = ['sueldo-liquido', 'farmacias-de-turno', 'feriados', 'bencinas', 'finiquito']
const bySlug = (s) => TOOLS.find((t) => t.slug === s)
const corto = (t) => t.title.replace(/^Calculadora de /, '').replace(/^./, (c) => c.toUpperCase())

// La pizarra de una casa de cambio: los valores que todos miran cada día
function Pizarra() {
  const { data, get, loading, error, updatedAt, refreshing } = useIndicadores()
  const feriado = proximoFeriado()
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const dias = Math.round((feriado.date - hoy) / 86400000)
  const fecha = (code) =>
    data?.[code]?.fecha ? new Date(data[code].fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }) : null

  const filas = [
    { label: 'UF', value: formatNum(get('uf'), 2), nota: fecha('uf'), to: '/uf-hoy/' },
    { label: 'Dólar', value: formatNum(get('dolar'), 2), nota: 'observado', to: '/dolar-hoy/' },
    { label: 'Euro', value: formatNum(get('euro'), 2), nota: fecha('euro'), to: '/euro-hoy/' },
    { label: 'UTM', value: formatNum(get('utm'), 0), nota: new Date().toLocaleDateString('es-CL', { month: 'long' }), to: '/utm-hoy/' },
  ]

  return (
    <aside className="pizarra" aria-label="Valores del día" aria-busy={loading}>
      <header className="pizarra-head">
        <strong>Hoy en Chile</strong>
        <span>{new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      </header>
      <ul className="pizarra-rows">
        {filas.map((f) => (
          <li key={f.label}>
            <Link to={f.to}>
              <span className="pz-label">{f.label}</span>
              <span className={`pz-value ${loading ? 'loading' : ''}`}>
                <span className="pz-currency">$</span>
                {f.value}
              </span>
              <span className="pz-note">{f.nota}</span>
            </Link>
          </li>
        ))}
        <li className="pz-feriado">
          <Link to="/feriados/">
            <span className="pz-label">Próximo feriado</span>
            <span className="pz-value">
              {dias === 0 ? 'Hoy' : dias}
              {dias > 0 && <small>{dias === 1 ? ' día' : ' días'}</small>}
            </span>
            <span className="pz-note">{feriado.name}</span>
          </Link>
        </li>
      </ul>
      <footer className="pizarra-foot">
        {error && !data
          ? 'Sin conexión: se muestran valores de referencia'
          : `Fuente: Banco Central de Chile${updatedAt ? ` · ${refreshing ? 'actualizando…' : `actualizado a las ${new Date(updatedAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`}` : ''}`}
      </footer>
    </aside>
  )
}

function ToolRow({ t }) {
  const { isFav, toggle } = useFavoritos()
  const fav = isFav(t.slug)
  return (
    <li className="tool-row-wrap">
      <Link to={`/${t.slug}/`} className="tool-row">
        <ToolIcon tool={t} size={19} />
        <span className="tool-row-text">
          <strong>{t.title}</strong>
          <span>{t.short}</span>
        </span>
      </Link>
      <button
        type="button"
        className={`star ${fav ? 'on' : ''}`}
        onClick={() => toggle(t.slug)}
        aria-pressed={fav}
        aria-label={fav ? `Quitar ${t.title} de favoritos` : `Agregar ${t.title} a favoritos`}
        title={fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        <Icon name="Star" size={16} fill={fav ? 'currentColor' : 'none'} />
      </button>
    </li>
  )
}

function ChipRow({ title, tools }) {
  return (
    <section className="chip-row">
      <h2>{title}</h2>
      <ul>
        {tools.map((t) => (
          <li key={t.slug}>
            <Link to={`/${t.slug}/`} className="chip" data-cat={t.category}>
              <Icon name={t.icon} size={15} />
              {corto(t)}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function Home() {
  const [q, setQ] = useState('')
  const filtered = useMemo(() => buscarHerramientas(q), [q])
  const { favs } = useFavoritos()
  const { recientes } = useRecientes()
  const favTools = favs.map(bySlug).filter(Boolean)
  const recTools = recientes.filter((s) => !favs.includes(s)).map(bySlug).filter(Boolean).slice(0, 4)

  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <h1>Calculadoras y datos útiles para Chile</h1>
          <p>
            Sueldo líquido, finiquito, feriados, precio de la bencina, sismos y {TOOLS.length - 5} herramientas más. Gratis, sin
            registro y con datos oficiales.
          </p>
          <label className="hero-search">
            <Icon name="Search" size={20} />
            <input type="search" placeholder="¿Qué quieres calcular?" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar herramienta" />
          </label>
          <p className="hero-popular">
            <span>Lo más usado:</span>
            {POPULARES.map(bySlug).map((t) => (
              <Link key={t.slug} to={`/${t.slug}/`}>{corto(t)}</Link>
            ))}
          </p>
        </div>
        <Pizarra />
      </section>

      {q ? (
        <section className="cat-panel results-panel">
          <header className="cat-head">
            <h2>
              {filtered.length
                ? `${filtered.length} ${filtered.length === 1 ? 'resultado' : 'resultados'} para “${q}”`
                : `Nada coincide con “${q}”. Prueba con otra palabra, como “sueldo” o “UF”.`}
            </h2>
          </header>
          <ul className="tool-list">
            {filtered.map((t) => (
              <ToolRow key={t.slug} t={t} />
            ))}
          </ul>
        </section>
      ) : (
        <>
          {(favTools.length > 0 || recTools.length > 0) && (
            <div className="personal">
              {favTools.length > 0 && <ChipRow title="Tus favoritos" tools={favTools} />}
              {recTools.length > 0 && <ChipRow title="Usadas hace poco" tools={recTools} />}
            </div>
          )}
          <div className="directory">
            {CATEGORIES.map((c) => {
              const tools = TOOLS.filter((t) => t.category === c.id && !t.landing)
              return (
                <section key={c.id} className="cat-panel" data-cat={c.id}>
                  <header className="cat-head">
                    <span className="cat-icon"><Icon name={c.icon} size={17} /></span>
                    <h2>{c.name}</h2>
                    <span className="cat-count">{tools.length}</span>
                  </header>
                  <ul className="tool-list">
                    {tools.map((t) => (
                      <ToolRow key={t.slug} t={t} />
                    ))}
                  </ul>
                </section>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}
