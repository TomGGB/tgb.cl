import { useIndicadores } from '../lib/indicadores'
import { AFPS, PARAMS } from '../lib/sueldo'
import { formatCLP, formatNum } from '../lib/format'
import { Field, NumberInput, Note } from '../components/ui'
import { Presets, useResult } from '../components/ux'
import { useUrlState } from '../lib/useUrlState'
import { useShareText } from '../lib/share'

export default function ComparadorAfp() {
  const { get } = useIndicadores()
  const uf = get('uf')
  const [sueldo, setSueldo] = useUrlState('sueldo', 1_200_000)
  const [actual, setActual] = useUrlState('afp', 'Habitat')

  const base = Math.min(sueldo, PARAMS.topeImponibleUF * uf)
  const filas = [...AFPS]
    .sort((a, b) => a.comision - b.comision)
    .map((a) => ({ ...a, mes: base * a.comision, anio: base * a.comision * 12, diez: base * a.comision * 120 }))
  const barata = filas[0]
  const mia = filas.find((f) => f.name === actual) ?? filas[0]
  const ahorroAnual = mia.anio - barata.anio
  const max = filas[filas.length - 1].anio || 1

  useResult('Ahorro al año', ahorroAnual > 0 ? formatCLP(ahorroAnual) : 'Ya pagas lo mínimo')
  useShareText(
    ahorroAnual > 0
      ? `Cambiándome de AFP ${mia.name} a AFP ${barata.name} me ahorraría ${formatCLP(ahorroAnual)} al año en comisiones`
      : `Con AFP ${mia.name} ya pago la comisión más baja`,
  )

  return (
    <>
      <div className="card form-grid">
        <Field label="Sueldo bruto imponible">
          {(id) => (
            <>
              <NumberInput id={id} value={sueldo} onChange={setSueldo} prefix="$" />
              <Presets value={sueldo} onChange={setSueldo} options={[{ label: 'Sueldo mínimo', value: PARAMS.imm }, { label: '$1.000.000', value: 1_000_000 }, { label: '$2.000.000', value: 2_000_000 }]} />
            </>
          )}
        </Field>
        <Field label="Tu AFP actual">
          {(id) => (
            <select id={id} value={actual} onChange={(e) => setActual(e.target.value)}>
              {AFPS.map((a) => (
                <option key={a.name} value={a.name}>AFP {a.name}</option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <div className="card result">
        <div className="big-result">
          <span>{ahorroAnual > 0 ? `Cambiándote a AFP ${barata.name} ahorrarías` : 'Tu AFP ya tiene la comisión más baja'}</span>
          <strong>{ahorroAnual > 0 ? `${formatCLP(ahorroAnual)} al año` : `AFP ${mia.name}`}</strong>
          {ahorroAnual > 0 && <small>{formatCLP(ahorroAnual / 12)} al mes · {formatCLP(ahorroAnual * 10)} en 10 años</small>}
        </div>
        <ul className="afp-bars">
          {filas.map((f) => (
            <li key={f.name} className={f.name === mia.name ? 'mine' : ''}>
              <span className="afp-name">
                AFP {f.name}
                {f.name === mia.name && <span className="tag blue">Tu AFP</span>}
              </span>
              <span className="afp-bar"><i style={{ width: `${(f.anio / max) * 100}%` }} /></span>
              <span className="afp-val">
                <strong>{formatCLP(f.mes)}</strong>
                <small>{formatNum(f.comision * 100, 2)}% · {formatCLP(f.anio)}/año</small>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <Note>
        La comisión es lo que la AFP cobra por administrar tus fondos y se descuenta de tu sueldo, aparte del 10% que va a tu
        cuenta. No considera la rentabilidad de cada AFP, que cambia en el tiempo: compárala en spensiones.cl. Cambiarse de AFP
        es gratis y se hace en línea en el sitio de la AFP de destino.
      </Note>
    </>
  )
}
