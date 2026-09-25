import { useEffect, useState } from 'react'
import { formatCLP, formatNum } from '../lib/format'
import { Field, NumberInput, Note } from '../components/ui'
import { useUrlState } from '../lib/useUrlState'

// Potencias típicas (W) y uso diario de referencia
const PRESETS = [
  { nombre: 'Refrigerador', w: 150, h: 10 },
  { nombre: 'Estufa eléctrica', w: 1500, h: 4 },
  { nombre: 'Estufa infrarroja/halógena', w: 1200, h: 3 },
  { nombre: 'Calefactor split (inverter)', w: 900, h: 5 },
  { nombre: 'Aire acondicionado', w: 1000, h: 4 },
  { nombre: 'Hervidor', w: 2000, h: 0.25 },
  { nombre: 'Microondas', w: 1100, h: 0.25 },
  { nombre: 'Horno eléctrico', w: 2000, h: 0.5 },
  { nombre: 'Lavadora', w: 500, h: 0.7 },
  { nombre: 'Secadora de ropa', w: 2500, h: 0.5 },
  { nombre: 'Termo eléctrico', w: 1500, h: 3 },
  { nombre: 'Televisor LED', w: 100, h: 5 },
  { nombre: 'Computador de escritorio', w: 200, h: 6 },
  { nombre: 'Notebook', w: 60, h: 6 },
  { nombre: 'Consola de videojuegos', w: 150, h: 2 },
  { nombre: 'Router WiFi', w: 10, h: 24 },
  { nombre: 'Secador de pelo', w: 1800, h: 0.2 },
  { nombre: 'Plancha', w: 1200, h: 0.3 },
  { nombre: 'Ampolleta LED', w: 9, h: 5 },
  { nombre: 'Auto eléctrico (carga en casa)', w: 7000, h: 1 },
]

const INICIAL = [
  { nombre: 'Refrigerador', w: 150, h: 10, n: 1 },
  { nombre: 'Televisor LED', w: 100, h: 5, n: 1 },
  { nombre: 'Ampolleta LED', w: 9, h: 5, n: 8 },
]

const STORAGE = 'consumo-electrico:v1'

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE))
    return Array.isArray(s) && s.length ? s : INICIAL
  } catch {
    return INICIAL
  }
}

export default function ConsumoElectrico() {
  const [tarifa, setTarifa] = useUrlState('tarifa', 210)
  const [aparatos, setAparatos] = useState(load)
  const [preset, setPreset] = useState(PRESETS[1].nombre)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE, JSON.stringify(aparatos))
    } catch {
      /* sin almacenamiento */
    }
  }, [aparatos])

  const update = (i, patch) => setAparatos((a) => a.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  const kwhMes = (a) => (a.w * a.h * a.n * 30) / 1000
  const totalKwh = aparatos.reduce((s, a) => s + kwhMes(a), 0)
  const max = Math.max(...aparatos.map(kwhMes), 1)

  return (
    <>
      <div className="card">
        <Field label="Precio del kWh" hint="Aparece en tu boleta como “cargo por energía”. Enel Santiago: ~$210 con IVA (julio 2026)">
          {(id) => <NumberInput id={id} value={tarifa} onChange={setTarifa} prefix="$" suffix="/kWh" decimals={1} />}
        </Field>
      </div>

      <div className="card">
        <h2>Tus aparatos</h2>
        <div className="table-wrap plain">
          <table className="data-table appliance-table">
            <thead>
              <tr>
                <th>Aparato</th>
                <th className="num">Potencia (W)</th>
                <th className="num">Horas/día</th>
                <th className="num">Cant.</th>
                <th className="num">kWh/mes</th>
                <th className="num">$/mes</th>
                <th aria-label="Quitar" />
              </tr>
            </thead>
            <tbody>
              {aparatos.map((a, i) => (
                <tr key={i}>
                  <td>
                    <input value={a.nombre} onChange={(e) => update(i, { nombre: e.target.value })} aria-label="Nombre del aparato" />
                    <span className="bar" style={{ width: `${(kwhMes(a) / max) * 100}%` }} />
                  </td>
                  <td className="num"><input type="number" min="0" value={a.w} onChange={(e) => update(i, { w: Number(e.target.value) })} aria-label="Potencia en watts" /></td>
                  <td className="num"><input type="number" min="0" max="24" step="0.25" value={a.h} onChange={(e) => update(i, { h: Number(e.target.value) })} aria-label="Horas de uso al día" /></td>
                  <td className="num"><input type="number" min="1" value={a.n} onChange={(e) => update(i, { n: Number(e.target.value) })} aria-label="Cantidad" /></td>
                  <td className="num">{formatNum(kwhMes(a), 1)}</td>
                  <td className="num"><strong>{formatCLP(kwhMes(a) * tarifa)}</strong></td>
                  <td><button type="button" className="icon-btn" onClick={() => setAparatos((x) => x.filter((_, j) => j !== i))} aria-label={`Quitar ${a.nombre}`}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="inline-actions">
          <span className="inline-group">
            <select value={preset} onChange={(e) => setPreset(e.target.value)} aria-label="Aparato a agregar">
              {PRESETS.map((p) => (
                <option key={p.nombre}>{p.nombre}</option>
              ))}
            </select>
            <button
              type="button"
              className="btn"
              onClick={() => {
                const p = PRESETS.find((x) => x.nombre === preset)
                setAparatos((a) => [...a, { ...p, n: 1 }])
              }}
            >
              + Agregar
            </button>
          </span>
          <button type="button" className="btn-ghost" onClick={() => setAparatos(INICIAL)}>Restablecer</button>
        </div>
      </div>

      <div className="card result">
        <div className="big-result">
          <span>Costo mensual estimado</span>
          <strong>{formatCLP(totalKwh * tarifa)}</strong>
          <small>{formatNum(totalKwh, 0)} kWh al mes · {formatCLP((totalKwh * tarifa) / 30)} al día</small>
        </div>
      </div>

      <Note>
        Estimación con 30 días de uso. El consumo real depende del modelo y la eficiencia (el refrigerador, por ejemplo, no
        funciona todo el tiempo a plena potencia). No incluye el cargo fijo ni otros cargos de la boleta. Tu lista se guarda
        en este navegador.
      </Note>
    </>
  )
}
