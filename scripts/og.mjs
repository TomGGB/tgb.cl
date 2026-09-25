// Genera las imágenes de vista previa (Open Graph, 1200×630) de cada herramienta en public/og/.
// Requiere Google Chrome instalado. Uso: npm run og
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { SITE, TOOLS, CATEGORIES } from '../src/tools/meta.js'

const out = new URL('../public/og/', import.meta.url)
mkdirSync(out, { recursive: true })
const tmp = join(tmpdir(), `og-${process.pid}`)
mkdirSync(tmp, { recursive: true })
const chrome = process.env.CHROME ?? 'google-chrome'
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')

function html({ icon, title, subtitle, eyebrow }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;box-sizing:border-box}
  body{width:1200px;height:630px;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
    background:linear-gradient(135deg,#0b3a82 0%,#0f4aa3 60%,#1a5bc0 100%);color:#fff;position:relative;overflow:hidden}
  .flag{position:absolute;right:-60px;bottom:-60px;width:420px;height:420px;border-radius:64px;overflow:hidden;opacity:.18;transform:rotate(-12deg)}
  .flag div{height:50%}.flag .t{background:linear-gradient(90deg,#0b3a82 45%,#fff 45%)}.flag .b{background:#d52b1e}
  .wrap{position:absolute;inset:64px 80px 52px;display:flex;flex-direction:column}
  .eyebrow{font-size:28px;font-weight:600;opacity:.8;letter-spacing:.04em;text-transform:uppercase}
  .icon{font-size:100px;line-height:1;margin:28px 0 20px}
  h1{font-size:${title.length > 34 ? 60 : title.length > 26 ? 66 : 76}px;line-height:1.05;letter-spacing:-.02em;max-width:980px}
  p{font-size:30px;line-height:1.3;opacity:.9;margin-top:16px;max-width:900px}
  .brand{margin-top:auto;font-size:40px;font-weight:800;letter-spacing:-.02em}
  .brand span{color:#ff8a80}
  </style></head><body>
  <div class="flag"><div class="t"></div><div class="b"></div></div>
  <div class="wrap">
    <div class="eyebrow">${esc(eyebrow)}</div>
    <div class="icon">${icon}</div>
    <h1>${esc(title)}</h1>
    <p>${esc(subtitle)}</p>
    <div class="brand">tgb<span>.cl</span></div>
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

shot('home', { icon: '🇨🇱', title: SITE.tagline, subtitle: `${TOOLS.length} herramientas gratis: sueldo líquido, UF, feriados, bencinas, sismos y más.`, eyebrow: 'tgb.cl' })
for (const t of TOOLS) {
  const cat = CATEGORIES.find((c) => c.id === t.category)?.name ?? ''
  shot(t.slug, { icon: t.icon, title: t.title, subtitle: t.short, eyebrow: cat })
  process.stdout.write('.')
}
rmSync(tmp, { recursive: true, force: true })
console.log(`\nog: ${TOOLS.length + 1} imágenes en public/og/`)
