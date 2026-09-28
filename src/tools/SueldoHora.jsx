import { Link } from 'react-router-dom'
import { PARAMS, valorHoraExtra } from '../lib/sueldo'
import { formatCLP, formatNum } from '../lib/format'
import { Field, NumberInput, Segmented, ResultTable, Note } from '../components/ui'
import { useResult, Presets } from '../components/ux'
import { useUrlState } from '../lib/useUrlState'
import { useShareText } from '../lib/share'

export default function SueldoHora() {
  const [modo, setModo] = useUrlState('modo', 'hora')
  const [sueldo, setSueldo] = useUrlState('sueldo', 1_000_000)
  const [jornada, setJornada] = useUrlState('jornada', PARAMS.jornada)
  const [tarifa, setTarifa] = useUrlState('tarifa', 8_000)
  const [horasSemana, setHorasSemana] = useUrlState('hsem', 20)

  const j = Math.max(1, Math.min(PARAMS.jornada, jornada || PARAMS.jornada))
  const { valorHora } = valorHoraExtra({ sueldoBase: sueldo, jornada: j, recargo: 0 })
  const minimoProporcional = (PARAMS.imm * j) / PARAMS.jornada
  const horasMes = (j * 4 * 30) / 28 // equivalente usado en la fórmula legal
  const mensualDesdeTarifa = tarifa * horasSemana * 4.33

  const [etq, val] = modo === 'hora' ? ['Valor de tu hora', formatCLP(valorHora)] : modo === 'minimo' ? ['Mínimo para tu jornada', formatCLP(minimoProporcional)] : ['Ingreso mensual', formatCLP(mensualDesdeTarifa)]
  useResult(etq, val)
  useShareText(
    modo === 'hora'
      ? `Con ${formatCLP(sueldo)} al mes y ${j} horas semanales, mi hora vale ${formatCLP(valorHora)}`
      : modo === 'minimo'
        ? `El sueldo mínimo para una jornada de ${j} horas es ${formatCLP(minimoProporcional)}`
        : `Cobrando ${formatCLP(tarifa)} la hora por ${horasSemana} horas a la semana gano cerca de ${formatCLP(mensualDesdeTarifa)} al mes`,
  )

  return (
    <>
      <div className="card">
        <Segmented
          label="Qué quieres calcular"
          value={modo}
          onChange={setModo}
          options={[
            { value: 'hora', label: 'Valor de mi hora' },
            { value: 'minimo', label: 'Mínimo part-time' },
            { value: 'tarifa', label: 'Cobro por hora' },
          ]}
        />
        <div className="form-grid">
          {modo === 'hora' && (
            <Field label="Sueldo mensual">
              {(id) => <NumberInput id={id} value={sueldo} onChange={setSueldo} prefix="$" />}
            </Field>
          )}
          {modo !== 'tarifa' && (
            <Field label="Horas semanales de tu contrato" hint={`La jornada completa es de ${PARAMS.jornada} horas`}>
              {(id) => (
                <>
                  <NumberInput id={id} value={jornada} onChange={setJornada} suffix="horas" />
                  <Presets value={jornada} onChange={setJornada} options={[20, 30, 36, 42].map((v) => ({ label: `${v} h`, value: v }))} />
                </>
              )}
            </Field>
          )}
          {modo === 'tarifa' && (
            <>
              <Field label="Tarifa por hora">
                {(id) => <NumberInput id={id} value={tarifa} onChange={setTarifa} prefix="$" />}
              </Field>
              <Field label="Horas a la semana">
                {(id) => <NumberInput id={id} value={horasSemana} onChange={setHorasSemana} suffix="horas" decimals={1} />}
              </Field>
            </>
          )}
        </div>
      </div>

      <div className="card result">
        <div className="big-result">
          <span>{etq}</span>
          <strong>{val}</strong>
          {modo === 'hora' && <small>Unas {formatNum(horasMes, 0)} horas ordinarias al mes</small>}
          {modo === 'minimo' && <small>{formatNum((j / PARAMS.jornada) * 100, 0)}% del ingreso mínimo de {formatCLP(PARAMS.imm)}</small>}
          {modo === 'tarifa' && <small>{formatCLP(mensualDesdeTarifa * 12)} al año, en bruto</small>}
        </div>
        {modo === 'hora' && (
          <ResultTable
            rows={[
              { label: 'Valor de la hora ordinaria', value: formatCLP(valorHora) },
              { label: 'Valor de la hora extra (+50%)', value: formatCLP(valorHora * 1.5) },
              { label: 'Valor del día (sueldo ÷ 30)', value: formatCLP(sueldo / 30), muted: true },
            ]}
          />
        )}
        {modo === 'tarifa' && (
          <p className="muted small">
            Si emites boletas de honorarios, recibirás un 15,25% menos por la retención. Revisa la{' '}
            <Link to="/boleta-honorarios/">calculadora de boletas</Link>.
          </p>
        )}
      </div>

      <Note>
        El valor de la hora se calcula con la fórmula de la Dirección del Trabajo: sueldo ÷ 30 × 28 ÷ (4 × horas semanales).
        Cuando la jornada pactada es menor a la máxima de {PARAMS.jornada} horas, el sueldo no puede ser menor al ingreso mínimo
        proporcional a esas horas. Se considera jornada parcial la que no supera dos tercios de la jornada
        máxima: {formatNum((PARAMS.jornada * 2) / 3, 0)} horas semanales.
      </Note>
    </>
  )
}
