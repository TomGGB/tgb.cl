import { useState } from 'react'
import { PARAMS } from '../lib/sueldo'
import { formatCLP, formatNum } from '../lib/format'
import { Field, NumberInput, Segmented, ResultTable, Note } from '../components/ui'

export default function BoletaHonorarios() {
  const [modo, setModo] = useState('bruto')
  const [monto, setMonto] = useState(1_000_000)
  const t = PARAMS.retencionHonorarios

  const bruto = modo === 'bruto' ? monto : Math.round(monto / (1 - t))
  const retencion = Math.round(bruto * t)
  const liquido = bruto - retencion

  return (
    <>
      <div className="card">
        <Segmented
          label="Tipo de cálculo"
          value={modo}
          onChange={setModo}
          options={[
            { value: 'bruto', label: 'Tengo el bruto' },
            { value: 'liquido', label: 'Quiero recibir un líquido' },
          ]}
        />
        <div className="form-grid">
          <Field label={modo === 'bruto' ? 'Monto bruto de la boleta' : 'Monto líquido que quieres recibir'}>
            {(id) => <NumberInput id={id} value={monto} onChange={setMonto} prefix="$" />}
          </Field>
        </div>
      </div>

      <div className="card result">
        <div className="big-result">
          <span>{modo === 'bruto' ? 'Recibes (líquido)' : 'Debes emitir por (bruto)'}</span>
          <strong>{formatCLP(modo === 'bruto' ? liquido : bruto)}</strong>
        </div>
        <ResultTable
          rows={[
            { label: 'Monto bruto', value: formatCLP(bruto) },
            { label: `Retención (${formatNum(t * 100, 2)}%)`, value: `− ${formatCLP(retencion)}` },
            { label: 'Monto líquido', value: formatCLP(liquido), strong: true },
          ]}
        />
      </div>

      <Note>
        La retención de {PARAMS.anio} es {formatNum(t * 100, 2)}% (Ley 21.133) y sube gradualmente hasta 17% en 2028. Se
        destina a cotizaciones previsionales e impuesto a la renta, y se reconcilia en la Operación Renta de abril.
      </Note>
    </>
  )
}
