import { useEffect, useRef, useState } from 'react'
import { CopyButton, Note, Segmented } from '../components/ui'

const OPCIONES = [
  { code: 'uf', label: 'UF' },
  { code: 'dolar', label: 'Dólar' },
  { code: 'euro', label: 'Euro' },
  { code: 'utm', label: 'UTM' },
  { code: 'ipc', label: 'IPC' },
  { code: 'libra_cobre', label: 'Cobre' },
]

function cargarScript() {
  return new Promise((resolve) => {
    if (window.tgbWidget) return resolve(window.tgbWidget)
    const s = document.createElement('script')
    s.src = '/widget.js'
    s.async = true
    s.onload = () => resolve(window.tgbWidget)
    document.body.appendChild(s)
  })
}

export default function Widget() {
  const [tema, setTema] = useState('claro')
  const [valores, setValores] = useState(['uf', 'dolar', 'euro', 'utm'])
  const preview = useRef(null)

  const codigo = `<div data-tgb-widget="indicadores" data-valores="${valores.join(',')}" data-tema="${tema}"></div>\n<script src="https://tgb.cl/widget.js" async></script>`

  useEffect(() => {
    const el = preview.current
    el.innerHTML = ''
    const box = document.createElement('div')
    box.setAttribute('data-tgb-widget', 'indicadores')
    box.setAttribute('data-valores', valores.join(','))
    box.setAttribute('data-tema', tema)
    el.appendChild(box)
    cargarScript().then((w) => w?.init())
  }, [tema, valores])

  const toggle = (code) => setValores((v) => (v.includes(code) ? v.filter((c) => c !== code) : [...v, code]))

  return (
    <>
      <div className="card">
        <h2>Personaliza el widget</h2>
        <p className="field-label">Valores que quieres mostrar</p>
        <div className="region-chips" data-cat="dinero">
          {OPCIONES.map((o) => (
            <button key={o.code} type="button" className={valores.includes(o.code) ? 'active' : ''} aria-pressed={valores.includes(o.code)} onClick={() => toggle(o.code)}>
              {o.label}
            </button>
          ))}
        </div>
        <p className="field-label">Tema</p>
        <Segmented
          label="Tema del widget"
          value={tema}
          onChange={setTema}
          options={[
            { value: 'claro', label: 'Claro' },
            { value: 'oscuro', label: 'Oscuro' },
          ]}
        />
      </div>

      <div className="widget-layout">
        <div className="card">
          <h2>Vista previa</h2>
          <div ref={preview} className="widget-preview" />
        </div>
        <div className="card">
          <h2>Código para pegar en tu sitio</h2>
          <pre className="code-block"><code>{codigo}</code></pre>
          <CopyButton text={codigo} label="Copiar código" />
        </div>
      </div>

      <Note>
        Pega el código donde quieras que aparezca el recuadro: funciona en WordPress (bloque “HTML personalizado”), Wix,
        Blogger, Shopify y cualquier página web. Es gratis, liviano (menos de 3 KB) y se actualiza solo con los valores del
        Banco Central.
      </Note>
    </>
  )
}
