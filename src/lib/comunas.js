import regiones from '../data/regiones.json'
import { slugify } from './slug'

// Comunas con su slug, para las páginas por comuna (/farmacias-de-turno/maipu/, /bencinas/maipu/)
export const COMUNAS = regiones.flatMap((r) =>
  r.comunas.map((c) => ({ ...c, slug: slugify(c.nombre), region: r.nombre, regionId: r.id })),
)
export const comunaPorSlug = (slug) => COMUNAS.find((c) => c.slug === slug) ?? null
export const comunasDeRegion = (regionId) => COMUNAS.filter((c) => c.regionId === regionId)

// Textos de cada herramienta con variante por comuna (también los usa scripts/prerender.mjs)
export const POR_COMUNA = {
  'farmacias-de-turno': {
    titulo: (c) => `Farmacias de turno en ${c.nombre}`,
    descripcion: (c) =>
      `Farmacias de turno hoy en ${c.nombre}, región ${c.region}: dirección, horario, teléfono y mapa, con datos oficiales del MINSAL.`,
    enlaces: (r) => `Farmacias de turno en otras comunas de ${r}`,
  },
  bencinas: {
    titulo: (c) => `Precio de bencinas en ${c.nombre}`,
    descripcion: (c) =>
      `Bencina más barata hoy en ${c.nombre}: precios de 93, 95, 97, diésel y parafina en cada bencinera de la comuna, con mapa.`,
    enlaces: (r) => `Precio de bencinas en otras comunas de ${r}`,
  },
}
