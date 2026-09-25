// Post-build: genera dist/<slug>/index.html con título, descripción, imagen de vista previa y
// el texto de la guía de cada herramienta, además de 404.html y sitemap.xml. Así GitHub Pages
// responde 200 en cada ruta y los buscadores ven contenido sin necesidad de SSR.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { SITE, TOOLS } from '../src/tools/meta.js'
import { GUIDES } from '../src/tools/guides.js'

const dist = new URL('../dist/', import.meta.url)
const base = readFileSync(new URL('index.html', dist), 'utf8')

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

// Contenido estático dentro de #root: React lo reemplaza al cargar, pero los buscadores lo leen.
function staticContent(tool) {
  if (!tool) {
    return `<main class="container main"><h1>${esc(SITE.tagline)}</h1><p>${esc(SITE.description)}</p><ul>${TOOLS.map(
      (t) => `<li><a href="/${t.slug}/">${esc(t.title)}</a>: ${esc(t.short)}</li>`,
    ).join('')}</ul></main>`
  }
  const g = GUIDES[tool.slug]
  let html = `<main class="container main"><h1>${esc(tool.title)}</h1><p>${esc(tool.description)}</p>`
  if (g) {
    html += `<h2>${esc(g.titulo)}</h2>`
    if (g.pasos) html += `<ol>${g.pasos.map((p) => `<li>${esc(p)}</li>`).join('')}</ol>`
    if (g.faq) html += g.faq.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')
  }
  return `${html}<p><a href="/">Más herramientas útiles para Chile</a></p></main>`
}

function jsonLd(tool, url) {
  const items = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: tool ? tool.title : SITE.name,
      description: tool ? tool.description : SITE.description,
      url,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      inLanguage: 'es-CL',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'CLP' },
    },
  ]
  const g = tool && GUIDES[tool.slug]
  if (g?.faq?.length) {
    items.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: g.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    })
  }
  return items.map((i) => `<script type="application/ld+json">${JSON.stringify(i).replace(/</g, '\\u003c')}</script>`).join('\n    ')
}

function page(tool) {
  const title = tool ? `${tool.title} | ${SITE.name}` : `${SITE.name} · ${SITE.tagline}`
  const description = tool ? tool.description : SITE.description
  const url = tool ? `${SITE.url}/${tool.slug}/` : `${SITE.url}/`
  const image = `${SITE.url}/og/${tool ? tool.slug : 'home'}.jpg`
  const extraHead = [
    `<meta property="og:image" content="${image}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    `<meta property="og:site_name" content="${SITE.name}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    jsonLd(tool, url),
    SITE.cfAnalyticsToken
      ? `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"${SITE.cfAnalyticsToken}"}'></script>`
      : '',
  ]
    .filter(Boolean)
    .join('\n    ')

  return base
    .replace(/<title>.*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(description)}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(description)}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
    .replace('</head>', `    ${extraHead}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${staticContent(tool)}</div>`)
}

writeFileSync(new URL('index.html', dist), page(null))

for (const t of TOOLS) {
  const dir = new URL(`${t.slug}/`, dist)
  mkdirSync(dir, { recursive: true })
  writeFileSync(new URL('index.html', dir), page(t))
}

// Rutas desconocidas: GitHub Pages sirve 404.html y React Router muestra "no encontrada"
writeFileSync(
  new URL('404.html', dist),
  base.replace('</head>', '    <meta name="robots" content="noindex" />\n  </head>'),
)

const today = new Date().toISOString().slice(0, 10)
const urls = ['', ...TOOLS.map((t) => `${t.slug}/`)]
  .map((p) => `  <url><loc>${SITE.url}/${p}</loc><lastmod>${today}</lastmod></url>`)
  .join('\n')
writeFileSync(
  new URL('sitemap.xml', dist),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
)

console.log(`prerender: ${TOOLS.length} páginas + portada + 404.html + sitemap.xml${SITE.cfAnalyticsToken ? ' + analytics' : ''}`)
