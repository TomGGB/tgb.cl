# tgb.cl: herramientas útiles para Chile

Hub de 28 herramientas gratuitas para Chile: indicadores, sueldo líquido, finiquito, APV, crédito de consumo,
precios de bencinas, sismos, clima, feriados, fines de semana largos, fechas clave, RUT, comunas y más.

Hecho con Vite + React, instalable como app (PWA) y hospedado gratis en GitHub Pages. Datos en vivo de
[mindicador.cl](https://mindicador.cl), [Bencina en Línea](https://www.bencinaenlinea.cl),
[USGS](https://earthquake.usgs.gov) y [Open-Meteo](https://open-meteo.com).

Las calculadoras guardan sus valores en la URL, así que cualquier cálculo se puede compartir con un enlace.

## Desarrollo

Requiere Node 20 o superior (con Node 18, compila con `NODE_OPTIONS=--experimental-global-webcrypto`).

```bash
npm install
npm run dev      # http://localhost:5173
npm run lint     # ESLint
npm test         # tests de la lógica (src/lib)
npm run build    # genera dist/ (un HTML por herramienta con su guía, 404.html y sitemap.xml)
npm run smoke    # con `npx vite preview` corriendo: abre cada ruta en Chrome y falla si hay errores
npm run og       # regenera las imágenes de vista previa en public/og/ (requiere Chrome)
```

GitHub Actions ejecuta lint, tests, build y la prueba de humo antes de publicar.

## Agregar una herramienta

1. Crea el componente en `src/tools/MiHerramienta.jsx`.
2. Agrega sus metadatos (slug, título, descripción, categoría, ícono) en `src/tools/meta.js`.
3. Regístralo en el objeto `COMPONENTS` de `src/App.jsx`.
4. Para que se pueda compartir, usa `useUrlState` en vez de `useState` y agrega `share: true` en sus metadatos.
5. Opcional: agrega su guía y preguntas frecuentes en `src/tools/guides.js`.
6. Ejecuta `npm run og` para generar su imagen de vista previa.

## Estadísticas de visitas

Crea el sitio en Cloudflare (Analytics y registros → Web Analytics → Agregar sitio → `tgb.cl`), copia el token del
fragmento de JavaScript y pégalo en `cfAnalyticsToken` en `src/tools/meta.js`.

## Mantención anual

- `src/lib/sueldo.js`: topes imponibles, comisiones AFP, retención de honorarios, ingreso mínimo (`imm`, se reajusta
  en enero y mayo) y jornada máxima (`jornada`, baja a 40 horas en abril de 2028).
- `src/lib/feriados.js`: fecha del solsticio (`SOLSTICIO`) y feriados por elecciones (`EXTRAS`).

## Publicar en GitHub Pages con tgb.cl

1. Crea un repositorio en GitHub y sube el código a la rama `main`.
2. En el repositorio: **Settings → Pages → Source: GitHub Actions**.
3. Cada push a `main` ejecuta `.github/workflows/deploy.yml` (tests, build y despliegue).
4. En **Settings → Pages → Custom domain** escribe `tgb.cl` (el archivo `public/CNAME` ya lo incluye) y activa
   **Enforce HTTPS** cuando esté disponible.
5. En el DNS de tgb.cl (NIC Chile o tu proveedor) crea:

   | Tipo  | Nombre | Valor                    |
   |-------|--------|--------------------------|
   | A     | @      | 185.199.108.153          |
   | A     | @      | 185.199.109.153          |
   | A     | @      | 185.199.110.153          |
   | A     | @      | 185.199.111.153          |
   | CNAME | www    | `<tu-usuario>.github.io` |

La propagación DNS puede tardar desde minutos hasta 24 horas.
