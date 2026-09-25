import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Layout, { ToolPage } from './components/Layout'
import Home from './pages/Home'
import { TOOLS } from './tools/meta'

// Tras publicar una versión nueva, los archivos de la anterior dejan de existir. Si una pestaña vieja
// intenta cargar uno, se recarga la página una vez para obtener la versión actual.
const RECARGA = 'recarga-por-version'
function cargar(importar) {
  return () =>
    importar().then(
      (mod) => {
        try {
          sessionStorage.removeItem(RECARGA)
        } catch {
          /* sin almacenamiento */
        }
        return mod
      },
      (err) => {
        let yaRecargo = true
        try {
          yaRecargo = sessionStorage.getItem(RECARGA) === '1'
          if (!yaRecargo) sessionStorage.setItem(RECARGA, '1')
        } catch {
          /* sin almacenamiento: no arriesgar un bucle de recargas */
        }
        if (!yaRecargo && navigator.onLine) {
          window.location.reload()
          return new Promise(() => {})
        }
        throw err
      },
    )
}

const COMPONENTS = {
  indicadores: lazy(cargar(() => import('./tools/Indicadores'))),
  conversor: lazy(cargar(() => import('./tools/Conversor'))),
  'reajuste-arriendo': lazy(cargar(() => import('./tools/ReajusteArriendo'))),
  dividendo: lazy(cargar(() => import('./tools/Dividendo'))),
  'sueldo-liquido': lazy(cargar(() => import('./tools/SueldoLiquido'))),
  'boleta-honorarios': lazy(cargar(() => import('./tools/BoletaHonorarios'))),
  iva: lazy(cargar(() => import('./tools/Iva'))),
  feriados: lazy(cargar(() => import('./tools/Feriados'))),
  'dias-habiles': lazy(cargar(() => import('./tools/DiasHabiles'))),
  rut: lazy(cargar(() => import('./tools/Rut'))),
  tramites: lazy(cargar(() => import('./tools/Tramites'))),
  emergencias: lazy(cargar(() => import('./tools/Emergencias'))),
  finiquito: lazy(cargar(() => import('./tools/Finiquito'))),
  'horas-extra': lazy(cargar(() => import('./tools/HorasExtra'))),
  gratificacion: lazy(cargar(() => import('./tools/Gratificacion'))),
  sismos: lazy(cargar(() => import('./tools/Sismos'))),
  clima: lazy(cargar(() => import('./tools/Clima'))),
  'cambio-de-hora': lazy(cargar(() => import('./tools/CambioHora'))),
  comunas: lazy(cargar(() => import('./tools/Comunas'))),
  'credito-consumo': lazy(cargar(() => import('./tools/CreditoConsumo'))),
  'comparador-historico': lazy(cargar(() => import('./tools/ComparadorHistorico'))),
  apv: lazy(cargar(() => import('./tools/Apv'))),
  bencinas: lazy(cargar(() => import('./tools/Bencinas'))),
  'costo-viaje': lazy(cargar(() => import('./tools/CostoViaje'))),
  'consumo-electrico': lazy(cargar(() => import('./tools/ConsumoElectrico'))),
  'dividir-cuenta': lazy(cargar(() => import('./tools/DividirCuenta'))),
  'fechas-clave': lazy(cargar(() => import('./tools/FechasClave'))),
  'fines-de-semana-largos': lazy(cargar(() => import('./tools/FinesLargos'))),
  'uf-hoy': lazy(cargar(() => import('./tools/ValorHoy'))),
  'dolar-hoy': lazy(cargar(() => import('./tools/ValorHoy'))),
  'euro-hoy': lazy(cargar(() => import('./tools/ValorHoy'))),
  'utm-hoy': lazy(cargar(() => import('./tools/ValorHoy'))),
  'compras-extranjero': lazy(cargar(() => import('./tools/ComprasExtranjero'))),
  widget: lazy(cargar(() => import('./tools/Widget'))),
  'licencia-medica': lazy(cargar(() => import('./tools/LicenciaMedica'))),
  vacaciones: lazy(cargar(() => import('./tools/Vacaciones'))),
  'farmacias-de-turno': lazy(cargar(() => import('./tools/Farmacias'))),
  olas: lazy(cargar(() => import('./tools/Olas'))),
  ahorro: lazy(cargar(() => import('./tools/Ahorro'))),
  descuentos: lazy(cargar(() => import('./tools/Descuentos'))),
  'datos-legales': lazy(cargar(() => import('./tools/DatosLegales'))),
  'pension-alimentos': lazy(cargar(() => import('./tools/PensionAlimentos'))),
}

function NotFound() {
  return (
    <div className="center not-found">
      <h1>Página no encontrada</h1>
      <p>
        <Link to="/">Volver al inicio</Link>
      </p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          {TOOLS.map((t) => {
            const C = COMPONENTS[t.slug]
            return (
              <Route
                key={t.slug}
                path={t.slug}
                element={
                  <ToolPage tool={t}>
                    <Suspense fallback={<div className="card loading-block">Cargando…</div>}>
                      <C tool={t} />
                    </Suspense>
                  </ToolPage>
                }
              />
            )
          })}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
