export const cleanRut = (rut) => String(rut).replace(/[^0-9kK]/g, '').toUpperCase()

export function calcDV(body) {
  let sum = 0
  let mul = 2
  for (let i = String(body).length - 1; i >= 0; i--) {
    sum += Number(String(body)[i]) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const res = 11 - (sum % 11)
  if (res === 11) return '0'
  if (res === 10) return 'K'
  return String(res)
}

export function validateRut(rut) {
  const c = cleanRut(rut)
  if (c.length < 2) return false
  const body = c.slice(0, -1)
  const dv = c.slice(-1)
  if (!/^\d+$/.test(body)) return false
  return calcDV(body) === dv
}

export function formatRut(rut) {
  const c = cleanRut(rut)
  if (c.length < 2) return c
  const body = c.slice(0, -1).replace(/^0+/, '')
  const dv = c.slice(-1)
  return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`
}

export function randomRut(min = 5_000_000, max = 25_000_000) {
  const body = Math.floor(min + Math.random() * (max - min))
  return formatRut(`${body}${calcDV(body)}`)
}
