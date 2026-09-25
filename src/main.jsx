import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import '@fontsource-variable/public-sans/wght.css'
import '@fontsource-variable/bricolage-grotesque/wght.css'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Service worker: al publicar una versión nueva se instala en segundo plano y la página se recarga sola.
// Se revisa si hay versión nueva al volver a la pestaña y cada 30 minutos.
registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    if (!registration) return
    const check = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) registration.update().catch(() => {})
    }
    setInterval(check, 30 * 60 * 1000)
    document.addEventListener('visibilitychange', check)
  },
})
