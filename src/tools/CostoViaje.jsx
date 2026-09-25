import { useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchBencinas, precioDe, mediana, COMBUSTIBLES } from '../lib/bencinas'
import { formatCLP, formatNum } from '../lib/format'
import { Field, NumberInput, ResultTable, Note } from '../components/ui'
import { useUrlState } from '../lib/useUrlState'
import { Icon } from '../components/icons'
import { useShareText } from '../lib/share'

export default function CostoViaje() {
  const [km, setKm] = useUrlState('km', 120)
  const [rendimiento, setRendimiento] = useUrlState('rend', 12)
  const [precio, setPrecio] = useUrlState('precio', 1500)
  const [peajes, setPeajes] = useUrlState('peajes', 0)
  const [idaVuelta, setIdaVuelta] = useUrlState('iv', false)
  const [personas, setPersonas] = useUrlState('personas', 1)
  const [comb, setComb] = useState('93')
  const [cargando, setCargando] = useState(false)
  const [msg, setMsg] = useState(null)

  const distancia = km * (idaVuelta ? 2 : 1)
  const litros = rendimiento > 0 ? distancia / rendimiento : 0
  const combustible = litros * precio
  const peajesTotal = peajes * (idaVuelta ? 2 : 1)
  const total = combustible + peajesTotal
  const p = Math.max(1, personas)

  const usarPromedio = async () => {
    setCargando(true)
    setMsg(null)
    try {
      const est = await fetchBencinas()
      const m = mediana(est.map((e) => precioDe(e, comb)).filter(Boolean))
      if (m) {
        setPrecio(Math.round(m))
        setMsg(`Precio mediano nacional de ${COMBUSTIBLES.find((c) => c.id === comb).label}: ${formatCLP(m)}`)
      }
    } catch {
      setMsg('No se pudo obtener el precio actual.')
    }
    setCargando(false)
  }

  useShareText(`Viaje de ${formatNum(distancia, 0)} km: ${formatCLP(total)}${p > 1 ? `, ${formatCLP(total / p)} por persona` : ''}`)

  return (
    <>
      <div className="card">
        <div className="form-grid">
          <Field label="Distancia del viaje">
            {(id) => <NumberInput id={id} value={km} onChange={setKm} suffix="km" decimals={1} />}
          </Field>
          <Field label="Rendimiento del vehículo" hint="Revisa el manual o el etiquetado de eficiencia">
            {(id) => <NumberInput id={id} value={rendimiento} onChange={setRendimiento} suffix="km/L" decimals={1} />}
          </Field>
          <Field label="Precio del combustible">
            {(id) => <NumberInput id={id} value={precio} onChange={setPrecio} prefix="$" suffix="/L" />}
          </Field>
          <Field label="Peajes (por tramo)" hint="TAG o plazas de peaje">
            {(id) => <NumberInput id={id} value={peajes} onChange={setPeajes} prefix="$" />}
          </Field>
          <Field label="Personas que comparten el gasto">
            {(id) => <NumberInput id={id} value={personas} onChange={setPersonas} />}
          </Field>
        </div>
        <div className="inline-actions">
          <label className="checkbox inline">
            <input type="checkbox" checked={idaVuelta} onChange={(e) => setIdaVuelta(e.target.checked)} />
            Ida y vuelta
          </label>
          <span className="inline-group">
            <select value={comb} onChange={(e) => setComb(e.target.value)} aria-label="Combustible">
              {COMBUSTIBLES.slice(0, 4).map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <button type="button" className="btn-ghost" onClick={usarPromedio} disabled={cargando}>
              <Icon name="Fuel" size={15} /> {cargando ? 'Consultando…' : 'Usar precio actual'}
            </button>
          </span>
        </div>
        {msg && <p className="muted small">{msg}</p>}
      </div>

      <div className="card result">
        <div className="big-result">
          <span>Costo total del viaje</span>
          <strong>{formatCLP(total)}</strong>
          {p > 1 && <small>{formatCLP(total / p)} por persona</small>}
        </div>
        <ResultTable
          rows={[
            { label: 'Distancia total', value: `${formatNum(distancia, 0)} km` },
            { label: 'Combustible necesario', value: `${formatNum(litros, 1)} litros` },
            { label: 'Costo de combustible', value: formatCLP(combustible) },
            peajesTotal > 0 && { label: 'Peajes', value: formatCLP(peajesTotal) },
            { label: 'Costo por kilómetro', value: formatCLP(distancia ? total / distancia : 0), muted: true },
            { label: 'Total', value: formatCLP(total), strong: true },
          ]}
        />
      </div>

      <Note>
        ¿Buscas dónde cargar más barato? Revisa los <Link to="/bencinas/">precios de bencinas por comuna</Link>. En
        carretera el rendimiento suele ser mejor que en ciudad.
      </Note>
    </>
  )
}
