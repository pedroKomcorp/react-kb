// src/components/MainLayout.tsx
import React from 'react';
import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
import UniversalHeader from './UniversalHeader';

const MainLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', width: '100vw' }}>
      <Sidebar />
      <main style={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <UniversalHeader userName="Pedro Neto" />
        <div style={{ flex: 1, overflow: 'auto' }}>
            <img
              src="/assets/marmore.png"
              alt="Marble background"
              className="absolute top-0 left-0 w-full h-full object-cover -z-10"
            />
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;