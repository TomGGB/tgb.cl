// Prueba de humo: abre cada ruta en Chrome headless y falla si hay errores de JavaScript
// o si la página no renderiza su título. Uso: npm run build && npx vite preview & node scripts/smoke.mjs
import { execFileSync } from 'node:child_process'
import { TOOLS } from '../src/tools/meta.js'

const BASE = process.env.BASE ?? 'http://localhost:4173'
const chrome = process.env.CHROME ?? 'google-chrome'
const rutas = ['/', ...TOOLS.map((t) => `/${t.slug}/`)]
let fallas = 0

for (const ruta of rutas) {
  let dom = ''
  let log = ''
  try {
    dom = execFileSync(chrome, ['--headless=new', '--disable-gpu', '--no-sandbox', '--enable-logging=stderr', '--v=0', '--virtual-time-budget=5000', '--dump-dom', BASE + ruta], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 60000,
    })
  } catch (e) {
    dom = e.stdout ?? ''
    log = e.stderr ?? ''
  }
  const errores = (log.match(/CONSOLE.*(Uncaught|Error)[^\n]*/g) ?? []).filter((l) => !/Failed to load resource|net::ERR/.test(l))
  const tool = TOOLS.find((t) => `/${t.slug}/` === ruta)
  // tras renderizar React, el título aparece dentro de un <h1> generado por la app (con la clase tool-header o hero)
  const renderizo = tool ? dom.includes('class="tool-header"') : dom.includes('class="hero"')
  const ok = renderizo && errores.length === 0
  if (!ok) fallas++
  console.log(`${ok ? '✓' : '✗'} ${ruta}${renderizo ? '' : ' (no renderizó)'}${errores.length ? `\n    ${errores.join('\n    ')}` : ''}`)
}
console.log(fallas ? `\n${fallas} rutas con problemas` : `\nTodas las rutas (${rutas.length}) OK`)
process.exit(fallas ? 1 : 0)
