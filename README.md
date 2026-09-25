# tgb.cl: herramientas útiles para Chile

Hub de 19 herramientas gratuitas: indicadores económicos, conversor UF/UTM, sueldo líquido, finiquito, horas extra,
gratificación, boleta de honorarios, IVA, reajuste de arriendo, simulador hipotecario, sismos, clima y UV, feriados,
días hábiles, cambio de hora, validador de RUT, regiones y comunas, directorio de trámites y teléfonos de emergencia.

Hecho con Vite + React, instalable como app (PWA) y hospedado gratis en GitHub Pages. Datos en vivo de
[mindicador.cl](https://mindicador.cl), [USGS](https://earthquake.usgs.gov) y [Open-Meteo](https://open-meteo.com).

Las calculadoras guardan sus valores en la URL, así que cualquier cálculo se puede compartir con un enlace.

## Desarrollo

Requiere Node 20 o superior (con Node 18, compila con `NODE_OPTIONS=--experimental-global-webcrypto`).

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # tests de RUT, feriados y sueldo
npm run build    # genera dist/ (incluye un HTML por herramienta, 404.html y sitemap.xml)
```

## Agregar una herramienta

1. Crea el componente en `src/tools/MiHerramienta.jsx`.
2. Agrega sus metadatos (slug, título, descripción, categoría, ícono) en `src/tools/meta.js`.
3. Regístralo en el objeto `COMPONENTS` de `src/App.jsx`.
4. Para que se pueda compartir, usa `useUrlState` en vez de `useState` y agrega `share: true` en sus metadatos.

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
