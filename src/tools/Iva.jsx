import { PARAMS } from '../lib/sueldo'
import { formatCLP } from '../lib/format'
import { Field, NumberInput, Segmented, ResultTable } from '../components/ui'
import { useUrlState } from '../lib/useUrlState'
import { useShareText } from '../lib/share'

export default function Iva() {
  const [modo, setModo] = useUrlState('modo', 'neto')
  const [monto, setMonto] = useUrlState('monto', 100_000)
  const t = PARAMS.iva

  const neto = modo === 'neto' ? monto : Math.round(monto / (1 + t))
  const total = modo === 'neto' ? Math.round(monto * (1 + t)) : monto
  const iva = total - neto

  useShareText(`Neto ${formatCLP(neto)} + IVA ${formatCLP(iva)} = ${formatCLP(total)}`)

  return (
    <>
      <div className="card">
        <Segmented
          label="Tipo de monto"
          value={modo}
          onChange={setModo}
          options={[
            { value: 'neto', label: 'Agregar IVA' },
            { value: 'total', label: 'Quitar IVA' },
          ]}
        />
        <div className="form-grid">
          <Field label={modo === 'neto' ? 'Monto neto' : 'Monto total con IVA'}>
            {(id) => <NumberInput id={id} value={monto} onChange={setMonto} prefix="$" />}
          </Field>
        </div>
      </div>

      <div className="card result">
        <ResultTable
          rows={[
            { label: 'Neto', value: formatCLP(neto) },
            { label: 'IVA (19%)', value: formatCLP(iva) },
            { label: 'Total', value: formatCLP(total), strong: true },
          ]}
        />
      </div>
    </>
  )
}
