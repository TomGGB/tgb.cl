import { useState } from 'react'
import { formatCLP } from '../lib/format'
import { Field, NumberInput, Segmented, ResultTable, CopyButton } from '../components/ui'
import { useUrlState } from '../lib/useUrlState'

const redondear = (n, a) => (a ? Math.ceil(n / a) * a : Math.round(n))

export default function DividirCuenta() {
  const [modo, setModo] = useUrlState('modo', 'igual')
  const [total, setTotal] = useUrlState('total', 60_000)
  const [personas, setPersonas] = useUrlState('personas', 4)
  const [propina, setPropina] = useUrlState('propina', 10)
  const [redondeo, setRedondeo] = useUrlState('redondeo', 100)
  const [gente, setGente] = useState([
    { nombre: 'Ana', consumo: 18_000 },
    { nombre: 'Benja', consumo: 12_500 },
    { nombre: 'Cata', consumo: 22_000 },
  ])

  const factor = 1 + propina / 100
  const n = Math.max(1, personas)

  let filas
  let resumen
  if (modo === 'igual') {
    const conPropina = total * factor
    const cada = redondear(conPropina / n, redondeo)
    resumen = { subtotal: total, propina: total * (propina / 100), total: conPropina, porPersona: cada }
    filas = [
      { label: 'Consumo', value: formatCLP(total) },
      { label: `Propina (${propina}%)`, value: formatCLP(resumen.propina) },
      { label: 'Total con propina', value: formatCLP(conPropina) },
      { label: `Cada uno paga (${n} personas)`, value: formatCLP(cada), strong: true },
      cada * n - conPropina > 0.5 && { label: 'Sobra por redondeo (para propina extra)', value: formatCLP(cada * n - conPropina), muted: true },
    ]
  } else {
    const subtotal = gente.reduce((s, g) => s + g.consumo, 0)
    resumen = { subtotal, propina: subtotal * (propina / 100), total: subtotal * factor }
    const juntado = gente.reduce((s, g) => s + redondear(g.consumo * factor, redondeo), 0)
    filas = [
      ...gente.map((g) => ({ label: g.nombre || 'Sin nombre', value: formatCLP(redondear(g.consumo * factor, redondeo)) })),
      { label: `Total con propina (${propina}%)`, value: formatCLP(resumen.total), muted: juntado - resumen.total > 0.5 },
      juntado - resumen.total > 0.5 && { label: 'Total a juntar (con redondeo)', value: formatCLP(juntado), strong: true },
      juntado - resumen.total <= 0.5 && { label: 'Total a juntar', value: formatCLP(juntado), strong: true },
    ]
  }

  const texto =
    modo === 'igual'
      ? `Cuenta: ${formatCLP(resumen.total)} con propina. Cada uno paga ${formatCLP(resumen.porPersona)}.`
      : gente.map((g) => `${g.nombre}: ${formatCLP(redondear(g.consumo * factor, redondeo))}`).join('\n')

  return (
    <>
      <div className="card">
        <Segmented
          label="Modo"
          value={modo}
          onChange={setModo}
          options={[
            { value: 'igual', label: 'Partes iguales' },
            { value: 'cada', label: 'Cada uno lo suyo' },
          ]}
        />
        <div className="form-grid">
          {modo === 'igual' && (
            <>
              <Field label="Total de la cuenta (sin propina)">
                {(id) => <NumberInput id={id} value={total} onChange={setTotal} prefix="$" />}
              </Field>
              <Field label="Personas">
                {(id) => <NumberInput id={id} value={personas} onChange={setPersonas} />}
              </Field>
            </>
          )}
          <Field label="Propina" hint="La sugerida en Chile es 10%">
            {(id) => (
              <select id={id} value={propina} onChange={(e) => setPropina(Number(e.target.value))}>
                {[0, 5, 10, 12, 15, 20].map((p) => (
                  <option key={p} value={p}>{p}%</option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Redondear hacia arriba a">
            {(id) => (
              <select id={id} value={redondeo} onChange={(e) => setRedondeo(Number(e.target.value))}>
                <option value={0}>Sin redondeo</option>
                <option value={100}>$100</option>
                <option value={500}>$500</option>
                <option value={1000}>$1.000</option>
              </select>
            )}
          </Field>
        </div>

        {modo === 'cada' && (
          <div className="people">
            {gente.map((g, i) => (
              <div key={i} className="person-row">
                <input value={g.nombre} placeholder="Nombre" aria-label="Nombre" onChange={(e) => setGente((x) => x.map((p, j) => (j === i ? { ...p, nombre: e.target.value } : p)))} />
                <NumberInput value={g.consumo} prefix="$" aria-label={`Consumo de ${g.nombre}`} onChange={(v) => setGente((x) => x.map((p, j) => (j === i ? { ...p, consumo: v } : p)))} />
                <button type="button" className="icon-btn" aria-label={`Quitar a ${g.nombre}`} onClick={() => setGente((x) => x.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
            <button type="button" className="btn-ghost" onClick={() => setGente((x) => [...x, { nombre: '', consumo: 0 }])}>+ Agregar persona</button>
          </div>
        )}
      </div>

      <div className="card result">
        <ResultTable rows={filas} />
        <div className="inline-actions">
          <CopyButton text={texto} label="📋 Copiar para WhatsApp" />
        </div>
      </div>
    </>
  )
}
