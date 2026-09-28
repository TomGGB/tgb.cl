import { contribuciones, CONTRIBUCIONES } from '../lib/tramites'
import { formatCLP, formatNum } from '../lib/format'
import { Field, NumberInput, ResultTable, Note } from '../components/ui'
import { useResult, Presets } from '../components/ux'
import { useUrlState } from '../lib/useUrlState'
import { useShareText } from '../lib/share'

export default function Contribuciones() {
  const [avaluo, setAvaluo] = useUrlState('avaluo', 90_000_000)
  const r = contribuciones(avaluo)
  const p = CONTRIBUCIONES

  useResult('Contribuciones al año', r.exento ? 'Exenta' : formatCLP(r.anual))
  useShareText(r.exento ? `Una propiedad con avalúo de ${formatCLP(avaluo)} está exenta de contribuciones` : `Con avalúo fiscal de ${formatCLP(avaluo)}, las contribuciones son cerca de ${formatCLP(r.cuota)} por cuota`)

  return (
    <>
      <div className="card">
        <Field label="Avalúo fiscal de la propiedad" hint="Aparece en el certificado de avalúo fiscal del SII o en el aviso de pago de la Tesorería">
          {(id) => (
            <>
              <NumberInput id={id} value={avaluo} onChange={setAvaluo} prefix="$" />
              <Presets
                value={avaluo}
                onChange={setAvaluo}
                options={[
                  { label: '$50 millones', value: 50_000_000 },
                  { label: '$100 millones', value: 100_000_000 },
                  { label: '$200 millones', value: 200_000_000 },
                  { label: '$300 millones', value: 300_000_000 },
                ]}
              />
            </>
          )}
        </Field>
      </div>

      <div className="card result">
        <div className="big-result">
          <span>Contribuciones al año</span>
          <strong>{r.exento ? 'Exenta' : formatCLP(r.anual)}</strong>
          <small>{r.exento ? `El avalúo no supera el monto exento de ${formatCLP(p.exento)}` : `4 cuotas de cerca de ${formatCLP(r.cuota)} (abril, junio, septiembre y noviembre)`}</small>
        </div>
        {!r.exento && (
          <ResultTable
            rows={[
              { label: 'Avalúo fiscal', value: formatCLP(avaluo) },
              { label: 'Monto exento', value: `− ${formatCLP(p.exento)}`, muted: true },
              { label: 'Avalúo afecto', value: formatCLP(r.afecto) },
              { label: `Tasa ${formatNum(p.tasaBaja * 100, 3)}% hasta ${formatCLP(p.tramo)}`, value: formatCLP(Math.max(0, Math.min(avaluo, p.tramo) - p.exento) * p.tasaBaja) },
              avaluo > p.tramo && { label: `Tasa ${formatNum(p.tasaAlta * 100, 3)}% sobre ${formatCLP(p.tramo)}`, value: formatCLP((avaluo - p.tramo) * p.tasaAlta) },
              { label: 'Contribución anual', value: formatCLP(r.anual), strong: true },
            ]}
          />
        )}
      </div>

      <Note>
        Estimación para propiedades habitacionales no agrícolas con los valores del SII del {p.vigencia}: monto exento de{' '}
        {formatCLP(p.exento)} y tasas de 0,893% y 1,042%. Estos montos se reajustan cada semestre. No incluye sobretasas
        (por ejemplo, por sitios no edificados o por la suma de varias propiedades de alto valor) ni rebajas: los adultos
        mayores pueden tener una rebaja de 50% o 100% según sus ingresos. El monto exacto aparece en el aviso de la Tesorería.
      </Note>
    </>
  )
}
