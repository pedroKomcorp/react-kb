// src/app.tsx
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router';
import LoginPage from './pages/login/index.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import MainLayout from './components/MainLayout.tsx'; // 👈 Import the new layout
import HomePage from './pages/home/index.tsx';
import ProjetosPage from './pages/gestao/projetos/index.tsx';
import ClientesPage from './pages/gestao/clientes/index.tsx';
import { DemandasPage } from './pages/operacional/demandas/index.tsx';

function App() {

  return (
    <Router>
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
              <Route path="*" element={<div>Esta Página não existe dentro de Operacional</div>} />
            </Route>
            <Route path="comercial/" element={<Outlet />}>
              <Route path="*" element={<div>Esta Página não existe dentro de Comercial</div>} />
            </Route>
            <Route path="*" element={<div>Está Pagina não existe</div>} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;