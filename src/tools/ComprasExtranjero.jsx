import { useIndicadores } from '../lib/indicadores'
import { costoImportacion } from '../lib/laboral'
import { formatCLP, formatNum } from '../lib/format'
import { Field, NumberInput, Segmented, ResultTable, Note } from '../components/ui'
import { useUrlState } from '../lib/useUrlState'
import { useShareText } from '../lib/share'

const CASOS = {
  plataforma: {
    titulo: 'Pagas solo IVA, al momento de comprar',
    texto: 'Compras de hasta USD 500 en plataformas inscritas en el SII (AliExpress, Temu, Shein, Amazon y otras) pagan 19% de IVA en el carrito y no pagan arancel.',
  },
  'aduana-bajo': {
    titulo: 'Pagas IVA y arancel al llegar el paquete',
    texto: 'Si la tienda no está inscrita en el SII y no cobró el IVA, al llegar el envío pagas IVA y arancel aduanero para retirarlo.',
  },
  aduana: {
    titulo: 'Importación sobre USD 500: arancel e IVA',
    texto: 'Sobre USD 500 se paga arancel de 6% sobre el valor con envío (CIF) e IVA de 19% sobre ese total. Sobre USD 1.000 se requiere agente de aduana.',
  },
}

export default function ComprasExtranjero() {
  const { get } = useIndicadores()
  const dolar = get('dolar')
  const [producto, setProducto] = useUrlState('usd', 80)
  const [envio, setEnvio] = useUrlState('envio', 0)
  const [inscrita, setInscrita] = useUrlState('inscrita', 'si')

  const r = costoImportacion({ productoUSD: producto, envioUSD: envio, plataformaInscrita: inscrita === 'si', dolar })
  const caso = CASOS[r.caso]

  useShareText(`Compra de US$ ${formatNum(r.cif, 2)} en el extranjero: pagas ${formatCLP(r.totalCLP)} con impuestos`)

  return (
    <>
      <div className="card">
        <div className="form-grid">
          <Field label="Precio del producto" hint="Sin IVA, tal como aparece antes de pagar">
            {(id) => <NumberInput id={id} value={producto} onChange={setProducto} prefix="US$" decimals={2} />}
          </Field>
          <Field label="Envío" hint="0 si el envío es gratis">
            {(id) => <NumberInput id={id} value={envio} onChange={setEnvio} prefix="US$" decimals={2} />}
          </Field>
        </div>
        {r.cif <= 500 && (
          <>
            <p className="field-label">¿La tienda cobra el IVA al pagar?</p>
            <Segmented
              label="La tienda cobra IVA"
              value={inscrita}
              onChange={setInscrita}
              options={[
                { value: 'si', label: 'Sí, está inscrita en el SII' },
                { value: 'no', label: 'No lo cobra' },
              ]}
            />
          </>
        )}
      </div>

      <div className="card result">
        <div className="big-result">
          <span>Total a pagar</span>
          <strong>{formatCLP(r.totalCLP)}</strong>
          <small>US$ {formatNum(r.totalUSD, 2)} con dólar a {formatCLP(dolar)} · {formatNum(r.recargo * 100, 1)}% de impuestos</small>
        </div>
        <ResultTable
          rows={[
            { label: 'Producto + envío', value: `US$ ${formatNum(r.cif, 2)}` },
            r.arancelUSD > 0 && { label: 'Arancel aduanero (6%)', value: `US$ ${formatNum(r.arancelUSD, 2)}` },
            { label: 'IVA (19%)', value: `US$ ${formatNum(r.ivaUSD, 2)}` },
            { label: 'Total en dólares', value: `US$ ${formatNum(r.totalUSD, 2)}` },
            { label: 'Total en pesos', value: formatCLP(r.totalCLP), strong: true },
          ]}
        />
        <p className="small"><strong>{caso.titulo}.</strong> <span className="muted">{caso.texto}</span></p>
      </div>

      <Note>
        Reglas vigentes desde el 25 de octubre de 2025 (Ley 21.713). La exención de arancel en compras de hasta USD 500 aplica
        a personas que compran de forma ocasional. Productos con origen en países con tratado de libre comercio (como China o
        Estados Unidos) pueden no pagar arancel si se presenta el certificado de origen. El banco puede cobrar además una
        comisión por compras en moneda extranjera. Más información en aduana.cl y sii.cl.
      </Note>
    </>
  )
}
