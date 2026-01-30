// src/app.tsx
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import MainLayout from './components/MainLayout.tsx';
import { ErrorProvider } from './context/ErrorContext';

const LoginPage = lazy(() => import('./pages/login/index.tsx'));
const HomePage = lazy(() => import('./pages/home/index.tsx'));
const ProjetosPage = lazy(() => import('./pages/gestao/projetos/index.tsx'));
const ClientesPage = lazy(() => import('./pages/gestao/clientes/index.tsx'));
const CreditoPage = lazy(() => import('./pages/operacional/credito/index.tsx'));
const DemandasPage = lazy(() =>
  import('./pages/operacional/demandas/index.tsx').then((module) => ({
    default: module.DemandasPage,
  })),
);

const routeFallback = (
  <div className="w-full h-full flex items-center justify-center text-gray-500">
    Carregando...
  </div>
);

function App() {

  return (
    <ErrorProvider>
      <Router>
        <Suspense fallback={routeFallback}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/login" />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="home" element={<HomePage />} />
                <Route path="gestao/" element={<Outlet />}>
                  <Route path="projetos" element={<ProjetosPage />} />
                  <Route path="clientes" element={<ClientesPage />} />
                  <Route path="*" element={<div>Esta Página não existe dentro de Gestão</div>} />
                </Route>
                <Route path="operacional/" element={<Outlet />}>
                  <Route path="demandas" element={<DemandasPage />} />
                  <Route path="credito" element={<CreditoPage />} />
                  <Route path="*" element={<div>Esta Página não existe dentro de Operacional</div>} />
                </Route>
                <Route path="comercial/" element={<Outlet />}>
                  <Route path="*" element={<div>Esta Página não existe dentro de Comercial</div>} />
                </Route>
                <Route path="*" element={<div>Está Pagina não existe</div>} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </ErrorProvider>
  );
}

export default App;
