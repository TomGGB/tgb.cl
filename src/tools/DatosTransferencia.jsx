import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { formatRut, validateRut } from '../lib/rut'
import { formatCLP } from '../lib/format'
import { Field, NumberInput, CopyButton, Note } from '../components/ui'
import { Icon } from '../components/icons'
import { whatsappUrl } from '../lib/share'

const BANCOS = [
  'BancoEstado', 'Banco de Chile', 'Banco Santander', 'Banco BCI', 'Scotiabank', 'Banco Itaú', 'Banco BICE',
  'Banco Security', 'Banco Falabella', 'Banco Ripley', 'Banco Consorcio', 'Banco Internacional', 'Coopeuch',
  'Tenpo', 'Mercado Pago', 'MACH', 'Prepago Los Héroes', 'Tapp (Caja Los Andes)', 'Otro',
]
const TIPOS = ['Cuenta corriente', 'Cuenta vista / CuentaRUT', 'Cuenta de ahorro', 'Cuenta digital']
const KEY = 'datos-transferencia:v1'

const vacio = { nombre: '', rut: '', banco: 'BancoEstado', otroBanco: '', tipo: 'Cuenta vista / CuentaRUT', numero: '', email: '' }

function leerGuardado() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY))
    return v ? { ...vacio, ...v } : null
  } catch {
    return null
  }
}

export default function DatosTransferencia() {
  const guardado = leerGuardado()
  const [d, setD] = useState(guardado ?? vacio)
  const [recordar, setRecordar] = useState(!!guardado)
  const [monto, setMonto] = useState(0)
  const [asunto, setAsunto] = useState('')
  const [qr, setQr] = useState('')
  const set = (k) => (e) => setD((x) => ({ ...x, [k]: e.target.value }))

  const banco = d.banco === 'Otro' ? d.otroBanco || 'Otro banco' : d.banco
  const lineas = [
    d.nombre && `Nombre: ${d.nombre}`,
    d.rut && `RUT: ${formatRut(d.rut)}`,
    `Banco: ${banco}`,
    `Tipo de cuenta: ${d.tipo}`,
    d.numero && `N° de cuenta: ${d.numero}`,
    d.email && `Correo: ${d.email}`,
    monto > 0 && `Monto: ${formatCLP(monto)}`,
    asunto && `Asunto: ${asunto}`,
  ].filter(Boolean)
  const texto = lineas.join('\n')
  const completo = d.nombre && d.rut && d.numero
  const rutMalo = d.rut.replace(/[^0-9kK]/g, '').length >= 2 && !validateRut(d.rut)

  // Guardar en este dispositivo solo si la persona lo pide
  useEffect(() => {
    try {
      if (recordar) localStorage.setItem(KEY, JSON.stringify(d))
      else localStorage.removeItem(KEY)
    } catch {
      /* sin almacenamiento */
    }
  }, [d, recordar])

  useEffect(() => {
    let vivo = true
    QRCode.toDataURL(texto || ' ', { margin: 1, width: 480, errorCorrectionLevel: 'M' })
      .then((url) => vivo && setQr(url))
      .catch(() => vivo && setQr(''))
    return () => {
      vivo = false
    }
  }, [texto])

  return (
    <>
      <div className="card">
        <div className="form-grid">
          <Field label="Nombre del titular">{(id) => <input id={id} value={d.nombre} onChange={set('nombre')} autoComplete="name" />}</Field>
          <Field label="RUT" hint={rutMalo ? 'Revisa el RUT: el dígito verificador no coincide' : ''}>
            {(id) => (
              <input id={id} value={d.rut} className={rutMalo ? 'invalid' : ''} onChange={set('rut')} onBlur={() => d.rut && setD((x) => ({ ...x, rut: formatRut(x.rut) }))} placeholder="12.345.678-5" />
            )}
          </Field>
          <Field label="Banco">
            {(id) => (
              <select id={id} value={d.banco} onChange={set('banco')}>
                {BANCOS.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            )}
          </Field>
          {d.banco === 'Otro' && <Field label="Nombre del banco">{(id) => <input id={id} value={d.otroBanco} onChange={set('otroBanco')} />}</Field>}
          <Field label="Tipo de cuenta">
            {(id) => (
              <select id={id} value={d.tipo} onChange={set('tipo')}>
                {TIPOS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Número de cuenta">{(id) => <input id={id} value={d.numero} onChange={set('numero')} inputMode="numeric" autoComplete="off" />}</Field>
          <Field label="Correo para el aviso">{(id) => <input id={id} type="email" value={d.email} onChange={set('email')} autoComplete="email" />}</Field>
        </div>
        <div className="form-grid spaced">
          <Field label="Monto a cobrar (opcional)">{(id) => <NumberInput id={id} value={monto} onChange={setMonto} prefix="$" />}</Field>
          <Field label="Asunto (opcional)" hint="Por ejemplo: cuota del asado">{(id) => <input id={id} value={asunto} onChange={(e) => setAsunto(e.target.value)} />}</Field>
        </div>
        <label className="checkbox">
          <input type="checkbox" checked={recordar} onChange={(e) => setRecordar(e.target.checked)} />
          <span>Recordar mis datos en este dispositivo (no se envían a ningún lado)</span>
        </label>
      </div>

      <div className="card result transfer-card">
        <div className="transfer-layout">
          <pre className="transfer-text">{texto}</pre>
          {qr && <img src={qr} alt="Código QR con los datos de transferencia" className="transfer-qr" width="200" height="200" />}
        </div>
        {!completo && <p className="muted small">Completa nombre, RUT y número de cuenta para que quien te transfiera tenga todo lo necesario.</p>}
        <div className="inline-actions">
          <CopyButton text={texto} label="Copiar datos" />
          <a className="btn-ghost" href={whatsappUrl(texto, '')} target="_blank" rel="noreferrer">
            <Icon name="Phone" size={15} /> Enviar por WhatsApp
          </a>
          {qr && (
            <a className="btn-ghost" href={qr} download="datos-transferencia-qr.png">
              <Icon name="Download" size={15} /> Descargar QR
            </a>
          )}
        </div>
      </div>

      <Note>
        Tus datos no salen de tu teléfono o computador: no se guardan en el enlace ni en ningún servidor. El código QR contiene
        el mismo texto, para que la otra persona lo lea con la cámara y lo copie. Nunca compartas claves, códigos de tu tarjeta
        de coordenadas ni códigos que te lleguen por SMS.
      </Note>
    </>
  )
}
