import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Layout, { ToolPage } from './components/Layout'
import Home from './pages/Home'
import { TOOLS } from './tools/meta'

const COMPONENTS = {
  indicadores: lazy(() => import('./tools/Indicadores')),
  conversor: lazy(() => import('./tools/Conversor')),
  'reajuste-arriendo': lazy(() => import('./tools/ReajusteArriendo')),
  dividendo: lazy(() => import('./tools/Dividendo')),
  'sueldo-liquido': lazy(() => import('./tools/SueldoLiquido')),
  'boleta-honorarios': lazy(() => import('./tools/BoletaHonorarios')),
  iva: lazy(() => import('./tools/Iva')),
  feriados: lazy(() => import('./tools/Feriados')),
  'dias-habiles': lazy(() => import('./tools/DiasHabiles')),
  rut: lazy(() => import('./tools/Rut')),
  tramites: lazy(() => import('./tools/Tramites')),
  emergencias: lazy(() => import('./tools/Emergencias')),
  finiquito: lazy(() => import('./tools/Finiquito')),
  'horas-extra': lazy(() => import('./tools/HorasExtra')),
  gratificacion: lazy(() => import('./tools/Gratificacion')),
  sismos: lazy(() => import('./tools/Sismos')),
  clima: lazy(() => import('./tools/Clima')),
  'cambio-de-hora': lazy(() => import('./tools/CambioHora')),
  comunas: lazy(() => import('./tools/Comunas')),
  'credito-consumo': lazy(() => import('./tools/CreditoConsumo')),
  'comparador-historico': lazy(() => import('./tools/ComparadorHistorico')),
  apv: lazy(() => import('./tools/Apv')),
  bencinas: lazy(() => import('./tools/Bencinas')),
  'costo-viaje': lazy(() => import('./tools/CostoViaje')),
  'consumo-electrico': lazy(() => import('./tools/ConsumoElectrico')),
  'dividir-cuenta': lazy(() => import('./tools/DividirCuenta')),
  'fechas-clave': lazy(() => import('./tools/FechasClave')),
  'fines-de-semana-largos': lazy(() => import('./tools/FinesLargos')),
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
                      <C />
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
