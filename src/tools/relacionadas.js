// Herramientas sugeridas al final de cada página ("También te puede servir").
// Las que no aparecen aquí sugieren otras de su misma categoría.
export const RELACIONADAS = {
  'sueldo-liquido': ['gratificacion', 'horas-extra', 'apv', 'finiquito'],
  finiquito: ['vacaciones', 'carta-renuncia', 'sueldo-liquido', 'dias-habiles'],
  'boleta-honorarios': ['renta-honorarios', 'iva', 'sueldo-liquido'],
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
  notas: ['paes', 'calendario-escolar', 'cuenta-regresiva'],
  paes: ['notas', 'calendario-escolar'],
  'calendario-escolar': ['feriados', 'fines-de-semana-largos', 'notas'],
  'pre-postnatal': ['semanas-embarazo', 'licencia-medica', 'vacaciones'],
  'costo-empleador': ['sueldo-liquido', 'datos-legales', 'finiquito'],
  'comparador-afp': ['sueldo-liquido', 'apv', 'datos-legales'],
  'renta-honorarios': ['boleta-honorarios', 'fechas-clave', 'apv'],
  'multas-transito': ['bencinas', 'fechas-clave', 'utm-hoy'],
  'dividir-arriendo': ['reajuste-arriendo', 'dividir-cuenta', 'consumo-electrico'],
  'carta-renuncia': ['finiquito', 'vacaciones', 'dias-habiles'],
  'cuenta-regresiva': ['feriados', 'fines-de-semana-largos', 'calendario-escolar'],
  'datos-transferencia': ['dividir-cuenta', 'rut', 'dividir-arriendo'],
  'sueldo-por-hora': ['horas-extra', 'sueldo-liquido', 'datos-legales'],
  'semanas-embarazo': ['pre-postnatal', 'licencia-medica'],
  'permiso-circulacion': ['multas-transito', 'fechas-clave', 'bencinas'],
  contribuciones: ['fechas-clave', 'dividendo', 'reajuste-arriendo'],
  'contrato-arriendo': ['reajuste-arriendo', 'dividir-arriendo', 'rut'],
}

export function relacionadas(tool, TOOLS, n = 3) {
  const bySlug = (s) => TOOLS.find((t) => t.slug === s)
  const curadas = (RELACIONADAS[tool.slug] ?? []).map(bySlug).filter(Boolean)
  const misma = TOOLS.filter((t) => t.category === tool.category && t.slug !== tool.slug && !t.landing && !curadas.includes(t))
  return [...curadas, ...misma].slice(0, Math.max(n, curadas.length))
}
