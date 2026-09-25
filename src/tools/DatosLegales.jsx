import { Link } from 'react-router-dom'
import { useIndicadores } from '../lib/indicadores'
import { AFPS, PARAMS, gratificacionArt50 } from '../lib/sueldo'
import { pensionAlimentos } from '../lib/calculos'
import { formatCLP, formatNum } from '../lib/format'
import { Note } from '../components/ui'
import { Term } from '../components/ux'

// Tramos mensuales del impuesto único (UTM), mismos valores que src/lib/sueldo.js
const TRAMOS = [
  [0, 13.5, 0],
  [13.5, 30, 4],
  [30, 50, 8],
  [50, 70, 13.5],
  [70, 90, 23],
  [90, 120, 30.4],
  [120, 310, 35],
  [310, null, 40],
]

function Tabla({ filas }) {
  return (
    <dl className="result-table">
      {filas.map(([label, valor, nota]) => (
        <div key={typeof label === 'string' ? label : label.key}>
          <dt>
            {label}
            {nota && <span className="dt-note">{nota}</span>}
          </dt>
          <dd>{valor}</dd>
        </div>
      ))}
    </dl>
  )
}

export default function DatosLegales() {
  const { get } = useIndicadores()
  const uf = get('uf')
  const utm = get('utm')
  const grat = gratificacionArt50(Infinity)
  const pa1 = pensionAlimentos({ hijos: 1 })
  const pa2 = pensionAlimentos({ hijos: 2 })

  return (
    <>
      <section className="card">
        <h2>Remuneraciones</h2>
        <Tabla
          filas={[
            ['Ingreso mínimo mensual (18 a 65 años)', formatCLP(PARAMS.imm), 'Desde el 1 de mayo de 2026'],
            ['Ingreso mínimo (menores de 18 y mayores de 65)', formatCLP(412_938)],
            ['Jornada laboral máxima', `${PARAMS.jornada} horas semanales`, 'Desde el 26 de abril de 2026; 40 horas desde abril de 2028'],
            [<span key="grat">Tope de la <Term k="gratificacion">gratificación</Term> legal</span>, `${formatCLP(grat.tope)} al mes`, '4,75 ingresos mínimos al año'],
            ['Recargo de horas extra', '50% mínimo'],
          ]}
        />
      </section>

      <section className="card">
        <h2>Cotizaciones</h2>
        <Tabla
          filas={[
            [<span key="tope"><Term>Tope imponible</Term> AFP y salud</span>, `${formatNum(PARAMS.topeImponibleUF, 1)} UF (${formatCLP(PARAMS.topeImponibleUF * uf)})`],
            ['Tope imponible seguro de cesantía', `${formatNum(PARAMS.topeCesantiaUF, 1)} UF (${formatCLP(PARAMS.topeCesantiaUF * uf)})`],
            ['Cotización AFP', '10% + comisión'],
            ['Salud (Fonasa o mínimo Isapre)', '7%'],
            ['Seguro de cesantía (trabajador, contrato indefinido)', '0,6%'],
          ]}
        />
        <h3>Comisiones de las AFP</h3>
        <ul className="simple-list">
          {AFPS.map((a) => (
            <li key={a.name}>
              <span>AFP {a.name}</span>
              <strong>{formatNum(a.comision * 100, 2)}%</strong>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Impuestos</h2>
        <Tabla
          filas={[
            ['IVA', '19%'],
            ['Retención de boletas de honorarios 2026', `${formatNum(PARAMS.retencionHonorarios * 100, 2)}%`, '16% en 2027 y 17% en 2028'],
            ['APV régimen A: bonificación', '15%, tope 6 UTM al año'],
            ['APV régimen B: tope', '50 UF al mes (600 UF al año)'],
          ]}
        />
        <h3>Tramos del <Term>impuesto único</Term> (mensual)</h3>
        <div className="table-wrap plain">
          <table className="data-table">
            <thead>
              <tr>
                <th>Base tributable mensual</th>
                <th className="num">Tasa</th>
              </tr>
            </thead>
            <tbody>
              {TRAMOS.map(([desde, hasta, tasa]) => (
                <tr key={desde}>
                  <td>
                    {hasta === null
                      ? `Más de ${formatCLP(desde * utm)}`
                      : `${desde === 0 ? 'Hasta' : `De ${formatCLP(desde * utm)} a`} ${formatCLP(hasta * utm)}`}
                    <span className="dt-note">{hasta === null ? `más de ${desde} UTM` : `${desde} a ${hasta} UTM`}</span>
                  </td>
                  <td className="num"><strong>{tasa === 0 ? 'Exento' : `${formatNum(tasa, 1)}%`}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2>Familia</h2>
        <Tabla
          filas={[
            ['Pensión de alimentos mínima, un hijo', formatCLP(pa1.porHijo), '40% del ingreso mínimo'],
            ['Pensión de alimentos mínima, dos o más hijos', `${formatCLP(pa2.porHijo)} por hijo`, '30% del ingreso mínimo por hijo'],
            ['Tope total de las pensiones', '50% de los ingresos del alimentante'],
          ]}
        />
      </section>

      <Note>
        Valores vigentes en 2026 con UF {formatCLP(uf)} y UTM {formatCLP(utm)} de hoy. Los montos en pesos de los topes y tramos
        cambian con la UF y la UTM. ¿Quieres aplicarlos a tu caso? Usa la <Link to="/sueldo-liquido/">calculadora de sueldo
        líquido</Link>.
      </Note>
    </>
  )
}
