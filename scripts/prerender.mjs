// Post-build: genera dist/<slug>/index.html con título, descripción, imagen de vista previa y
// el texto de la guía de cada herramienta, además de 404.html y sitemap.xml. Así GitHub Pages
// responde 200 en cada ruta y los buscadores ven contenido sin necesidad de SSR.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { SITE, TOOLS } from '../src/tools/meta.js'
import { GUIDES } from '../src/tools/guides.js'
import { slugify } from '../src/lib/slug.js'

const dist = new URL('../dist/', import.meta.url)
const base = readFileSync(new URL('index.html', dist), 'utf8')

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

// Valores del día para las páginas "UF hoy", "Dólar hoy", etc. Si la API falla, se usan textos genéricos.
const NOMBRE = { uf: 'UF', dolar: 'dólar', euro: 'euro', utm: 'UTM' }
const DEC = { uf: 2, dolar: 2, euro: 2, utm: 0 }
const num = (n, d) => n.toLocaleString('es-CL', { minimumFractionDigits: d, maximumFractionDigits: d })
const fechaLarga = (iso, utm) =>
  new Date(iso).toLocaleDateString('es-CL', utm ? { timeZone: 'UTC', month: 'long', year: 'numeric' } : { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

async function seriesDelDia() {
  const out = {}
  for (const code of Object.keys(NOMBRE)) {
    try {
      const r = await fetch(`https://mindicador.cl/api/${code}`, { signal: AbortSignal.timeout(20000) })
      const j = await r.json()
      if (j.serie?.length) out[code] = j.serie.slice(0, 10)
    } catch {
      /* sin datos: la página queda con textos genéricos */
    }
  }
  return out
}
const SERIES = await seriesDelDia()

// ---------- Páginas por comuna (textos iguales a POR_COMUNA en src/lib/comunas.js) ----------
const REGIONES = JSON.parse(readFileSync(new URL('../src/data/regiones.json', import.meta.url), 'utf8'))
const COMUNAS = REGIONES.flatMap((r) => r.comunas.map((c) => ({ nombre: c.nombre, slug: slugify(c.nombre), region: r.nombre, regionId: r.id })))
const POR_COMUNA = {
  'farmacias-de-turno': {
    titulo: (c) => `Farmacias de turno en ${c.nombre}`,
    descripcion: (c) => `Farmacias de turno hoy en ${c.nombre}, región ${c.region}: dirección, horario, teléfono y mapa, con datos oficiales del MINSAL.`,
    cuerpo: (c) =>
      `Revisa qué farmacia está de turno hoy en ${c.nombre} con su dirección, horario de atención y teléfono. Los turnos cambian cada día y se actualizan con los datos del Ministerio de Salud.`,
    enlaces: (r) => `Farmacias de turno en otras comunas de ${r}`,
  },
  bencinas: {
    titulo: (c) => `Precio de bencinas en ${c.nombre}`,
    descripcion: (c) => `Bencina más barata hoy en ${c.nombre}: precios de 93, 95, 97, diésel y parafina en cada bencinera de la comuna, con mapa.`,
    cuerpo: (c) =>
      `Compara el precio de la bencina 93, 95 y 97, el diésel y la parafina en las estaciones de servicio de ${c.nombre}, ordenadas de la más barata a la más cara, con datos de la Comisión Nacional de Energía.`,
    enlaces: (r) => `Precio de bencinas en otras comunas de ${r}`,
  },
}

function valorDelDia(tool) {
  const serie = tool?.code && SERIES[tool.code]
  if (!serie) return null
  const [hoy, ayer] = serie
  const utm = tool.code === 'utm'
  const valor = `$${num(hoy.valor, DEC[tool.code])}`
  const fecha = fechaLarga(hoy.fecha, utm)
  const de = tool.code === 'uf' || tool.code === 'utm' ? 'de la' : 'del'
  const variacion = ayer ? ((hoy.valor / ayer.valor - 1) * 100) : null
  return {
    title: `${tool.title} ${utm ? fecha : fecha.split(',')[1]?.trim() ?? fecha}: ${valor} | ${SITE.name}`,
    description: `El valor ${de} ${NOMBRE[tool.code]} ${utm ? `en ${fecha}` : `hoy, ${fecha},`} es ${valor}${variacion !== null ? ` (${variacion >= 0 ? '+' : ''}${num(variacion, 2)}% respecto del ${utm ? 'mes' : 'valor'} anterior)` : ''}. Historial de los últimos ${utm ? 'meses' : 'días'} y conversor a pesos.`,
    html:
      `<p><strong>${esc(tool.title)}: ${valor}</strong> (${esc(fecha)}).</p>` +
      `<table><thead><tr><th>Fecha</th><th>Valor</th></tr></thead><tbody>${serie
        .map((p) => `<tr><td>${esc(fechaLarga(p.fecha, utm))}</td><td>$${num(p.valor, DEC[tool.code])}</td></tr>`)
        .join('')}</tbody></table>`,
  }
}

// Contenido estático dentro de #root: React lo reemplaza al cargar, pero los buscadores lo leen.
function staticContent(tool) {
  if (!tool) {
    const hoyTxt = ['uf', 'dolar', 'euro', 'utm']
      .filter((c) => SERIES[c])
      .map((c) => `<li><a href="/${c}-hoy/">${NOMBRE[c].replace(/^./, (x) => x.toUpperCase())} hoy</a>: $${num(SERIES[c][0].valor, DEC[c])}</li>`)
      .join('')
    return `<main class="container main"><h1>${esc(SITE.tagline)}</h1><p>${esc(SITE.description)}</p>${hoyTxt ? `<ul>${hoyTxt}</ul>` : ''}<ul>${TOOLS.map(
      (t) => `<li><a href="/${t.slug}/">${esc(t.title)}</a>: ${esc(t.short)}</li>`,
    ).join('')}</ul></main>`
  }
  const g = GUIDES[tool.slug]
  const hoy = valorDelDia(tool)
  let html = `<main class="container main"><h1>${esc(tool.title)}</h1><p>${esc(hoy ? hoy.description : tool.description)}</p>${hoy ? hoy.html : ''}`
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

function page(tool, extra = null) {
  const hoy = valorDelDia(tool)
  const title = extra ? `${extra.titulo} | ${SITE.name}` : hoy ? hoy.title : tool ? `${tool.title} | ${SITE.name}` : `${SITE.name}: ${SITE.tagline}`
  const description = extra ? extra.descripcion : hoy ? hoy.description : tool ? tool.description : SITE.description
  const url = extra ? `${SITE.url}/${tool.slug}/${extra.slug}/` : tool ? `${SITE.url}/${tool.slug}/` : `${SITE.url}/`
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
    extra ? '' : jsonLd(tool, url),
    SITE.cfAnalyticsToken
      ? `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"${SITE.cfAnalyticsToken}","spa":true}'></script>`
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
    .replace('<div id="root"></div>', `<div id="root">${extra ? extra.html : staticContent(tool)}</div>`)
}

writeFileSync(new URL('index.html', dist), page(null))

for (const t of TOOLS) {
  const dir = new URL(`${t.slug}/`, dist)
  mkdirSync(dir, { recursive: true })
  writeFileSync(new URL('index.html', dir), page(t))
}

let paginasComuna = 0
const urlsComuna = []
for (const [slug, textos] of Object.entries(POR_COMUNA)) {
  const tool = TOOLS.find((t) => t.slug === slug)
  for (const c of COMUNAS) {
    const vecinas = COMUNAS.filter((x) => x.regionId === c.regionId && x.slug !== c.slug)
    const html =
      `<main class="container main"><h1>${esc(textos.titulo(c))}</h1><p>${esc(textos.cuerpo(c))}</p>` +
      `<p><a href="/${slug}/">${esc(tool.title)} en todo Chile</a></p>` +
      `<h2>${esc(textos.enlaces(c.region))}</h2><ul>${vecinas.map((v) => `<li><a href="/${slug}/${v.slug}/">${esc(v.nombre)}</a></li>`).join('')}</ul></main>`
    const dir = new URL(`${slug}/${c.slug}/`, dist)
    mkdirSync(dir, { recursive: true })
    writeFileSync(new URL('index.html', dir), page(tool, { slug: c.slug, titulo: textos.titulo(c), descripcion: textos.descripcion(c), html }))
    urlsComuna.push(`${slug}/${c.slug}/`)
    paginasComuna++
  }
}

// Rutas desconocidas: GitHub Pages sirve 404.html y React Router muestra "no encontrada"
writeFileSync(
  new URL('404.html', dist),
  base.replace('</head>', '    <meta name="robots" content="noindex" />\n  </head>'),
)

const today = new Date().toISOString().slice(0, 10)
const urls = ['', ...TOOLS.map((t) => `${t.slug}/`), ...urlsComuna]
  .map((p) => `  <url><loc>${SITE.url}/${p}</loc><lastmod>${today}</lastmod></url>`)
  .join('\n')
writeFileSync(
  new URL('sitemap.xml', dist),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
)

console.log(`prerender: ${paginasComuna} páginas por comuna; valores del día ${Object.keys(SERIES).join(', ') || 'no disponibles'}; ${TOOLS.length} páginas + portada + 404.html + sitemap.xml${SITE.cfAnalyticsToken ? ' + analytics' : ''}`)
