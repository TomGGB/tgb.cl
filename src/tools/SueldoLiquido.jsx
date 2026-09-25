import { useIndicadores } from '../lib/indicadores'
import { AFPS, PARAMS, calcularLiquido, calcularBrutoDesdeLiquido } from '../lib/sueldo'
import { formatCLP, formatNum } from '../lib/format'
import { Field, NumberInput, Segmented, ResultTable, Note } from '../components/ui'
import { useUrlState } from '../lib/useUrlState'
import { useShareText } from '../lib/share'
import { useResult, Presets, Term } from '../components/ux'

export default function SueldoLiquido() {
  const { get } = useIndicadores()
  const uf = get('uf')
  const utm = get('utm')

  const [modo, setModo] = useUrlState('modo', 'bruto')
  const [monto, setMonto] = useUrlState('monto', 1_000_000)
  const [noImponible, setNoImponible] = useUrlState('noimp', 0)
  const [afp, setAfp] = useUrlState('afp', 'Modelo')
  const [salud, setSalud] = useUrlState('salud', 'fonasa')
  const [planUF, setPlanUF] = useUrlState('plan', 3)
  const [contrato, setContrato] = useUrlState('contrato', 'indefinido')

  const opts = {
    noImponible,
    comisionAFP: AFPS.find((a) => a.name === afp).comision,
    salud,
    planIsapreUF: planUF,
    contrato,
    uf,
    utm,
  }
  const r = modo === 'bruto' ? calcularLiquido({ ...opts, imponible: monto }) : calcularBrutoDesdeLiquido(monto, opts)

  useShareText(modo === 'bruto' ? `Con un sueldo bruto de ${formatCLP(r.imponible)} recibo ${formatCLP(r.liquido)} líquido` : `Para recibir ${formatCLP(r.liquido)} líquido necesito un sueldo bruto de ${formatCLP(r.imponible)}`)

  useResult(modo === 'bruto' ? 'Sueldo líquido' : 'Sueldo bruto necesario', formatCLP(modo === 'bruto' ? r.liquido : r.imponible))

  return (
    <>
      <div className="card">
        <Segmented
          label="Tipo de cálculo"
          value={modo}
          onChange={setModo}
          options={[
            { value: 'bruto', label: 'De bruto a líquido' },
            { value: 'liquido', label: 'De líquido a bruto' },
          ]}
        />
        <div className="form-grid">
          <Field
            label={modo === 'bruto' ? <>Sueldo bruto <Term>imponible</Term></> : <>Sueldo <Term k="liquido">líquido</Term> deseado</>}
            hint={modo === 'bruto' ? 'Sueldo base + gratificación + bonos imponibles' : 'Incluye los haberes no imponibles'}
          >
            {(id) => (
              <>
                <NumberInput id={id} value={monto} onChange={setMonto} prefix="$" />
                {modo === 'bruto' && (
                  <Presets
                    value={monto}
                    onChange={setMonto}
                    options={[
                      { label: 'Sueldo mínimo', value: PARAMS.imm },
                      { label: '$800.000', value: 800_000 },
                      { label: '$1.000.000', value: 1_000_000 },
                      { label: '$1.500.000', value: 1_500_000 },
                      { label: '$2.500.000', value: 2_500_000 },
                    ]}
                  />
                )}
              </>
            )}
          </Field>
          <Field label={<>Haberes <Term k="no imponible">no imponibles</Term></>} hint="Colación, movilización, viáticos">
            {(id) => <NumberInput id={id} value={noImponible} onChange={setNoImponible} prefix="$" />}
          </Field>
          <Field label="AFP">
            {(id) => (
              <select id={id} value={afp} onChange={(e) => setAfp(e.target.value)}>
                {AFPS.map((a) => (
                  <option key={a.name} value={a.name}>
                    {a.name} ({formatNum(a.comision * 100, 2)}%)
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Salud">
            {(id) => (
              <select id={id} value={salud} onChange={(e) => setSalud(e.target.value)}>
                <option value="fonasa">Fonasa (7%)</option>
                <option value="isapre">Isapre</option>
              </select>
            )}
          </Field>
          {salud === 'isapre' && (
            <Field label="Valor del plan Isapre" hint={`≈ ${formatCLP(planUF * uf)}`}>
              {(id) => <NumberInput id={id} value={planUF} onChange={setPlanUF} suffix="UF" decimals={2} />}
            </Field>
          )}
          <Field label="Tipo de contrato">
            {(id) => (
              <select id={id} value={contrato} onChange={(e) => setContrato(e.target.value)}>
                <option value="indefinido">Indefinido</option>
                <option value="plazo">Plazo fijo / por obra</option>
              </select>
            )}
          </Field>
        </div>
      </div>

      <div className="card result">
        <div className="big-result">
          <span>{modo === 'bruto' ? 'Sueldo líquido' : 'Sueldo bruto imponible necesario'}</span>
          <strong>{formatCLP(modo === 'bruto' ? r.liquido : r.imponible)}</strong>
        </div>
        <ResultTable
          rows={[
            { label: 'Sueldo imponible', value: formatCLP(r.imponible) },
            { label: `AFP ${afp} (${formatNum((PARAMS.cotizacionAFP + opts.comisionAFP) * 100, 2)}%)`, value: `− ${formatCLP(r.afp)}` },
            { label: salud === 'fonasa' ? 'Fonasa (7%)' : 'Isapre', value: `− ${formatCLP(r.salud)}` },
            { label: 'Seguro de cesantía', value: `− ${formatCLP(r.cesantia)}` },
            { label: <Term>Base tributable</Term>, value: formatCLP(r.tributable), muted: true },
            { label: <Term>Impuesto único</Term>, value: `− ${formatCLP(r.impuesto)}` },
            noImponible > 0 && { label: 'Haberes no imponibles', value: `+ ${formatCLP(noImponible)}` },
            { label: 'Sueldo líquido', value: formatCLP(r.liquido), strong: true },
          ]}
        />
      </div>

      <Note>
        Parámetros {PARAMS.anio}: tope imponible {formatNum(PARAMS.topeImponibleUF, 1)} UF (AFP y salud) y{' '}
        {formatNum(PARAMS.topeCesantiaUF, 1)} UF (cesantía). UF {formatCLP(uf)}, UTM {formatCLP(utm)}. No considera
        préstamos, APV ni otros descuentos voluntarios.
      </Note>
    </>
  )
}
