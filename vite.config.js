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
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'tgb.cl · Herramientas útiles para Chile',
        short_name: 'tgb.cl',
        description: 'Indicadores, sueldo líquido, finiquito, feriados, sismos, clima, RUT y más herramientas para Chile.',
        lang: 'es-CL',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#f6f7f9',
        theme_color: '#0b3a82',
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
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/sitemap\.xml$/, /^\/robots\.txt$/],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // Datos en vivo: siempre intenta la red y usa la última respuesta si no hay conexión
            urlPattern: ({ url }) =>
              ['mindicador.cl', 'api.open-meteo.com', 'air-quality-api.open-meteo.com', 'earthquake.usgs.gov'].includes(url.hostname),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'datos-en-vivo',
              networkTimeoutSeconds: 6,
              expiration: { maxEntries: 200, maxAgeSeconds: 7 * DAY },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => url.hostname.endsWith('tile.openstreetmap.org'),
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
