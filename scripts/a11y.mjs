// Auditoría de accesibilidad con axe-core en tema claro y oscuro.
// Uso: npx vite preview --port 4173 & node scripts/a11y.mjs [ruta ...]
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import puppeteer from 'puppeteer-core'
import { TOOLS } from '../src/tools/meta.js'

const require = createRequire(import.meta.url)
const AXE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')
const BASE = process.env.BASE ?? 'http://localhost:4173'
const CHROME = process.env.CHROME ?? '/usr/bin/google-chrome'
const rutas = process.argv.slice(2).length ? process.argv.slice(2) : ['/', ...TOOLS.map((t) => `/${t.slug}/`)]

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage()
const resumen = new Map()

for (const tema of ['light', 'dark']) {
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: tema }])
  for (const ruta of rutas) {
    await page.goto(BASE + ruta, { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {})
    await page.waitForSelector(ruta === '/' ? '.hero' : '.tool-header', { timeout: 10000 }).catch(() => {})
    await page.addScriptTag({ content: AXE })
    const res = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })
      return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) , count: v.nodes.length }))
    })
    for (const v of res) {
      const k = `${v.id}`
      const e = resumen.get(k) ?? { ...v, rutas: new Set(), total: 0 }
      e.rutas.add(`${ruta} (${tema})`)
      e.total += v.count
      resumen.set(k, e)
    }
  }
}
await browser.close()

if (!resumen.size) console.log('Sin problemas de accesibilidad detectados.')
for (const v of [...resumen.values()].sort((a, b) => b.total - a.total)) {
  console.log(`\n[${v.impact}] ${v.id}: ${v.help} (${v.total} elementos)`)
  console.log(`  ejemplos: ${v.nodes.join(' | ')}`)
  console.log(`  en: ${[...v.rutas].slice(0, 6).join(', ')}${v.rutas.size > 6 ? ` y ${v.rutas.size - 6} más` : ''}`)
}
