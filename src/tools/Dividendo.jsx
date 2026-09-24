import { useState } from 'react'
import { useIndicadores } from '../lib/indicadores'
import { formatCLP, formatNum } from '../lib/format'
import { Field, NumberInput, ResultTable, Note } from '../components/ui'

export default function Dividendo() {
  const { get } = useIndicadores()
  const uf = get('uf')
  const [valorUF, setValorUF] = useState(3500)
  const [piePct, setPiePct] = useState(20)
  const [anios, setAnios] = useState(25)
  const [tasa, setTasa] = useState(4.5)

  const credito = valorUF * (1 - piePct / 100)
  const n = anios * 12
  const r = tasa / 100 / 12
  const cuotaUF = r === 0 ? credito / n : (credito * r) / (1 - Math.pow(1 + r, -n))
  const totalUF = cuotaUF * n

  return (
    <>
      <div className="card form-grid">
        <Field label="Valor de la propiedad" hint={`≈ ${formatCLP(valorUF * uf)}`}>
          {(id) => <NumberInput id={id} value={valorUF} onChange={setValorUF} suffix="UF" decimals={2} />}
        </Field>
        <Field label="Pie" hint={`${formatNum(valorUF * piePct / 100, 0)} UF`}>
          {(id) => <NumberInput id={id} value={piePct} onChange={setPiePct} suffix="%" decimals={1} />}
        </Field>
        <Field label="Plazo">
          {(id) => (
            <select id={id} value={anios} onChange={(e) => setAnios(Number(e.target.value))}>
              {[8, 10, 12, 15, 20, 25, 30].map((a) => (
                <option key={a} value={a}>{a} años</option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Tasa anual" hint="Compara tasas en la CMF o en tu banco">
          {(id) => <NumberInput id={id} value={tasa} onChange={setTasa} suffix="%" decimals={2} />}
        </Field>
      </div>

      {credito > 0 && (
        <div className="card result">
          <div className="big-result">
            <span>Dividendo mensual estimado</span>
            <strong>{formatCLP(cuotaUF * uf)}</strong>
            <small>{formatNum(cuotaUF, 2)} UF</small>
          </div>
          <ResultTable
            rows={[
              { label: 'Monto del crédito', value: `${formatNum(credito, 0)} UF` },
              { label: 'Número de cuotas', value: n },
              { label: 'Total a pagar', value: `${formatNum(totalUF, 0)} UF` },
              { label: 'Intereses totales', value: `${formatNum(totalUF - credito, 0)} UF` },
              { label: 'Renta sugerida (dividendo ≤ 25%)', value: formatCLP(cuotaUF * uf * 4), muted: true },
            ]}
          />
        </div>
      )}

      <Note>
        Estimación sin seguros de desgravamen e incendio ni gastos operacionales, que suelen sumar entre 0,5 y 1 UF
        mensual. El valor final depende de la oferta del banco (CAE).
      </Note>
    </>
  )
}
