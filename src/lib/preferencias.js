import { useCallback, useEffect, useState } from 'react'

// Listas guardadas en localStorage y sincronizadas entre componentes y pestañas.
function useStoredList(key, max = Infinity) {
  const read = () => {
    try {
      const v = JSON.parse(localStorage.getItem(key))
      return Array.isArray(v) ? v : []
    } catch {
      return []
    }
  }
  const [list, setList] = useState(read)

  useEffect(() => {
    const sync = (e) => (!e.key || e.key === key) && setList(read())
    window.addEventListener('storage', sync)
    window.addEventListener(`local:${key}`, sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener(`local:${key}`, sync)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const save = useCallback(
    (updater) => {
      const next = updater(read()).slice(0, max)
      try {
        localStorage.setItem(key, JSON.stringify(next))
      } catch {
        /* sin almacenamiento */
      }
      setList(next)
      window.dispatchEvent(new Event(`local:${key}`))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, max],
  )

  return [list, save]
}

export function useFavoritos() {
  const [favs, save] = useStoredList('favoritos')
  const toggle = useCallback((slug) => save((l) => (l.includes(slug) ? l.filter((s) => s !== slug) : [...l, slug])), [save])
  return { favs, isFav: (slug) => favs.includes(slug), toggle }
}

export function useRecientes() {
  const [recientes, save] = useStoredList('recientes', 6)
  const registrar = useCallback((slug) => save((l) => [slug, ...l.filter((s) => s !== slug)]), [save])
  return { recientes, registrar }
}
