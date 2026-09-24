// Post-build: genera dist/<slug>/index.html con título y descripción propios para cada
// herramienta, además de 404.html y sitemap.xml. Así GitHub Pages responde 200 en cada
// ruta y los buscadores ven metadatos correctos sin necesidad de SSR.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { SITE, TOOLS } from '../src/tools/meta.js'

const dist = new URL('../dist/', import.meta.url)
const base = readFileSync(new URL('index.html', dist), 'utf8')

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

function page({ title, description, url }) {
  return base
    .replace(/<title>.*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(description)}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(description)}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
}

for (const t of TOOLS) {
  const dir = new URL(`${t.slug}/`, dist)
  mkdirSync(dir, { recursive: true })
  writeFileSync(
    new URL('index.html', dir),
    page({ title: `${t.title} | ${SITE.name}`, description: t.description, url: `${SITE.url}/${t.slug}` }),
  )
}

// Rutas desconocidas: GitHub Pages sirve 404.html y React Router muestra "no encontrada"
writeFileSync(new URL('404.html', dist), base)

const today = new Date().toISOString().slice(0, 10)
const urls = ['', ...TOOLS.map((t) => t.slug)]
  .map((p) => `  <url><loc>${SITE.url}/${p}</loc><lastmod>${today}</lastmod></url>`)
  .join('\n')
writeFileSync(
  new URL('sitemap.xml', dist),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
)

console.log(`prerender: ${TOOLS.length} páginas + 404.html + sitemap.xml`)
