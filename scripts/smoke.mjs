// Prueba de humo con un solo Chrome (Puppeteer): cada ruta debe renderizar sin errores de JavaScript,
// y se prueban las interacciones principales (búsqueda rápida, menú inferior, términos y compartir).
// Uso: npm run build && npx vite preview --port 4173 & npm run smoke
import puppeteer from 'puppeteer-core'
import { TOOLS } from '../src/tools/meta.js'

const BASE = process.env.BASE ?? 'http://localhost:4173'
const CHROME = process.env.CHROME ?? '/usr/bin/google-chrome'
const rutas = ['/', ...TOOLS.map((t) => `/${t.slug}/`), '/farmacias-de-turno/maipu/', '/bencinas/providencia/']

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-gpu'] })
const page = await browser.newPage()
// Las APIs externas no son parte de lo que se prueba: se bloquean para que la prueba sea rápida y estable
await page.setRequestInterception(true)
page.on('request', (req) => {
  const u = new URL(req.url())
  if (u.hostname === new URL(BASE).hostname) req.continue()
  else req.abort()
})

let errores = []
page.on('pageerror', (e) => errores.push(e.message))
page.on('console', (m) => {
  if (m.type() === 'error' && !/Failed to load resource|net::ERR|ERR_FAILED/.test(m.text())) errores.push(m.text())
})

let fallas = 0
const falla = (msg) => {
  fallas++
  console.log(`✗ ${msg}`)
}

for (const ruta of rutas) {
  errores = []
  let ok = true
  try {
    await page.goto(BASE + ruta, { waitUntil: 'domcontentloaded', timeout: 20000 })
    await page.waitForSelector(ruta === '/' ? '.hero' : '.tool-header', { timeout: 10000 })
    await new Promise((r) => setTimeout(r, 300))
  } catch (e) {
    ok = false
    errores.push(`no renderizó: ${e.message.split('\n')[0]}`)
  }
  if (!ok || errores.length) falla(`${ruta}\n    ${errores.join('\n    ')}`)
  else console.log(`✓ ${ruta}`)
}

// ---------- Interacciones ----------
async function prueba(nombre, fn) {
  errores = []
  try {
    await fn()
    if (errores.length) throw new Error(errores.join('; '))
    console.log(`✓ ${nombre}`)
  } catch (e) {
    falla(`${nombre}: ${e.message}`)
  }
}

await prueba('Ctrl+K abre la búsqueda y navega', async () => {
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.hero')
  await page.keyboard.down('Control')
  await page.keyboard.press('k')
  await page.keyboard.up('Control')
  await page.waitForSelector('.palette input', { timeout: 3000 })
  await page.type('.palette input', 'temblor')
  await page.keyboard.press('Enter')
  await page.waitForFunction(() => location.pathname === '/sismos/', { timeout: 5000 })
})

await prueba('Menú inferior y hoja de herramientas (celular)', async () => {
  await page.setViewport({ width: 390, height: 800, isMobile: true, hasTouch: true })
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.bottom-nav')
  const botones = await page.$$('.bottom-nav button')
  await botones[2].click() // Herramientas
  await page.waitForSelector('.sheet .sheet-list a', { timeout: 3000 })
  const n = await page.$$eval('.sheet .sheet-list a', (a) => a.length)
  if (n < 20) throw new Error(`solo ${n} herramientas en la hoja`)
  await page.click('.sheet .sheet-list a')
  await page.waitForFunction(() => !document.querySelector('.sheet'), { timeout: 3000 })
  await page.setViewport({ width: 1280, height: 900 })
})

await prueba('Término con definición se abre y se cierra', async () => {
  await page.goto(`${BASE}/sueldo-liquido/`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.term-btn')
  await page.click('.term-btn')
  await page.waitForSelector('.term-pop', { timeout: 2000 })
  await page.keyboard.press('Escape')
  await page.waitForFunction(() => !document.querySelector('.term-pop'), { timeout: 2000 })
})

await prueba('Los valores quedan en la URL al editar', async () => {
  await page.goto(`${BASE}/iva/`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.input-wrap input')
  await page.click('.input-wrap input', { clickCount: 3 })
  await page.type('.input-wrap input', '250000')
  await page.waitForFunction(() => location.search.includes('monto=250000'), { timeout: 3000 })
})

await browser.close()
console.log(fallas ? `\n${fallas} problemas` : `\nTodo OK (${rutas.length} rutas + interacciones)`)
process.exit(fallas ? 1 : 0)
