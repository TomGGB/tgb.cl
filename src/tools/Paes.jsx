import { puntajePonderado } from '../lib/educacion'
import { formatNum } from '../lib/format'
import { NumberInput, Note } from '../components/ui'
import { useResult } from '../components/ux'
import { useUrlState } from '../lib/useUrlState'
import { useShareText } from '../lib/share'

const PRUEBAS = [
  { id: 'nem', nombre: 'Puntaje NEM', hint: 'Notas de enseñanza media' },
  { id: 'rk', nombre: 'Puntaje Ranking' },
  { id: 'cl', nombre: 'Competencia Lectora' },
  { id: 'm1', nombre: 'Competencia Matemática 1 (M1)' },
  { id: 'm2', nombre: 'Competencia Matemática 2 (M2)' },
  { id: 'hi', nombre: 'Historia y Ciencias Sociales' },
  { id: 'ci', nombre: 'Ciencias' },
]
const INICIAL = { nem: [700, 10], rk: [720, 20], cl: [650, 10], m1: [680, 40], m2: [0, 0], hi: [0, 0], ci: [620, 20] }

export default function Paes() {
  const campos = PRUEBAS.map((p) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [pts, setPts] = useUrlState(p.id, INICIAL[p.id][0])
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [peso, setPeso] = useUrlState(`${p.id}p`, INICIAL[p.id][1])
    return { ...p, pts, setPts, peso, setPeso }
  })
  const r = puntajePonderado(campos.map((c) => ({ puntaje: c.pts, peso: c.peso })))
  const fuera = campos.filter((c) => c.peso > 0 && (c.pts < 100 || c.pts > 1000))
  const pesosOk = Math.abs(r.sumaPesos - 100) < 0.01

  useResult('Puntaje ponderado', pesosOk ? formatNum(r.ponderado, 1) : null)
  useShareText(pesosOk ? `Mi puntaje ponderado PAES es ${formatNum(r.ponderado, 1)}` : null)

  return (
    <>
      <div className="card">
        <p className="muted small">
          Ingresa tus puntajes (de 100 a 1.000) y las ponderaciones de la carrera que te interesa, publicadas por cada
          universidad en el sitio de Acceso a la Educación Superior. Deja en 0% las pruebas que la carrera no pide.
        </p>
        <div className="table-wrap plain">
          <table className="data-table paes-table">
            <thead>
              <tr>
                <th>Prueba</th>
                <th className="num">Puntaje</th>
                <th className="num">Ponderación</th>
                <th className="num">Aporte</th>
              </tr>
            </thead>
            <tbody>
              {campos.map((c) => (
                <tr key={c.id} className={c.peso > 0 ? '' : 'inactive'}>
                  <td>
                    <strong>{c.nombre}</strong>
                  </td>
                  <td className="num"><NumberInput value={c.pts} onChange={c.setPts} aria-label={`Puntaje ${c.nombre}`} /></td>
                  <td className="num"><NumberInput value={c.peso} onChange={c.setPeso} suffix="%" aria-label={`Ponderación ${c.nombre}`} /></td>
                  <td className="num">{formatNum((c.pts * c.peso) / 100, 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`card result ${pesosOk ? '' : 'warn'}`}>
        <div className="big-result">
          <span>Puntaje ponderado</span>
          <strong>{pesosOk ? formatNum(r.ponderado, 1) : '—'}</strong>
          <small>
            {pesosOk ? 'Compáralo con el puntaje de corte del último seleccionado de la carrera' : `Las ponderaciones suman ${formatNum(r.sumaPesos, 0)}%: deben sumar 100%.`}
          </small>
        </div>
        {fuera.length > 0 && <p className="small status bad">Revisa los puntajes de {fuera.map((f) => f.nombre).join(', ')}: deben estar entre 100 y 1.000.</p>}
      </div>

      <Note>
        Cálculo referencial. Cada universidad define sus ponderaciones, puntajes mínimos y si acepta la mejor de dos prueba
        electivas (Historia o Ciencias). Si rendiste la PAES más de una vez, se usa el mejor puntaje de cada prueba. Revisa los
        requisitos oficiales en acceso.mineduc.cl.
      </Note>
    </>
  )
}
