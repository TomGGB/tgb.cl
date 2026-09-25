// Genera las imágenes de vista previa (Open Graph, 1200×630) de cada herramienta en public/og/.
// Requiere Google Chrome instalado. Uso: npm run og
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as lucide from 'lucide-react'
import { TOOLS, CATEGORIES } from '../src/tools/meta.js'

// Colores de categoría (mismos valores que --cat-* en styles.css, tema claro)
const CAT_COLOR = { dinero: '#2f7d57', trabajo: '#1f4e8c', hogar: '#b25e12', vivo: '#c8102e', calendario: '#6b4fa0', tramites: '#0e7c86' }
const svg = (name, color) => renderToStaticMarkup(createElement(lucide[name], { size: 76, color, strokeWidth: 1.8 }))

const out = new URL('../public/og/', import.meta.url)
mkdirSync(out, { recursive: true })
const tmp = join(tmpdir(), `og-${process.pid}`)
mkdirSync(tmp, { recursive: true })
const chrome = process.env.CHROME ?? 'google-chrome'
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const FONT_TEXT = new URL('../node_modules/@fontsource-variable/public-sans/files/public-sans-latin-wght-normal.woff2', import.meta.url).href
const FONT_DISPLAY = new URL('../node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2', import.meta.url).href

function html({ icon, title, subtitle, eyebrow, color }) {
  const size = title.length > 34 ? 62 : title.length > 26 ? 68 : 78
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face { font-family: 'Texto'; src: url('${FONT_TEXT}') format('woff2'); font-weight: 100 900; }
  @font-face { font-family: 'Titulo'; src: url('${FONT_DISPLAY}') format('woff2'); font-weight: 200 800; }
  *{margin:0;box-sizing:border-box}
  body{width:1200px;height:630px;font-family:'Texto',system-ui,sans-serif;background:#10233f;color:#f4f7fb;position:relative;overflow:hidden}
  .flag{position:absolute;inset:0 0 auto;height:10px;background:linear-gradient(90deg,#1f4e8c 0 33%,#fff 33% 66%,#c8102e 66%)}
  .wrap{position:absolute;inset:70px 80px 56px;display:flex;flex-direction:column}
  .top{display:flex;align-items:center;gap:22px}
  .icon{width:124px;height:124px;border-radius:30px;display:grid;place-items:center;background:#fff}
  .eyebrow{font-size:30px;font-weight:700;color:#9fb2cc}
  h1{font-family:'Titulo';font-size:${size}px;line-height:1.04;letter-spacing:-.03em;max-width:1000px;margin-top:40px;font-weight:800}
  p{font-size:31px;line-height:1.3;color:#c9d5e6;margin-top:18px;max-width:920px}
  .brand{font-family:'Titulo';margin-top:auto;display:flex;align-items:center;gap:14px;font-size:40px;font-weight:800;letter-spacing:-.03em}
  .brand span{color:#ff8a95}
  .mark{width:40px;height:40px;border-radius:10px;overflow:hidden;display:grid;grid-template-rows:1fr 1fr}
  .mark i:first-child{background:linear-gradient(90deg,#1f4e8c 42%,#fff 42%)}.mark i:last-child{background:#c8102e}
  </style></head><body>
  <div class="flag"></div>
  <div class="wrap">
    <div class="top"><div class="icon">${svg(icon, color)}</div><div class="eyebrow">${esc(eyebrow)}</div></div>
    <h1>${esc(title)}</h1>
    <p>${esc(subtitle)}</p>
    <div class="brand"><div class="mark"><i></i><i></i></div><div>tgb<span>.cl</span></div></div>
  </div>
  </body></html>`
}

function shot(name, data) {
  const file = join(tmp, `${name}.html`)
  writeFileSync(file, html(data))
  execFileSync(chrome, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--window-size=1200,630', `--screenshot=${new URL(`${name}.jpg`, out).pathname}`, `file://${file}`,
  ], { stdio: 'ignore' })
}

shot('home', { icon: 'Landmark', color: '#1f4e8c', title: 'Calculadoras y datos útiles para Chile', subtitle: `${TOOLS.length} herramientas gratis: sueldo líquido, UF, feriados, bencinas, sismos y más.`, eyebrow: 'Hoy en Chile' })
for (const t of TOOLS) {
  const cat = CATEGORIES.find((c) => c.id === t.category)?.name ?? ''
  shot(t.slug, { icon: t.icon, color: CAT_COLOR[t.category], title: t.title, subtitle: t.short, eyebrow: cat })
  process.stdout.write('.')
}
rmSync(tmp, { recursive: true, force: true })
console.log(`\nog: ${TOOLS.length + 1} imágenes en public/og/`)
