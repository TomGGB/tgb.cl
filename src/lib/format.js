const clp = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })

export const formatCLP = (n) => (Number.isFinite(n) ? clp.format(Math.round(n)) : '—')

export const formatNum = (n, decimals = 2) =>
  Number.isFinite(n)
    ? n.toLocaleString('es-CL', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : '—'

// Acepta "1.234.567", "1234567", "1.234,5"
export const parseNum = (s) => {
  if (typeof s === 'number') return s
  if (!s) return 0
  const clean = String(s).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')
  const n = parseFloat(clean)
  return Number.isFinite(n) ? n : 0
}

export const formatDateLong = (d) =>
  d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export const toISODate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const fromISODate = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
