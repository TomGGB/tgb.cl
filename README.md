# tgb.cl: herramientas útiles para Chile

Hub de herramientas gratuitas: indicadores económicos, conversor UF/UTM, sueldo líquido, boleta de honorarios,
IVA, reajuste de arriendo, simulador hipotecario, feriados, días hábiles, validador de RUT, directorio de trámites
y teléfonos de emergencia.

Hecho con Vite + React y hospedado gratis en GitHub Pages. Los indicadores vienen de [mindicador.cl](https://mindicador.cl).

## Desarrollo

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

## Mantención anual

- `src/lib/sueldo.js`: topes imponibles, comisiones AFP y tasa de retención de honorarios (cambian cada año).
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
