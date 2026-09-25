import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useIndicadores, fetchSerie } from '../lib/indicadores'
import { formatCLP, formatNum } from '../lib/format'
import { Field, NumberInput, Note } from '../components/ui'
import { Icon } from '../components/icons'
import { SerieChart } from './Indicadores'
import { useShareText } from '../lib/share'
import { TOOLS } from './meta'

// Página "valor de hoy" para un indicador (UF, dólar, euro, UTM)
const INFO = {
  uf: { nombre: 'UF', decimals: 2, unidad: 'UF', plural: 'UF', texto: 'La Unidad de Fomento se reajusta cada día según la inflación (IPC) y se usa en arriendos, créditos hipotecarios, seguros y planes de salud.' },
  dolar: { nombre: 'dólar', decimals: 2, unidad: 'US$', plural: 'dólares', texto: 'El dólar observado lo publica el Banco Central cada día hábil con el promedio de las operaciones del día anterior. Bancos y casas de cambio usan sus propios precios de compra y venta.' },
  euro: { nombre: 'euro', decimals: 2, unidad: '€', plural: 'euros', texto: 'Valor del euro publicado por el Banco Central de Chile a partir del tipo de cambio de referencia.' },
  utm: { nombre: 'UTM', decimals: 0, unidad: 'UTM', plural: 'UTM', texto: 'La Unidad Tributaria Mensual se fija cada mes según el IPC y se usa para calcular impuestos, multas y topes legales.' },
}

const fmtFecha = (d, opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) => d.toLocaleDateString('es-CL', { timeZone: 'UTC', ...opts })

export default function ValorHoy({ tool }) {
  const code = tool?.code ?? 'uf'
  const info = INFO[code]
  const { data, get } = useIndicadores()
  const valor = get(code)
  const [serie, setSerie] = useState(null)
  const [cantidad, setCantidad] = useState(code === 'utm' ? 1 : code === 'uf' ? 1 : 100)
  const [pesos, setPesos] = useState(100_000)

  useEffect(() => {
    let alive = true
    fetchSerie(code)
      .then((s) => alive && setSerie(s))
      .catch(() => alive && setSerie([]))
    return () => {
      alive = false
    }
  }, [code])

  const fecha = data?.[code]?.fecha ? new Date(data[code].fecha) : null
  const ordenada = serie ? [...serie].reverse() : []
  const anterior = ordenada[1]?.valor
  const variacion = anterior ? (valor / anterior - 1) * 100 : null

  useShareText(`${code === 'uf' || code === 'utm' ? 'La' : 'El'} ${info.nombre} hoy: $${formatNum(valor, info.decimals)}`)

  const fechaISO = data?.[code]?.fecha
  const titulo = tool?.title ?? 'Valor'
  useEffect(() => {
    if (!fechaISO || !valor) return
    const f = fmtFecha(new Date(fechaISO), code === 'utm' ? { month: 'long', year: 'numeric' } : { day: 'numeric', month: 'long', year: 'numeric' })
    document.title = `${titulo} ${f}: $${formatNum(valor, info.decimals)} | tgb.cl`
  }, [fechaISO, valor, code, info.decimals, titulo])

  const otros = TOOLS.filter((t) => t.landing && t.slug !== tool?.slug)

  return (
    <>
      <div className="card result valor-hoy">
        <div className="big-result">
          <span>{fecha ? `Valor ${code === 'utm' ? 'de' : 'del'} ${fmtFecha(fecha, code === 'utm' ? { month: 'long', year: 'numeric' } : undefined)}` : 'Valor de hoy'}</span>
          <strong>${formatNum(valor, info.decimals)}</strong>
          {variacion !== null && Number.isFinite(variacion) && (
            <small className={variacion > 0 ? 'up' : variacion < 0 ? 'down' : ''}>
              <Icon name={variacion >= 0 ? 'ArrowUp' : 'ArrowDown'} size={13} strokeWidth={2.5} /> {formatNum(Math.abs(variacion), 2)}% respecto del valor anterior ({formatCLP(anterior)})
            </small>
          )}
        </div>
      </div>

      <div className="card">
        <h2>Convertir</h2>
        <div className="form-grid">
          <Field label={`${info.plural.charAt(0).toUpperCase()}${info.plural.slice(1)} a pesos`} hint={`= ${formatCLP(cantidad * valor)}`}>
            {(id) => <NumberInput id={id} value={cantidad} onChange={setCantidad} suffix={info.unidad} decimals={2} />}
          </Field>
          <Field label={`Pesos a ${info.plural}`} hint={`= ${formatNum(pesos / valor, info.decimals || 2)} ${info.unidad}`}>
            {(id) => <NumberInput id={id} value={pesos} onChange={setPesos} prefix="$" />}
          </Field>
        </div>
      </div>

      <SerieChart code={code} label={`${info.nombre.charAt(0).toUpperCase()}${info.nombre.slice(1)}`} />

      {ordenada.length > 1 && (
        <div className="card">
          <h2>Últimos valores</h2>
          <div className="table-wrap plain">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th className="num">Valor</th>
                  <th className="num">Variación</th>
                </tr>
              </thead>
              <tbody>
                {ordenada.slice(0, 12).map((p, i) => {
                  const prev = ordenada[i + 1]?.valor
                  const v = prev ? (p.valor / prev - 1) * 100 : null
                  return (
                    <tr key={p.fecha.toISOString()}>
                      <td className="capitalize">{fmtFecha(p.fecha, code === 'utm' ? { month: 'long', year: 'numeric' } : { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                      <td className="num"><strong>${formatNum(p.valor, info.decimals)}</strong></td>
                      <td className={`num ${v > 0 ? 'up' : v < 0 ? 'down' : ''}`}>{v === null ? '—' : `${v > 0 ? '+' : ''}${formatNum(v, 2)}%`}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Note>
        {info.texto} Fuente: Banco Central de Chile, vía mindicador.cl. Revisa también{' '}
        {otros.map((t, i) => (
          <span key={t.slug}>
            <Link to={`/${t.slug}/`}>{t.title.toLowerCase()}</Link>
            {i < otros.length - 2 ? ', ' : i === otros.length - 2 ? ' y ' : '.'}
          </span>
        ))}
      </Note>
    </>
  )
}
