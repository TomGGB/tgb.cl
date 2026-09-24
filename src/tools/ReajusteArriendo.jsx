import { useEffect, useState } from 'react'
import { fetchValorEnFecha } from '../lib/indicadores'
import { formatCLP, formatNum, toISODate, fromISODate } from '../lib/format'
import { Field, NumberInput, ResultTable, Note } from '../components/ui'

const haceUnAnio = () => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 1)
  return toISODate(d)
}

export default function ReajusteArriendo() {
  const [monto, setMonto] = useState(500000)
  const [desde, setDesde] = useState(haceUnAnio())
  const [hasta, setHasta] = useState(toISODate(new Date()))
  const [uf, setUf] = useState({ desde: null, hasta: null, loading: false, error: null })

  useEffect(() => {
    if (!desde || !hasta) return
    let alive = true
    setUf((s) => ({ ...s, loading: true, error: null }))
    Promise.all([fetchValorEnFecha('uf', fromISODate(desde)), fetchValorEnFecha('uf', fromISODate(hasta))])
      .then(([a, b]) => {
        if (!alive) return
        if (!a || !b) throw new Error('Sin datos para esa fecha')
        setUf({ desde: a, hasta: b, loading: false, error: null })
      })
      .catch((error) => alive && setUf({ desde: null, hasta: null, loading: false, error }))
    return () => {
      alive = false
    }
  }, [desde, hasta])

  const variacion = uf.desde && uf.hasta ? uf.hasta / uf.desde - 1 : null

  return (
    <>
      <div className="card form-grid">
        <Field label="Arriendo actual">
          {(id) => <NumberInput id={id} value={monto} onChange={setMonto} prefix="$" />}
        </Field>
        <Field label="Fecha del último reajuste" hint="Por ejemplo, la fecha de firma del contrato">
          {(id) => <input id={id} type="date" value={desde} max={hasta} onChange={(e) => setDesde(e.target.value)} />}
        </Field>
        <Field label="Fecha del nuevo reajuste">
          {(id) => <input id={id} type="date" value={hasta} max={toISODate(new Date())} onChange={(e) => setHasta(e.target.value)} />}
        </Field>
      </div>

      {uf.loading && <div className="card loading-block">Consultando UF…</div>}
      {uf.error && <Note>No se encontró el valor de la UF para esas fechas. Prueba con otra fecha.</Note>}
      {variacion !== null && !uf.loading && (
        <div className="card result">
          <div className="big-result">
            <span>Nuevo arriendo</span>
            <strong>{formatCLP(monto * (1 + variacion))}</strong>
          </div>
          <ResultTable
            rows={[
              { label: 'Variación del período', value: `${formatNum(variacion * 100, 2)}%` },
              { label: 'Aumento mensual', value: formatCLP(monto * variacion) },
              { label: `UF al ${fromISODate(desde).toLocaleDateString('es-CL')}`, value: formatCLP(uf.desde), muted: true },
              { label: `UF al ${fromISODate(hasta).toLocaleDateString('es-CL')}`, value: formatCLP(uf.hasta), muted: true },
            ]}
          />
        </div>
      )}

      <Note>
        La UF se reajusta diariamente según el IPC del mes anterior, por lo que su variación es una buena aproximación del
        reajuste por IPC (con cerca de un mes de desfase). Revisa lo que dice tu contrato.
      </Note>
    </>
  )
}
