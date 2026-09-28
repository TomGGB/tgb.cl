import { useState } from 'react'
import { notaPorPuntaje, redondearNota, promedioPonderado, notaNecesaria, puntajeParaAprobar } from '../lib/educacion'
import { formatNum } from '../lib/format'
import { Field, NumberInput, Segmented, Note } from '../components/ui'
import { Presets, useResult } from '../components/ux'
import { Icon } from '../components/icons'
import { useUrlState } from '../lib/useUrlState'
import { useShareText } from '../lib/share'

const fmtNota = (n) => (n === null || !Number.isFinite(n) ? '—' : formatNum(redondearNota(n), 1))
const estado = (n) => (n === null ? '' : redondearNota(n) >= 4 ? 'aprobado' : 'reprobado')

function FilasNotas({ filas, setFilas, conPeso }) {
  const update = (i, patch) => setFilas((f) => f.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  return (
    <div className="grade-rows">
      {filas.map((f, i) => (
        <div key={i} className={`grade-row ${conPeso ? '' : 'no-weight'}`}>
          <span className="grade-n">{i + 1}</span>
          <NumberInput value={f.nota} onChange={(v) => update(i, { nota: v })} decimals={1} aria-label={`Nota ${i + 1}`} placeholder="Nota" />
          {conPeso && <NumberInput value={f.peso} onChange={(v) => update(i, { peso: v })} suffix="%" aria-label={`Porcentaje de la nota ${i + 1}`} />}
          <button type="button" className="icon-btn" aria-label={`Quitar nota ${i + 1}`} onClick={() => setFilas((x) => x.filter((_, j) => j !== i))}>
            <Icon name="X" size={16} />
          </button>
        </div>
      ))}
      <button type="button" className="btn-ghost" onClick={() => setFilas((x) => [...x, { nota: 0, peso: 0 }])}>
        <Icon name="Plus" size={15} /> Agregar nota
      </button>
    </div>
  )
}

export default function Notas() {
  const [modo, setModo] = useUrlState('modo', 'promedio')
  const [conPeso, setConPeso] = useState(true)
  const [filas, setFilas] = useState([
    { nota: 5.2, peso: 25 },
    { nota: 4.1, peso: 25 },
    { nota: 3.6, peso: 20 },
  ])
  const [meta, setMeta] = useUrlState('meta', 4)
  const [pesoExamen, setPesoExamen] = useUrlState('examen', 30)
  // escala
  const [maximo, setMaximo] = useUrlState('max', 60)
  const [exigencia, setExigencia] = useUrlState('exig', 60)
  const [puntaje, setPuntaje] = useUrlState('pts', 42)

  const sinPeso = filas.map((f) => ({ nota: f.nota }))
  const promedio = promedioPonderado(conPeso ? filas : sinPeso)
  const sumaPesos = filas.reduce((a, f) => a + (f.peso || 0), 0)
  const necesaria = notaNecesaria({ notas: filas, pesoRestante: pesoExamen, meta })
  const notaEscala = notaPorPuntaje({ puntaje, maximo, exigencia: exigencia / 100 })

  const [etiqueta, valor] =
    modo === 'promedio' ? ['Promedio', fmtNota(promedio)] : modo === 'necesito' ? ['Necesitas', fmtNota(necesaria)] : ['Nota', fmtNota(notaEscala)]
  useResult(etiqueta, valor)
  useShareText(
    modo === 'promedio'
      ? `Mi promedio es ${fmtNota(promedio)}`
      : modo === 'necesito'
        ? `Necesito un ${fmtNota(necesaria)} en el examen para quedar con ${formatNum(meta, 1)}`
        : `${formatNum(puntaje, 0)} de ${formatNum(maximo, 0)} puntos con ${exigencia}% de exigencia = nota ${fmtNota(notaEscala)}`,
  )

  // tabla de conversión de la escala (cada 10% del puntaje)
  const tabla = Array.from({ length: 11 }, (_, i) => {
    const pts = (maximo * i) / 10
    return { pts, nota: notaPorPuntaje({ puntaje: pts, maximo, exigencia: exigencia / 100 }) }
  })

  return (
    <>
      <div className="card">
        <Segmented
          label="Qué quieres calcular"
          value={modo}
          onChange={setModo}
          options={[
            { value: 'promedio', label: 'Mi promedio' },
            { value: 'necesito', label: '¿Qué nota necesito?' },
            { value: 'escala', label: 'Puntaje a nota' },
          ]}
        />

        {modo !== 'escala' && (
          <>
            <p className="field-label">{modo === 'necesito' ? 'Notas que ya tienes' : 'Tus notas'}</p>
            <FilasNotas filas={filas} setFilas={setFilas} conPeso={conPeso || modo === 'necesito'} />
            {modo === 'promedio' && (
              <label className="checkbox">
                <input type="checkbox" checked={conPeso} onChange={(e) => setConPeso(e.target.checked)} />
                Las notas tienen distinto porcentaje (ponderación)
              </label>
            )}
            {modo === 'necesito' && (
              <div className="form-grid spaced">
                <Field label="Porcentaje que falta (examen u otras notas)" hint={`Las notas ingresadas suman ${formatNum(sumaPesos, 0)}%`}>
                  {(id) => <NumberInput id={id} value={pesoExamen} onChange={setPesoExamen} suffix="%" />}
                </Field>
                <Field label="Nota final que quieres">
                  {(id) => (
                    <>
                      <NumberInput id={id} value={meta} onChange={setMeta} decimals={1} />
                      <Presets value={meta} onChange={setMeta} options={[4, 5, 5.5, 6].map((v) => ({ label: formatNum(v, 1), value: v }))} />
                    </>
                  )}
                </Field>
              </div>
            )}
          </>
        )}

        {modo === 'escala' && (
          <div className="form-grid">
            <Field label="Puntaje máximo de la prueba">
              {(id) => <NumberInput id={id} value={maximo} onChange={setMaximo} suffix="pts" decimals={1} />}
            </Field>
            <Field label="Exigencia para el 4,0" hint="Lo más común es 60%">
              {(id) => (
                <>
                  <NumberInput id={id} value={exigencia} onChange={setExigencia} suffix="%" />
                  <Presets value={exigencia} onChange={setExigencia} options={[50, 60, 70].map((v) => ({ label: `${v}%`, value: v }))} />
                </>
              )}
            </Field>
            <Field label="Tu puntaje">
              {(id) => <NumberInput id={id} value={puntaje} onChange={setPuntaje} suffix="pts" decimals={1} />}
            </Field>
          </div>
        )}
      </div>

      {modo === 'promedio' && (
        <div className={`card result grade-result ${estado(promedio)}`}>
          <div className="big-result">
            <span>Tu promedio</span>
            <strong>{fmtNota(promedio)}</strong>
            {promedio !== null && <small>{redondearNota(promedio) >= 4 ? 'Aprobado' : 'Bajo 4,0: reprobado'} · sin redondear {formatNum(promedio, 2)}</small>}
          </div>
          {conPeso && Math.abs(sumaPesos - 100) > 0.01 && (
            <p className="muted small">Los porcentajes suman {formatNum(sumaPesos, 0)}%: se calcula en proporción a lo ingresado.</p>
          )}
        </div>
      )}

      {modo === 'necesito' && (
        <div className={`card result grade-result ${necesaria !== null && necesaria > 7 ? 'reprobado' : 'aprobado'}`}>
          <div className="big-result">
            <span>Para quedar con {formatNum(meta, 1)} necesitas un promedio de</span>
            <strong>{necesaria === null ? '—' : necesaria <= 1 ? '1,0' : fmtNota(necesaria)}</strong>
            <small>
              {necesaria === null
                ? 'Indica cuánto porcentaje falta por evaluar.'
                : necesaria > 7
                  ? 'Ni con un 7,0 alcanzas esa nota. Revisa si hay evaluaciones recuperativas.'
                  : necesaria <= 1
                    ? '¡Ya lo tienes asegurado!'
                    : `en el ${formatNum(pesoExamen, 0)}% que falta`}
            </small>
          </div>
        </div>
      )}

      {modo === 'escala' && (
        <>
          <div className={`card result grade-result ${estado(notaEscala)}`}>
            <div className="big-result">
              <span>Tu nota</span>
              <strong>{fmtNota(notaEscala)}</strong>
              <small>Para el 4,0 se necesitan {formatNum(puntajeParaAprobar({ maximo, exigencia: exigencia / 100 }), 1)} puntos</small>
            </div>
          </div>
          <div className="card">
            <h2>Tabla de la escala</h2>
            <div className="table-wrap plain">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Puntaje</th>
                    <th className="num">Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {tabla.map((t) => (
                    <tr key={t.pts}>
                      <td>{formatNum(t.pts, 1)} pts ({formatNum((t.pts / maximo) * 100, 0)}%)</td>
                      <td className={`num ${redondearNota(t.nota) >= 4 ? 'up' : 'down'}`}><strong>{fmtNota(t.nota)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <Note>
        Escala de notas chilena de 1,0 a 7,0, con 4,0 como nota de aprobación. Las notas se redondean al décimo más cercano (3,95
        sube a 4,0), aunque algunos colegios y universidades usan otras reglas: revisa tu reglamento de evaluación.
      </Note>
    </>
  )
}
