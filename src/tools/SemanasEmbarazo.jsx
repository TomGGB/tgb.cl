import { Link } from 'react-router-dom'
import { embarazo } from '../lib/tramites'
import { toISODate, fromISODate } from '../lib/format'
import { Field, Note } from '../components/ui'
import { useResult } from '../components/ux'
import { useUrlState } from '../lib/useUrlState'
import { useShareText } from '../lib/share'

const fmt = (d) => d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

function haceSemanas(n) {
  const d = new Date()
  d.setDate(d.getDate() - n * 7)
  return toISODate(d)
}

export default function SemanasEmbarazo() {
  const [fur, setFur] = useUrlState('fur', haceSemanas(12))
  const r = fur ? embarazo({ fur: fromISODate(fur) }) : null
  const valido = r && r.dias >= 0 && r.dias <= 300

  useResult('Semanas de embarazo', valido ? `${r.semanas} + ${r.diasExtra}` : null)
  useShareText(valido ? `Tengo ${r.semanas} semanas y ${r.diasExtra} días de embarazo; fecha probable de parto: ${fmt(r.fpp)}` : null)

  return (
    <>
      <div className="card">
        <Field label="Primer día de tu última regla" hint="Fecha de última menstruación (FUR)">
          {(id) => <input id={id} type="date" value={fur} max={toISODate(new Date())} onChange={(e) => setFur(e.target.value)} />}
        </Field>
      </div>

      {r && !valido && <Note>Revisa la fecha: debe ser dentro de los últimos 10 meses.</Note>}

      {valido && (
        <div className="card result">
          <div className="big-result">
            <span>Tienes</span>
            <strong>
              {r.semanas} semanas y {r.diasExtra} {r.diasExtra === 1 ? 'día' : 'días'}
            </strong>
            <small>Estás en el {r.trimestre === 1 ? 'primer' : r.trimestre === 2 ? 'segundo' : 'tercer'} trimestre</small>
          </div>
          <div className="pregnancy-bar" role="img" aria-label={`${Math.round(r.progreso * 100)}% del embarazo`}>
            <span style={{ width: `${r.progreso * 100}%` }} />
            <i style={{ left: `${(14 / 40) * 100}%` }} />
            <i style={{ left: `${(28 / 40) * 100}%` }} />
          </div>
          <div className="pregnancy-legend" aria-hidden="true">
            <span>1.er trimestre</span>
            <span>2.º trimestre</span>
            <span>3.er trimestre</span>
          </div>
          <ul className="simple-list">
            <li><span>Fecha probable de parto</span><strong className="capitalize">{fmt(r.fpp)}</strong></li>
            <li><span>Faltan</span><strong>{r.faltan > 0 ? `${r.faltan} días (unas ${Math.round(r.faltan / 7)} semanas)` : 'Ya estás en fecha'}</strong></li>
            <li><span>Inicio del prenatal (6 semanas antes)</span><strong className="capitalize">{fmt(r.prenatal)}</strong></li>
          </ul>
          <p className="small">
            <Link to={`/pre-postnatal/?fpp=${toISODate(r.fpp)}`}>Ver las fechas de tu pre y postnatal</Link>
          </p>
        </div>
      )}

      <Note>
        Cálculo con la regla de Naegele: la fecha probable de parto es 280 días (40 semanas) después del primer día de la última
        regla. Es una estimación: solo 1 de cada 20 bebés nace exactamente ese día, y la ecografía puede ajustar la fecha.
        Sigue siempre las indicaciones de tu matrona o médico.
      </Note>
    </>
  )
}
