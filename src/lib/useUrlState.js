import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

// Estado sincronizado con un parámetro de la URL, para poder compartir un cálculo.
// El tipo se infiere del valor por defecto (number, boolean o string).
// Los valores iguales al predeterminado no se escriben, para mantener la URL corta.
export function useUrlState(key, defaultValue) {
  const [params, setParams] = useSearchParams()
  const raw = params.get(key)

  let value = defaultValue
  if (raw !== null) {
    if (typeof defaultValue === 'number') {
      const n = Number(raw)
      value = Number.isFinite(n) ? n : defaultValue
    } else if (typeof defaultValue === 'boolean') {
      value = raw === '1'
    } else {
      value = raw
    }
  }

  const setValue = useCallback(
    (next) => {
      setParams(
        (prev) => {
          const p = new URLSearchParams(prev)
          if (next === defaultValue || next === '' || next === null || next === undefined) p.delete(key)
          else p.set(key, typeof next === 'boolean' ? (next ? '1' : '0') : String(next))
          return p
        },
        { replace: true },
      )
    },
    [key, defaultValue, setParams],
  )

  return [value, setValue]
}
