import { Link } from 'react-router-dom'
import { feriadoAnual } from '../lib/laboral'
import { antiguedad, vacacionesProporcionales } from '../lib/finiquito'
import { toISODate, fromISODate, formatNum } from '../lib/format'
import { Field, NumberInput, ResultTable, Note } from '../components/ui'
import { useUrlState } from '../lib/useUrlState'
import { useShareText } from '../lib/share'
import { useResult, Term } from '../components/ux'

export default function Vacaciones() {
  const [inicio, setInicio] = useUrlState('inicio', '2018-03-01')
  const [previos, setPrevios] = useUrlState('previos', 0)
  const [tomados, setTomados] = useUrlState('tomados', 0)

  const hoy = new Date()
  const valido = inicio && fromISODate(inicio) < hoy
  const ant = valido ? antiguedad(fromISODate(inicio), hoy) : { anios: 0, meses: 0, dias: 0 }
  const f = feriadoAnual({ aniosEmpleadorActual: ant.anios, aniosAnteriores: previos })
  // días ganados desde el último aniversario, al ritmo del feriado anual que corresponde
  const acumulados = (ant.anios >= 1 ? f.total : 15) / 15 * vacacionesProporcionales(ant)
  const disponibles = Math.max(0, acumulados - tomados)

  useShareText(`Me corresponden ${f.total} días hábiles de vacaciones al año${f.progresivos ? ` (${f.progresivos} progresivos)` : ''}`)

  useResult('Vacaciones al año', valido ? `${f.total} días hábiles` : null)

  return (
    <>
      <div className="card form-grid">
        <Field label="Fecha de ingreso a tu trabajo actual">
          {(id) => <input id={id} type="date" value={inicio} max={toISODate(hoy)} onChange={(e) => setInicio(e.target.value)} />}
        </Field>
        <Field label="Años cotizados con empleadores anteriores" hint="Cuentan hasta 10 años para las vacaciones progresivas">
          {(id) => <NumberInput id={id} value={previos} onChange={setPrevios} suffix="años" />}
        </Field>
        <Field label="Días ya tomados desde tu último aniversario" hint="Días hábiles">
          {(id) => <NumberInput id={id} value={tomados} onChange={setTomados} suffix="días" decimals={1} />}
        </Field>
      </div>

      {valido && (
        <div className="card result">
          <div className="big-result">
            <span>Vacaciones que te corresponden cada año</span>
            <strong>{f.total} días hábiles</strong>
            <small>
              Antigüedad: {ant.anios} {ant.anios === 1 ? 'año' : 'años'} y {ant.meses} {ant.meses === 1 ? 'mes' : 'meses'}
            </small>
          </div>
          <ResultTable
            rows={[
              { label: 'Feriado legal', value: ant.anios >= 1 ? '15 días' : 'Desde tu primer año' },
              { label: <Term k="progresivas">Días progresivos</Term>, value: `${f.progresivos} ${f.progresivos === 1 ? 'día' : 'días'}` },
              { label: 'Próximo día progresivo', value: `en ${f.faltanAnios} ${f.faltanAnios === 1 ? 'año' : 'años'}`, muted: true },
              { label: 'Acumulados desde tu último aniversario', value: `${formatNum(acumulados, 1)} días` },
              tomados > 0 && { label: 'Ya tomados', value: `− ${formatNum(tomados, 1)} días` },
              { label: 'Disponibles hoy (proporcional)', value: `${formatNum(disponibles, 1)} días`, strong: true },
            ]}
          />
          <p className="muted small">
            ¿Quieres aprovecharlos mejor? Revisa el <Link to="/fines-de-semana-largos/">planificador de fines de semana largos</Link>.
          </p>
        </div>
      )}

      <Note>
        Tras un año de trabajo corresponden 15 días hábiles de vacaciones al año (los sábados no se cuentan). Con 10 años
        cotizados, continuos o no, se suma un día por cada 3 años nuevos con el empleador actual (artículo 68 del Código
        del Trabajo). Los días progresivos se pierden al cambiar de empleador. Los días no tomados se acumulan hasta por dos
        períodos y se pagan en el finiquito.
      </Note>
    </>
  )
}
