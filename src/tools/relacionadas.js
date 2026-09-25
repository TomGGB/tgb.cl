// Herramientas sugeridas al final de cada página ("También te puede servir").
// Las que no aparecen aquí sugieren otras de su misma categoría.
export const RELACIONADAS = {
  'sueldo-liquido': ['gratificacion', 'horas-extra', 'apv', 'finiquito'],
  finiquito: ['vacaciones', 'sueldo-liquido', 'dias-habiles', 'tramites'],
  'boleta-honorarios': ['iva', 'sueldo-liquido', 'fechas-clave'],
  'horas-extra': ['sueldo-liquido', 'gratificacion', 'datos-legales'],
  gratificacion: ['sueldo-liquido', 'horas-extra', 'datos-legales'],
  'licencia-medica': ['sueldo-liquido', 'vacaciones', 'farmacias-de-turno'],
  vacaciones: ['fines-de-semana-largos', 'feriados', 'finiquito'],
  'credito-consumo': ['dividendo', 'ahorro', 'comparador-historico'],
  dividendo: ['uf-hoy', 'reajuste-arriendo', 'credito-consumo'],
  apv: ['sueldo-liquido', 'ahorro', 'datos-legales'],
  ahorro: ['apv', 'comparador-historico', 'uf-hoy'],
  descuentos: ['compras-extranjero', 'iva', 'dividir-cuenta'],
  'compras-extranjero': ['dolar-hoy', 'descuentos', 'conversor'],
  'pension-alimentos': ['sueldo-liquido', 'datos-legales', 'tramites'],
  'datos-legales': ['sueldo-liquido', 'utm-hoy', 'boleta-honorarios'],
  'uf-hoy': ['conversor', 'dividendo', 'reajuste-arriendo'],
  'dolar-hoy': ['compras-extranjero', 'conversor', 'euro-hoy'],
  'euro-hoy': ['dolar-hoy', 'conversor', 'compras-extranjero'],
  'utm-hoy': ['datos-legales', 'sueldo-liquido', 'conversor'],
  bencinas: ['costo-viaje', 'fines-de-semana-largos'],
  'costo-viaje': ['bencinas', 'dividir-cuenta', 'clima'],
  feriados: ['fines-de-semana-largos', 'vacaciones', 'fechas-clave'],
  'fines-de-semana-largos': ['vacaciones', 'feriados', 'costo-viaje'],
  'farmacias-de-turno': ['emergencias', 'licencia-medica'],
  sismos: ['emergencias', 'olas'],
  olas: ['clima', 'sismos', 'costo-viaje'],
  clima: ['olas', 'sismos'],
}

export function relacionadas(tool, TOOLS, n = 3) {
  const bySlug = (s) => TOOLS.find((t) => t.slug === s)
  const curadas = (RELACIONADAS[tool.slug] ?? []).map(bySlug).filter(Boolean)
  const misma = TOOLS.filter((t) => t.category === tool.category && t.slug !== tool.slug && !t.landing && !curadas.includes(t))
  return [...curadas, ...misma].slice(0, Math.max(n, curadas.length))
}
