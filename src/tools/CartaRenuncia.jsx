import { useState } from 'react'
import { formatRut } from '../lib/rut'
import { toISODate, fromISODate } from '../lib/format'
import { Field, CopyButton, Note } from '../components/ui'
import { Icon } from '../components/icons'

const en30 = () => {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return toISODate(d)
}
const larga = (iso) => (iso ? fromISODate(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' }) : '________')

export default function CartaRenuncia() {
  // Los datos de la carta no se guardan en la URL ni en el navegador
  const [d, setD] = useState({
    nombre: '',
    rut: '',
    cargo: '',
    empresa: '',
    representante: '',
    ciudad: 'Santiago',
    ultimoDia: en30(),
    motivo: '',
  })
  const set = (k) => (e) => setD((x) => ({ ...x, [k]: e.target.value }))
  const hoy = new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
  const aviso = d.ultimoDia ? Math.round((fromISODate(d.ultimoDia) - new Date(new Date().toDateString())) / 86400000) : null
  const v = (x, ph) => x.trim() || ph

  const texto = `${v(d.ciudad, '[Ciudad]')}, ${hoy}

Señores
${v(d.empresa, '[Nombre de la empresa]')}
${d.representante.trim() ? `Atención: ${d.representante.trim()}\n` : ''}Presente

De mi consideración:

Por medio de la presente, yo, ${v(d.nombre, '[Nombre completo]')}, cédula de identidad N° ${d.rut ? formatRut(d.rut) : '[RUT]'}, quien me desempeño en el cargo de ${v(d.cargo, '[Cargo]')}, comunico a ustedes mi renuncia voluntaria al empleo, conforme al artículo 159 N° 2 del Código del Trabajo, la que se hará efectiva a partir del día ${larga(d.ultimoDia)}, siendo ese mi último día de trabajo.${d.motivo.trim() ? `\n\n${d.motivo.trim()}` : ''}

Agradezco la oportunidad de haber formado parte de la empresa y solicito que se me pague el finiquito con las remuneraciones y el feriado proporcional que correspondan.

Sin otro particular, saluda atentamente,



_______________________________
${v(d.nombre, '[Nombre completo]')}
RUT: ${d.rut ? formatRut(d.rut) : '[RUT]'}`

  return (
    <>
      <div className="card">
        <div className="form-grid">
          <Field label="Tu nombre completo">{(id) => <input id={id} value={d.nombre} onChange={set('nombre')} autoComplete="name" />}</Field>
          <Field label="Tu RUT">{(id) => <input id={id} value={d.rut} onChange={set('rut')} onBlur={() => d.rut && setD((x) => ({ ...x, rut: formatRut(x.rut) }))} placeholder="12.345.678-5" />}</Field>
          <Field label="Cargo">{(id) => <input id={id} value={d.cargo} onChange={set('cargo')} />}</Field>
          <Field label="Empresa">{(id) => <input id={id} value={d.empresa} onChange={set('empresa')} autoComplete="organization" />}</Field>
          <Field label="Dirigida a (opcional)" hint="Nombre de tu jefatura o de Recursos Humanos">{(id) => <input id={id} value={d.representante} onChange={set('representante')} />}</Field>
          <Field label="Ciudad">{(id) => <input id={id} value={d.ciudad} onChange={set('ciudad')} />}</Field>
          <Field label="Último día de trabajo" hint={aviso !== null ? (aviso >= 30 ? `${aviso} días de aviso` : `${aviso} días de aviso: la ley pide 30`) : ''}>
            {(id) => <input id={id} type="date" value={d.ultimoDia} onChange={set('ultimoDia')} />}
          </Field>
        </div>
        <div className="form-grid spaced">
          <Field label="Párrafo adicional (opcional)" hint="Por ejemplo, tu disposición para traspasar tus tareas">
            {(id) => <textarea id={id} rows={3} value={d.motivo} onChange={set('motivo')} />}
          </Field>
        </div>
      </div>

      <div className="card letter-card">
        <div className="letter" id="carta">{texto}</div>
        <div className="inline-actions no-print">
          <CopyButton text={texto} label="Copiar carta" />
          <button type="button" className="btn" onClick={() => window.print()}>
            <Icon name="Printer" size={16} /> Imprimir
          </button>
        </div>
      </div>

      <Note>
        La ley pide avisar al empleador con al menos 30 días de anticipación (artículo 159 N° 2 del Código del Trabajo). Para
        que la renuncia sea válida, debe estar firmada y ratificada ante un ministro de fe (inspector del trabajo, notario,
        oficial del Registro Civil o secretario municipal), o hacerse en línea con ClaveÚnica en el portal de la Dirección del
        Trabajo. Al renunciar no corresponde indemnización por años de servicio, pero sí el pago de días trabajados y
        vacaciones pendientes. Tus datos no se guardan ni se envían a ningún lugar.
      </Note>
    </>
  )
}
