import { createContext, useContext, useEffect } from 'react'

// Cada herramienta puede publicar un resumen de su resultado para compartirlo por WhatsApp.
export const ShareTextContext = createContext(() => {})

export function useShareText(text) {
  const set = useContext(ShareTextContext)
  useEffect(() => {
    set(text || null)
  }, [text, set])
  useEffect(() => () => set(null), [set])
}

export function whatsappUrl(text, url) {
  return `https://wa.me/?text=${encodeURIComponent(text ? `${text}\n${url}` : url)}`
}
