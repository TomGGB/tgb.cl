import { Link } from 'react-router-dom'
import { PARAMS, gratificacionArt50 } from '../lib/sueldo'
import { formatCLP } from '../lib/format'
import { Field, NumberInput, ResultTable, Note } from '../components/ui'
import { useUrlState } from '../lib/useUrlState'
import { useShareText } from '../lib/share'

export default function Gratificacion() {
  const [sueldo, setSueldo] = useUrlState('sueldo', 800_000)
  const [otros, setOtros] = useUrlState('otros', 0)

  const remuneracion = sueldo + otros
  const g = gratificacionArt50(remuneracion)
  const imponible = remuneracion + g.gratificacion

  useShareText(`Mi gratificación legal es ${formatCLP(g.gratificacion)} al mes`)

  return (
    <>
      <div className="card form-grid">
        <Field label="Sueldo base mensual">
          {(id) => <NumberInput id={id} value={sueldo} onChange={setSueldo} prefix="$" />}
        </Field>
        <Field label="Otros haberes imponibles" hint="Bonos, comisiones, horas extra del mes">
          {(id) => <NumberInput id={id} value={otros} onChange={setOtros} prefix="$" />}
        </Field>
      </div>

      <div className="card result">
        <div className="big-result">
          <span>Gratificación legal mensual</span>
          <strong>{formatCLP(g.gratificacion)}</strong>
          <small>{g.topada ? 'Alcanzas el tope legal' : '25% de tu remuneración mensual'}</small>
        </div>
        <ResultTable
          rows={[
            { label: 'Remuneración mensual', value: formatCLP(remuneracion) },
            { label: '25% de la remuneración', value: formatCLP(remuneracion * 0.25), muted: g.topada },
            { label: 'Tope mensual (4,75 ingresos mínimos ÷ 12)', value: formatCLP(g.tope), muted: !g.topada },
            { label: 'Gratificación', value: formatCLP(g.gratificacion) },
            { label: 'Total imponible', value: formatCLP(imponible), strong: true },
          ]}
        />
        <p className="small">
          <Link to={`/sueldo-liquido/?monto=${imponible}`}>Calcular el sueldo líquido con {formatCLP(imponible)}</Link>
        </p>
      </div>

      <Note>
        Corresponde a la modalidad del artículo 50 del Código del Trabajo, la más usada: el empleador paga el 25% de lo
        devengado en el año con un tope de 4,75 ingresos mínimos mensuales, normalmente en cuotas mensuales. La otra
        alternativa (artículo 47) es repartir el 30% de las utilidades. Ingreso mínimo vigente: {formatCLP(PARAMS.imm)}.
      </Note>
    </>
  )
}
