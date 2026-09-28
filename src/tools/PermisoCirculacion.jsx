import { useEffect, useState } from 'react'
import { useIndicadores, fetchValorEnFecha } from '../lib/indicadores'
import { permisoCirculacion } from '../lib/tramites'
import { formatCLP, formatNum } from '../lib/format'
import { Field, NumberInput, ResultTable, Note } from '../components/ui'
import { useResult, Presets } from '../components/ux'
import { useUrlState } from '../lib/useUrlState'
import { useShareText } from '../lib/share'

export default function PermisoCirculacion() {
  const { get } = useIndicadores()
  const [tasacion, setTasacion] = useUrlState('tasacion', 9_000_000)
  const [nuevo, setNuevo] = useUrlState('nuevo', false)
  const [utmEnero, setUtmEnero] = useState(null)
  const anio = new Date().getFullYear()

  useEffect(() => {
    fetchValorEnFecha('utm', new Date(anio, 0, 1))
      .then((v) => setUtmEnero(v))
      .catch(() => setUtmEnero(null))
  }, [anio])

  const utm = utmEnero ?? get('utm')
  const mesesRestantes = nuevo ? 12 - new Date().getMonth() : 12
  const r = permisoCirculacion({ tasacion, utmEnero: utm, mesesRestantes })

  useResult('Permiso de circulación', formatCLP(r.total))
  useShareText(`Con una tasación de ${formatCLP(tasacion)}, el permiso de circulación ${anio} es cerca de ${formatCLP(r.total)}`)

  return (
    <>
      <div className="card">
        <div className="form-grid">
          <Field label="Tasación fiscal del vehículo" hint="Búscala por marca, modelo y año en el sitio del SII">
            {(id) => (
              <>
                <NumberInput id={id} value={tasacion} onChange={setTasacion} prefix="$" />
                <Presets
                  value={tasacion}
                  onChange={setTasacion}
                  options={[
                    { label: '$5 millones', value: 5_000_000 },
                    { label: '$10 millones', value: 10_000_000 },
                    { label: '$20 millones', value: 20_000_000 },
                  ]}
                />
              </>
            )}
          </Field>
        </div>
        <label className="checkbox">
          <input type="checkbox" checked={nuevo} onChange={(e) => setNuevo(e.target.checked)} />
          <span>Es un vehículo nuevo que saco este mes (se paga proporcional a los meses que quedan)</span>
        </label>
      </div>

      <div className="card result">
        <div className="big-result">
          <span>Permiso de circulación {anio}</span>
          <strong>{formatCLP(r.total)}</strong>
          <small>
            {nuevo ? `Proporcional a ${mesesRestantes} ${mesesRestantes === 1 ? 'mes' : 'meses'}` : `En dos cuotas: cerca de ${formatCLP(r.total / 2)} cada una`}
          </small>
        </div>
        <ResultTable
          rows={[
            { label: `Tasación en UTM (UTM de enero ${utmEnero ? formatCLP(utmEnero) : 'estimada'})`, value: `${formatNum(r.enUTM, 2)} UTM`, muted: true },
            ...r.detalle.map((t) => ({
              label: `${formatNum(t.tasa * 100, 1)}% sobre ${t.hasta === Infinity ? `más de ${t.desde}` : `${t.desde} a ${t.hasta}`} UTM`,
              value: `${formatNum(t.utm, 3)} UTM`,
            })),
            r.minimo && { label: 'Mínimo legal', value: '0,5 UTM' },
            { label: 'Permiso anual', value: `${formatNum(r.anualUTM, 3)} UTM = ${formatCLP(r.anual)}`, strong: true },
          ]}
        />
      </div>

      <Note>
        Cálculo según la escala del artículo 12 de la Ley de Rentas Municipales para automóviles, camionetas y station wagons,
        sobre la tasación fiscal del SII y la UTM de enero. No incluye el SOAP ni multas impagas. La segunda cuota (agosto) se
        reajusta según el IPC, así que puede ser algo mayor. La municipalidad calcula el valor final al pagar.
      </Note>
    </>
  )
}
