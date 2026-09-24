import { useMemo, useState } from 'react'

const GRUPOS = [
  {
    name: 'Identidad y documentos',
    links: [
      { name: 'ClaveÚnica', desc: 'Obtener o recuperar tu clave del Estado', url: 'https://claveunica.gob.cl' },
      { name: 'Registro Civil: certificados', desc: 'Nacimiento, matrimonio, antecedentes y más, gratis', url: 'https://www.registrocivil.cl' },
      { name: 'Consultar vigencia de cédula', desc: 'Verifica si un documento está vigente o bloqueado', url: 'https://portal.sidiv.registrocivil.cl/usuarios-portal/pages/DocumentRequestStatus.xhtml' },
      { name: 'ChileAtiende', desc: 'Buscador de trámites y beneficios del Estado', url: 'https://www.chileatiende.gob.cl' },
    ],
  },
  {
    name: 'Impuestos y finanzas',
    links: [
      { name: 'SII', desc: 'Boletas, facturas, Operación Renta y carpeta tributaria', url: 'https://www.sii.cl' },
      { name: 'Tesorería (TGR)', desc: 'Pago de contribuciones, devolución de impuestos', url: 'https://www.tgr.cl' },
      { name: 'CMF', desc: 'Informe de deudas gratis, reclamos a bancos y comparador de tasas', url: 'https://www.cmfchile.cl' },
    ],
  },
  {
    name: 'Trabajo y previsión',
    links: [
      { name: 'Dirección del Trabajo', desc: 'Consultas laborales, finiquitos y denuncias', url: 'https://www.dt.gob.cl' },
      { name: 'AFC: seguro de cesantía', desc: 'Solicitar el seguro y revisar tus cotizaciones', url: 'https://www.afc.cl' },
      { name: 'Superintendencia de Pensiones', desc: 'Compara AFP, comisiones y rentabilidad', url: 'https://www.spensiones.cl' },
      { name: 'Bolsa Nacional de Empleo', desc: 'Ofertas de trabajo y requisito para el seguro de cesantía', url: 'https://www.bne.cl' },
    ],
  },
  {
    name: 'Salud',
    links: [
      { name: 'Fonasa', desc: 'Tramo, bonos, afiliación y licencias', url: 'https://www.fonasa.cl' },
      { name: 'Superintendencia de Salud', desc: 'Compara planes de Isapre y reclamos', url: 'https://www.superdesalud.gob.cl' },
      { name: 'Me Vacuno', desc: 'Certificado de vacunación', url: 'https://mevacuno.gob.cl' },
    ],
  },
  {
    name: 'Vehículos y transporte',
    links: [
      { name: 'Certificado de anotaciones', desc: 'Dueño y prendas de un vehículo (Registro Civil)', url: 'https://www.registrocivil.cl' },
      { name: 'Consulta de multas (RMNP)', desc: 'Multas de tránsito no pagadas', url: 'https://www.registrocivil.cl' },
      { name: 'Bencina en Línea', desc: 'Precios de combustibles por bencinera', url: 'https://www.bencinaenlinea.cl' },
      { name: 'Red Movilidad', desc: 'Recorridos y planificador del transporte en Santiago', url: 'https://www.red.cl' },
    ],
  },
  {
    name: 'Consumidor y servicios',
    links: [
      { name: 'SERNAC', desc: 'Reclamos, derechos del consumidor y registro No Molestar', url: 'https://www.sernac.cl' },
      { name: 'SEC: cortes de luz', desc: 'Mapa de interrupciones eléctricas en tiempo real', url: 'https://www.sec.cl' },
      { name: 'Servel', desc: 'Datos electorales, local de votación y vocales de mesa', url: 'https://www.servel.cl' },
    ],
  },
]

const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default function Tramites() {
  const [q, setQ] = useState('')
  const grupos = useMemo(() => {
    const nq = normalize(q.trim())
    if (!nq) return GRUPOS
    return GRUPOS.map((g) => ({ ...g, links: g.links.filter((l) => normalize(`${l.name} ${l.desc}`).includes(nq)) })).filter(
      (g) => g.links.length,
    )
  }, [q])

  return (
    <>
      <div className="search inline">
        <input type="search" placeholder="Filtrar trámites…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filtrar trámites" />
      </div>
      {grupos.map((g) => (
        <section key={g.name} className="category">
          <h2>{g.name}</h2>
          <div className="link-grid">
            {g.links.map((l) => (
              <a key={l.name} href={l.url} target="_blank" rel="noreferrer" className="link-card">
                <strong>{l.name} <span aria-hidden="true">↗</span></strong>
                <span>{l.desc}</span>
              </a>
            ))}
          </div>
        </section>
      ))}
      {!grupos.length && <p className="muted center">Sin resultados.</p>}
    </>
  )
}
