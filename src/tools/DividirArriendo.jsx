import { useState } from 'react'
import { dividirArriendo } from '../lib/hogar'
import { formatCLP, formatNum } from '../lib/format'
import { Field, NumberInput, Segmented, CopyButton, Note } from '../components/ui'
import { useResult } from '../components/ux'
import { Icon } from '../components/icons'
import { useUrlState } from '../lib/useUrlState'
import { useShareText } from '../lib/share'

export default function DividirArriendo() {
  const [arriendo, setArriendo] = useUrlState('arriendo', 750_000)
  const [gastos, setGastos] = useUrlState('gastos', 90_000)
  const [metodo, setMetodo] = useUrlState('metodo', 'mixto')
  const [personas, setPersonas] = useState([
    { nombre: 'Pieza principal', metros: 14 },
    { nombre: 'Pieza 2', metros: 10 },
    { nombre: 'Pieza 3', metros: 8 },
  ])

  const r = dividirArriendo({ arriendo, gastos, personas, metodo })
  const update = (i, patch) => setPersonas((p) => p.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  const texto = r.map((x) => `${x.nombre || 'Sin nombre'}: ${formatCLP(x.monto)}`).join('\n')

  useResult('Total mensual', formatCLP(arriendo + gastos))
  useShareText(`División del arriendo (${formatCLP(arriendo + gastos)} con gastos comunes):\n${texto}`)

  return (
    <>
      <div className="card">
        <div className="form-grid">
          <Field label="Arriendo mensual">
            {(id) => <NumberInput id={id} value={arriendo} onChange={setArriendo} prefix="$" />}
          </Field>
          <Field label="Gastos comunes y cuentas" hint="Se dividen en partes iguales">
            {(id) => <NumberInput id={id} value={gastos} onChange={setGastos} prefix="$" />}
          </Field>
        </div>
        <p className="field-label">Cómo dividir el arriendo</p>
        <Segmented
          label="Método"
          value={metodo}
          onChange={setMetodo}
          options={[
            { value: 'iguales', label: 'Partes iguales' },
            { value: 'metros', label: 'Según tamaño de la pieza' },
            { value: 'mixto', label: 'Mixto (mitad y mitad)' },
          ]}
        />
        <p className="field-label">Piezas o personas</p>
        <div className="people">
          {personas.map((p, i) => (
            <div key={i} className="person-row">
              <input value={p.nombre} placeholder="Nombre o pieza" aria-label="Nombre" onChange={(e) => update(i, { nombre: e.target.value })} />
              <NumberInput value={p.metros} onChange={(v) => update(i, { metros: v })} suffix="m²" decimals={1} aria-label={`Metros cuadrados de ${p.nombre}`} />
              <button type="button" className="icon-btn" aria-label={`Quitar ${p.nombre}`} onClick={() => setPersonas((x) => x.filter((_, j) => j !== i))}>
                <Icon name="X" size={16} />
              </button>
            </div>
          ))}
          <button type="button" className="btn-ghost" onClick={() => setPersonas((x) => [...x, { nombre: `Pieza ${x.length + 1}`, metros: 10 }])}>
            <Icon name="Plus" size={15} /> Agregar pieza
          </button>
        </div>
      </div>

      <div className="card result">
        <ul className="split-list">
          {r.map((x, i) => (
            <li key={i}>
              <span>
                <strong>{x.nombre || 'Sin nombre'}</strong>
                <span className="muted small">
                  {formatNum(x.metros, 1)} m² · arriendo {formatCLP(x.arriendo)} + gastos {formatCLP(x.gastos)}
                </span>
              </span>
              <span className="promo-total">
                {formatCLP(x.monto)}
                <small>{formatNum(x.porcentaje * 100, 1)}%</small>
              </span>
            </li>
          ))}
        </ul>
        <div className="inline-actions">
          <CopyButton text={texto} label="Copiar para el grupo" />
        </div>
      </div>

      <Note>
        El método mixto reparte la mitad del arriendo en partes iguales (áreas comunes, cocina, baño) y la otra mitad según el
        tamaño de cada pieza. Si una pieza tiene baño privado o balcón, puedes sumarle metros para reflejar ese beneficio.
      </Note>
    </>
  )
}
