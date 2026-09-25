import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const HOUR = 60 * 60
const DAY = 24 * HOUR

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // el registro se hace en src/main.jsx para revisar actualizaciones periódicamente
      injectRegister: false,
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'tgb.cl · Herramientas útiles para Chile',
        short_name: 'tgb.cl',
        description: 'Indicadores, sueldo líquido, finiquito, feriados, sismos, clima, RUT y más herramientas para Chile.',
        lang: 'es-CL',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#f3f5f7',
        theme_color: '#1f4e8c',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Indicadores', url: '/indicadores/' },
          { name: 'Sueldo líquido', url: '/sueldo-liquido/' },
          { name: 'Sismos', url: '/sismos/' },
          { name: 'Feriados', url: '/feriados/' },
        ],
      },
      workbox: {
        // Sin HTML en el precache: las páginas siempre se piden a la red (ver 'paginas' abajo),
        // así una versión nueva se ve apenas se publica. JS/CSS llevan hash y sí se precachean.
        globPatterns: ['**/*.{js,css,svg,png,woff2}'],
        globIgnores: ['og/**', '**/*vietnamese*', 'widget.js'],
        navigateFallback: null,
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            // Páginas: red primero (revalidando con el servidor); la copia guardada solo se usa sin conexión
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'paginas',
              networkTimeoutSeconds: 5,
              fetchOptions: { cache: 'no-cache' },
              expiration: { maxEntries: 60, maxAgeSeconds: 30 * DAY },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            // Datos en vivo: siempre intenta la red y usa la última respuesta si no hay conexión
            urlPattern: ({ url }) =>
              ['mindicador.cl', 'api.open-meteo.com', 'air-quality-api.open-meteo.com', 'earthquake.usgs.gov', 'api.bencinaenlinea.cl'].includes(url.hostname),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'datos-en-vivo',
              networkTimeoutSeconds: 8,
              fetchOptions: { cache: 'no-store' },
              expiration: { maxEntries: 200, maxAgeSeconds: 7 * DAY },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => url.hostname === 'tile.openstreetmap.org',
            handler: 'CacheFirst',
            options: {
              cacheName: 'mapas',
              expiration: { maxEntries: 300, maxAgeSeconds: 30 * DAY },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
