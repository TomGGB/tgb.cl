import { Link } from 'react-router-dom'
import { useIndicadores } from '../lib/indicadores'
import { costoEmpleador, APORTES } from '../lib/empleo'
import { PARAMS } from '../lib/sueldo'
import { formatCLP, formatNum } from '../lib/format'
import { Field, NumberInput, Segmented, ResultTable, Note } from '../components/ui'
import { Presets, useResult } from '../components/ux'
import { useUrlState } from '../lib/useUrlState'
import { useShareText } from '../lib/share'

export default function CostoEmpleador() {
  const { get } = useIndicadores()
  const uf = get('uf')
  const [modo, setModo] = useUrlState('modo', 'empresa')
  const [imponible, setImponible] = useUrlState('sueldo', 1_000_000)
  const [noImponible, setNoImponible] = useUrlState('noimp', 0)
  const [contrato, setContrato] = useUrlState('contrato', 'indefinido')
  const [mutual, setMutual] = useUrlState('mutual', 0.93)

  const tipo = modo === 'casa' ? 'casa' : contrato
  const r = costoEmpleador({ imponible, noImponible, tipo, mutual: mutual / 100, uf })

  useResult('Costo mensual', formatCLP(r.total))
  useShareText(`Contratar a alguien con sueldo imponible de ${formatCLP(imponible)} cuesta ${formatCLP(r.total)} al mes`)

  return (
    <>
      <div className="card">
        <Segmented
          label="Tipo de trabajador"
          value={modo}
          onChange={setModo}
          options={[
            { value: 'empresa', label: 'Trabajador de empresa' },
            { value: 'casa', label: 'Trabajadora de casa particular' },
          ]}
        />
        <div className="form-grid">
          <Field label="Sueldo bruto imponible" hint="Sueldo base + gratificación + bonos">
            {(id) => (
              <>
                <NumberInput id={id} value={imponible} onChange={setImponible} prefix="$" />
                <Presets value={imponible} onChange={setImponible} options={[{ label: 'Sueldo mínimo', value: PARAMS.imm }, { label: '$800.000', value: 800_000 }, { label: '$1.500.000', value: 1_500_000 }]} />
              </>
            )}
          </Field>
          <Field label="Colación y movilización" hint="Haberes no imponibles">
            {(id) => <NumberInput id={id} value={noImponible} onChange={setNoImponible} prefix="$" />}
          </Field>
          {modo === 'empresa' && (
            <Field label="Tipo de contrato">
              {(id) => (
                <select id={id} value={contrato} onChange={(e) => setContrato(e.target.value)}>
                  <option value="indefinido">Indefinido</option>
                  <option value="plazo">Plazo fijo / por obra</option>
                </select>
              )}
            </Field>
          )}
          <Field label="Tasa de la mutual" hint="0,93% es la básica; según el rubro puede ser mayor">
            {(id) => <NumberInput id={id} value={mutual} onChange={setMutual} suffix="%" decimals={2} />}
          </Field>
        </div>
      </div>

      <div className="card result">
        <div className="big-result">
          <span>Costo total mensual para el empleador</span>
          <strong>{formatCLP(r.total)}</strong>
          <small>{formatCLP(r.anual)} al año · los aportes suman {formatNum(r.recargo * 100, 1)}% del sueldo</small>
        </div>
        <ResultTable
          rows={[
            { label: 'Sueldo bruto imponible', value: formatCLP(imponible) },
            noImponible > 0 && { label: 'Haberes no imponibles', value: formatCLP(noImponible) },
            ...r.items.map((i) => ({ label: `${i.label} (${formatNum(i.tasa * 100, 2)}%)`, value: `+ ${formatCLP(i.monto)}` })),
            { label: 'Costo total', value: formatCLP(r.total), strong: true },
          ]}
        />
        <p className="muted small">
          ¿Cuánto recibe la persona? Revisa su <Link to={`/sueldo-liquido/?monto=${imponible}${noImponible ? `&noimp=${noImponible}` : ''}`}>sueldo líquido</Link>.
        </p>
      </div>

      <Note>
        Aportes del empleador desde las remuneraciones de agosto de 2026: {formatNum(APORTES.reforma * 100, 1)}% de la reforma de
        pensiones (seguro social previsional con el SIS incluido, cotización con rentabilidad protegida y cuenta individual),
        que irá subiendo hasta 8,5%; seguro de cesantía de 2,4% en contratos indefinidos y 3% a plazo fijo; y seguro de
        accidentes desde 0,93%. En casa particular, el empleador paga además 1,11% de indemnización a todo evento y 3% de
        seguro de cesantía. Las cotizaciones se calculan con topes de {formatNum(PARAMS.topeImponibleUF, 1)} UF (y{' '}
        {formatNum(PARAMS.topeCesantiaUF, 1)} UF para cesantía). No incluye vacaciones, gratificación ni indemnizaciones futuras.
      </Note>
    </>
  )
}
