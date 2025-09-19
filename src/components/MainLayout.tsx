// src/components/MainLayout.tsx
import React from 'react';
import { Outlet } from 'react-router';
import Sidebar from './Sidebar';


const MainLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', width: '100vw' }}>
      <Sidebar />
      <main style={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;