// src/components/MainLayout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
import UniversalHeader from './UniversalHeader';
import { getCurrentUserProfile } from '../services/usuarios';
import type { Usuario } from '../types/usuario';

const MainLayout: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Usuario>({
    id: 1,
    nome: "Pedro Neto",
    email: "pedro.neto@example.com",
    profilePhoto: undefined
  });

  // Load current user profile on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const user = await getCurrentUserProfile();
        setCurrentUser(user);
      } catch (error) {
        console.warn('Failed to load user profile, using mock data:', error);
        // Keep the mock data as fallback
      }
    };

    loadUserProfile();
  }, []);

  const handleUpdateProfile = (updatedUser: Usuario) => {
    // Update local user state with the data returned from the API
    setCurrentUser(updatedUser);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', width: '100vw' }}>
      <Sidebar />
      <main style={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <UniversalHeader 
          userName={currentUser.nome}
          currentUser={currentUser}
          onUpdateProfile={handleUpdateProfile}
        />
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