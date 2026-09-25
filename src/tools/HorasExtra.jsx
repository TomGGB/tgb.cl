import { PARAMS, valorHoraExtra } from '../lib/sueldo'
import { formatCLP, formatNum } from '../lib/format'
import { Field, NumberInput, ResultTable, Note } from '../components/ui'
import { useUrlState } from '../lib/useUrlState'
import { useShareText } from '../lib/share'
import { useResult, Presets } from '../components/ux'

export default function HorasExtra() {
  const [sueldo, setSueldo] = useUrlState('sueldo', 800_000)
  const [jornada, setJornada] = useUrlState('jornada', PARAMS.jornada)
  const [horas, setHoras] = useUrlState('horas', 10)
  const [recargo, setRecargo] = useUrlState('recargo', 50)

  const j = Math.max(1, Math.min(PARAMS.jornada, jornada || PARAMS.jornada))
  const r = valorHoraExtra({ sueldoBase: sueldo, jornada: j, recargo: recargo / 100 })
  const total = r.valorExtra * horas

  useShareText(`${formatNum(horas, 1)} horas extra = ${formatCLP(total)} (${formatCLP(r.valorExtra)} por hora)`)

  useResult('Pago por horas extra', formatCLP(total))

  return (
    <>
      <div className="card form-grid">
        <Field label="Sueldo base mensual" hint="Sin gratificación ni bonos">
          {(id) => (
            <>
              <NumberInput id={id} value={sueldo} onChange={setSueldo} prefix="$" />
              <Presets value={sueldo} onChange={setSueldo} options={[{ label: 'Sueldo mínimo', value: PARAMS.imm }, { label: '$700.000', value: 700_000 }, { label: '$1.000.000', value: 1_000_000 }]} />
            </>
          )}
        </Field>
        <Field label="Jornada semanal pactada" hint={`Máximo legal: ${PARAMS.jornada} horas`}>
          {(id) => <NumberInput id={id} value={jornada} onChange={setJornada} suffix="horas" />}
        </Field>
        <Field label="Horas extra del mes">
          {(id) => <NumberInput id={id} value={horas} onChange={setHoras} suffix="horas" decimals={1} />}
        </Field>
        <Field label="Recargo" hint="El mínimo legal es 50%">
          {(id) => (
            <select id={id} value={recargo} onChange={(e) => setRecargo(Number(e.target.value))}>
              <option value={50}>50% (legal)</option>
              <option value={75}>75%</option>
              <option value={100}>100% (domingos o festivos, si se pactó)</option>
            </select>
          )}
        </Field>
      </div>

      <div className="card result">
        <div className="big-result">
          <span>Pago por horas extra</span>
          <strong>{formatCLP(total)}</strong>
          <small>{formatCLP(r.valorExtra)} por hora extra</small>
        </div>
        <ResultTable
          rows={[
            { label: 'Valor de la hora ordinaria', value: formatCLP(r.valorHora) },
            { label: `Valor de la hora extra (+${recargo}%)`, value: formatCLP(r.valorExtra) },
            { label: 'Factor sobre el sueldo', value: formatNum((28 / (30 * 4 * j)) * (1 + recargo / 100), 7), muted: true },
            { label: 'Horas extra', value: formatNum(horas, 1) },
            { label: 'Total a pagar', value: formatCLP(total), strong: true },
          ]}
        />
        {r.usaMinimo && (
          <p className="muted small">
            El sueldo base es menor al ingreso mínimo {j < PARAMS.jornada ? 'proporcional a tu jornada ' : ''}(
            {formatCLP(r.base)}), así que el cálculo se hace sobre el mínimo.
          </p>
        )}
      </div>

      <Note>
        Fórmula de la Dirección del Trabajo: sueldo ÷ 30 × 28 ÷ (4 × jornada semanal) × 1,5. Desde el 26 de abril de 2026
        la jornada máxima es de {PARAMS.jornada} horas (Ley 40 horas) y baja a 40 en abril de 2028. Las horas extra se
        pueden pactar hasta 2 por día y deben constar por escrito. Ingreso mínimo usado: {formatCLP(PARAMS.imm)}.
      </Note>
    </>
  )
}
