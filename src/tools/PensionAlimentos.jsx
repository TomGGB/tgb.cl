import { PARAMS } from '../lib/sueldo'
import { pensionAlimentos } from '../lib/calculos'
import { formatCLP, formatNum } from '../lib/format'
import { Field, NumberInput, ResultTable, Note } from '../components/ui'
import { Presets, useResult } from '../components/ux'
import { useUrlState } from '../lib/useUrlState'
import { useShareText } from '../lib/share'

export default function PensionAlimentos() {
  const [hijos, setHijos] = useUrlState('hijos', 1)
  const [ingresos, setIngresos] = useUrlState('ingresos', 0)

  const n = Math.max(1, Math.min(10, Math.floor(hijos) || 1))
  const r = pensionAlimentos({ hijos: n, ingresos })

  useResult('Pensión mínima total', formatCLP(r.total))
  useShareText(`La pensión de alimentos mínima legal para ${n} ${n === 1 ? 'hijo' : 'hijos'} es ${formatCLP(r.total)} al mes`)

  return (
    <>
      <div className="card">
        <div className="form-grid">
          <Field label="Número de hijos">
            {(id) => <NumberInput id={id} value={hijos} onChange={setHijos} />}
          </Field>
          <Field label="Ingresos mensuales del alimentante" hint="Opcional: para revisar el tope del 50%">
            {(id) => <NumberInput id={id} value={ingresos} onChange={setIngresos} prefix="$" />}
          </Field>
        </div>
        <Presets value={hijos} onChange={setHijos} options={[1, 2, 3, 4].map((v) => ({ label: `${v} ${v === 1 ? 'hijo' : 'hijos'}`, value: v }))} />
      </div>

      <div className="card result">
        <div className="big-result">
          <span>Pensión mínima legal al mes</span>
          <strong>{formatCLP(r.total)}</strong>
          <small>
            {n === 1 ? '40%' : '30% por hijo'} del ingreso mínimo ({formatCLP(PARAMS.imm)})
          </small>
        </div>
        <ResultTable
          rows={[
            { label: 'Por cada hijo', value: formatCLP(r.porHijo) },
            { label: 'Número de hijos', value: n },
            r.tope !== null && { label: 'Tope legal (50% de los ingresos)', value: formatCLP(r.tope), muted: true },
            { label: 'Total mínimo', value: formatCLP(r.total), strong: true },
          ]}
        />
        {r.superaTope && (
          <p className="small status bad">
            El mínimo supera el 50% de los ingresos informados. En ese caso el tribunal puede fijar un monto menor si se acredita
            que no hay medios para pagarlo.
          </p>
        )}
        {ingresos > 0 && !r.superaTope && (
          <p className="muted small">El mínimo equivale al {formatNum((r.total / ingresos) * 100, 1)}% de los ingresos informados.</p>
        )}
      </div>

      <Note>
        Estos son los mínimos que establece la Ley 14.908: 40% del ingreso mínimo por un hijo y 30% por cada hijo cuando son dos
        o más, y el total no puede superar el 50% de las rentas del alimentante. El monto real lo fija un tribunal de familia o
        un acuerdo, según las necesidades de los hijos y la capacidad económica de ambos padres, y puede ser mayor. Puedes
        pedir orientación gratuita en la Corporación de Asistencia Judicial.
      </Note>
    </>
  )
}
