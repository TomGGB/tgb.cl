import { useState } from 'react'
import { validateRut, formatRut, calcDV, cleanRut, randomRut } from '../lib/rut'
import { Field, CopyButton } from '../components/ui'
import { Icon } from '../components/icons'

export default function Rut() {
  const [rut, setRut] = useState('')
  const [cuerpo, setCuerpo] = useState('')
  const [generados, setGenerados] = useState([])

  const c = cleanRut(rut)
  const valido = c.length >= 2 && validateRut(c)
  const dvCorrecto = c.length >= 2 && /^\d+$/.test(c.slice(0, -1)) ? calcDV(c.slice(0, -1)) : null
  const cuerpoLimpio = cuerpo.replace(/\D/g, '')

  return (
    <>
      <section className="card">
        <h2>Validar RUT</h2>
        <Field label="RUT con dígito verificador">
          {(id) => (
            <input
              id={id}
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              onBlur={() => c.length >= 2 && setRut(formatRut(c))}
              placeholder="12.345.678-5"
              autoComplete="off"
              className={c.length >= 2 ? (valido ? 'valid' : 'invalid') : ''}
            />
          )}
        </Field>
        {c.length >= 2 && (
          <div className={`status ${valido ? 'ok' : 'bad'}`}>
            {valido ? (
              <><Icon name="CircleCheck" size={18} /> RUT válido: <strong>{formatRut(c)}</strong> <CopyButton text={formatRut(c)} /></>
            ) : (
              <><Icon name="CircleX" size={18} /> RUT inválido{dvCorrecto && <>. El dígito verificador correcto sería <strong>{dvCorrecto}</strong>.</>}</>
            )}
          </div>
        )}
      </section>

      <section className="card">
        <h2>Calcular dígito verificador</h2>
        <Field label="RUT sin dígito verificador">
          {(id) => (
            <input id={id} value={cuerpo} onChange={(e) => setCuerpo(e.target.value)} placeholder="12345678" inputMode="numeric" autoComplete="off" />
          )}
        </Field>
        {cuerpoLimpio && (
          <div className="status ok">
            Dígito verificador: <strong>{calcDV(cuerpoLimpio)}</strong> → {formatRut(cuerpoLimpio + calcDV(cuerpoLimpio))}{' '}
            <CopyButton text={formatRut(cuerpoLimpio + calcDV(cuerpoLimpio))} />
          </div>
        )}
      </section>

      <section className="card">
        <h2>Generar RUT de prueba</h2>
        <p className="muted small">RUT aleatorios con dígito verificador válido, útiles para probar formularios y software.</p>
        <button type="button" className="btn" onClick={() => setGenerados(Array.from({ length: 5 }, () => randomRut()))}>
          Generar 5 RUT
        </button>
        {generados.length > 0 && (
          <ul className="simple-list mono">
            {generados.map((g) => (
              <li key={g}>
                {g} <CopyButton text={g} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
