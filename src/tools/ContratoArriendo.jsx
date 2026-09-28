import { useState } from 'react'
import { formatRut } from '../lib/rut'
import { formatCLP, toISODate, fromISODate } from '../lib/format'
import { Field, NumberInput, CopyButton, Note } from '../components/ui'
import { Icon } from '../components/icons'

const larga = (iso) => (iso ? fromISODate(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' }) : '________')

export default function ContratoArriendo() {
  // Los datos no se guardan en la URL ni en el navegador
  const [d, setD] = useState({
    ciudad: 'Santiago',
    arrendador: '',
    rutArrendador: '',
    domArrendador: '',
    arrendatario: '',
    rutArrendatario: '',
    domArrendatario: '',
    direccion: '',
    comuna: '',
    inicio: toISODate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)),
    meses: 12,
    renta: 500_000,
    diaPago: 5,
    garantia: 500_000,
    reajuste: 'semestral',
    banco: '',
  })
  const set = (k) => (e) => setD((x) => ({ ...x, [k]: e.target.value }))
  const setN = (k) => (v) => setD((x) => ({ ...x, [k]: v }))
  const v = (x, ph) => String(x ?? '').trim() || ph
  const rut = (x) => (x ? formatRut(x) : '[RUT]')
  const reajusteTxt = {
    semestral: 'La renta se reajustará cada seis meses según la variación del Índice de Precios al Consumidor (IPC) del período.',
    anual: 'La renta se reajustará cada doce meses según la variación del Índice de Precios al Consumidor (IPC) del período.',
    uf: 'La renta se fija en su equivalente en Unidades de Fomento a la fecha de este contrato y se pagará en pesos según el valor de la UF del día de pago.',
    no: 'La renta no tendrá reajuste durante la vigencia del contrato.',
  }[d.reajuste]

  const texto = `CONTRATO DE ARRENDAMIENTO

En ${v(d.ciudad, '[Ciudad]')}, a ${larga(toISODate(new Date()))}, comparecen:

Don(ña) ${v(d.arrendador, '[Nombre del arrendador]')}, cédula de identidad N° ${rut(d.rutArrendador)}, con domicilio en ${v(d.domArrendador, '[Domicilio del arrendador]')}, en adelante "el arrendador"; y

Don(ña) ${v(d.arrendatario, '[Nombre del arrendatario]')}, cédula de identidad N° ${rut(d.rutArrendatario)}, con domicilio en ${v(d.domArrendatario, '[Domicilio del arrendatario]')}, en adelante "el arrendatario";

quienes acuerdan el siguiente contrato de arrendamiento:

PRIMERO. Propiedad. El arrendador da en arriendo al arrendatario el inmueble ubicado en ${v(d.direccion, '[Dirección]')}, comuna de ${v(d.comuna, '[Comuna]')}, que el arrendatario destinará exclusivamente a vivienda.

SEGUNDO. Plazo. El arriendo comienza el ${larga(d.inicio)} y dura ${d.meses} meses. Se renovará automáticamente por períodos iguales si ninguna de las partes avisa su término por carta certificada con al menos 60 días de anticipación al vencimiento.

TERCERO. Renta. La renta mensual es de ${formatCLP(d.renta)}, que se pagará por mes anticipado dentro de los primeros ${d.diaPago} días de cada mes${d.banco.trim() ? `, mediante transferencia a la cuenta ${d.banco.trim()}` : ''}. ${reajusteTxt}

CUARTO. Garantía. El arrendatario entrega en este acto la suma de ${formatCLP(d.garantia)} como garantía, que el arrendador devolverá dentro de los 30 días siguientes a la restitución del inmueble, descontando los daños o deudas que correspondan. La garantía no podrá imputarse al pago de la última renta.

QUINTO. Gastos y servicios. Serán de cargo del arrendatario los consumos de luz, agua, gas y gastos comunes ordinarios. Serán de cargo del arrendador las contribuciones y las reparaciones necesarias que no se deban a mal uso.

SEXTO. Cuidado de la propiedad. El arrendatario mantendrá el inmueble en buen estado y no podrá subarrendarlo ni hacer modificaciones sin autorización escrita del arrendador. Al término del contrato lo restituirá en el mismo estado en que lo recibe, salvo el desgaste por el uso normal.

SÉPTIMO. Término anticipado. El no pago de la renta en el plazo acordado, así como el incumplimiento grave de las obligaciones de este contrato, dará derecho al arrendador a ponerle término conforme a la ley.

OCTAVO. Domicilio. Para todos los efectos legales, las partes fijan domicilio en la comuna de ${v(d.comuna, '[Comuna]')}.

Se firma en dos ejemplares del mismo tenor, quedando uno en poder de cada parte.



_______________________________          _______________________________
${v(d.arrendador, 'Arrendador')}${' '.repeat(Math.max(4, 41 - v(d.arrendador, 'Arrendador').length))}${v(d.arrendatario, 'Arrendatario')}
RUT: ${rut(d.rutArrendador)}${' '.repeat(Math.max(4, 36 - rut(d.rutArrendador).length))}RUT: ${rut(d.rutArrendatario)}`

  return (
    <>
      <div className="card">
        <h2>Partes</h2>
        <div className="form-grid">
          <Field label="Nombre del arrendador">{(id) => <input id={id} value={d.arrendador} onChange={set('arrendador')} />}</Field>
          <Field label="RUT del arrendador">{(id) => <input id={id} value={d.rutArrendador} onChange={set('rutArrendador')} />}</Field>
          <Field label="Domicilio del arrendador">{(id) => <input id={id} value={d.domArrendador} onChange={set('domArrendador')} />}</Field>
          <Field label="Nombre del arrendatario">{(id) => <input id={id} value={d.arrendatario} onChange={set('arrendatario')} />}</Field>
          <Field label="RUT del arrendatario">{(id) => <input id={id} value={d.rutArrendatario} onChange={set('rutArrendatario')} />}</Field>
          <Field label="Domicilio actual del arrendatario">{(id) => <input id={id} value={d.domArrendatario} onChange={set('domArrendatario')} />}</Field>
        </div>
        <h2 className="section-title">Propiedad y condiciones</h2>
        <div className="form-grid">
          <Field label="Dirección de la propiedad">{(id) => <input id={id} value={d.direccion} onChange={set('direccion')} />}</Field>
          <Field label="Comuna">{(id) => <input id={id} value={d.comuna} onChange={set('comuna')} />}</Field>
          <Field label="Ciudad de firma">{(id) => <input id={id} value={d.ciudad} onChange={set('ciudad')} />}</Field>
          <Field label="Inicio del arriendo">{(id) => <input id={id} type="date" value={d.inicio} onChange={set('inicio')} />}</Field>
          <Field label="Duración">{(id) => <NumberInput id={id} value={d.meses} onChange={setN('meses')} suffix="meses" />}</Field>
          <Field label="Renta mensual">{(id) => <NumberInput id={id} value={d.renta} onChange={setN('renta')} prefix="$" />}</Field>
          <Field label="Pagar dentro de los primeros">{(id) => <NumberInput id={id} value={d.diaPago} onChange={setN('diaPago')} suffix="días" />}</Field>
          <Field label="Garantía">{(id) => <NumberInput id={id} value={d.garantia} onChange={setN('garantia')} prefix="$" />}</Field>
          <Field label="Reajuste">
            {(id) => (
              <select id={id} value={d.reajuste} onChange={set('reajuste')}>
                <option value="semestral">IPC cada 6 meses</option>
                <option value="anual">IPC cada 12 meses</option>
                <option value="uf">Renta en UF</option>
                <option value="no">Sin reajuste</option>
              </select>
            )}
          </Field>
          <Field label="Cuenta para el pago (opcional)" hint="Banco, tipo y número de cuenta">{(id) => <input id={id} value={d.banco} onChange={set('banco')} />}</Field>
        </div>
      </div>

      <div className="card letter-card">
        <div className="letter">{texto}</div>
        <div className="inline-actions no-print">
          <CopyButton text={texto} label="Copiar contrato" />
          <button type="button" className="btn" onClick={() => window.print()}>
            <Icon name="Printer" size={16} /> Imprimir
          </button>
        </div>
      </div>

      <Note>
        Modelo básico y referencial de arriendo de vivienda: revísalo y adáptalo a tu caso. Se recomienda firmarlo ante notario,
        junto con un inventario y fotos del estado de la propiedad: un contrato escrito y con firmas autorizadas facilita cobrar
        rentas impagas y recuperar la propiedad por la vía judicial. Para contratos complejos, consulta a un abogado. Tus datos no
        se guardan ni se envían a ningún lugar.
      </Note>
    </>
  )
}
