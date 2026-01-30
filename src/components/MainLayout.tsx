// src/components/MainLayout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
import Header from './Header';
import { getUsuario } from '../services/usuarios';
import type { Usuario } from '../types/usuario';
import { useError } from '../context/ErrorContext';

// Simple cache for user data
const userCache = new Map<number, { user: Usuario; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to get cached user or fetch from API
const getCachedUser = async (userId: number): Promise<Usuario> => {
  const cached = userCache.get(userId);
  const now = Date.now();
  
  // Return cached data if it's still valid
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.user;
  }
  
  // Fetch from API and cache the result
  const user = await getUsuario(userId);
  userCache.set(userId, { user, timestamp: now });
  
  return user;
};

// Helper function to clear user cache (useful for debugging)
const clearUserCache = () => {
  userCache.clear();
};

// Make clearUserCache available globally for debugging
if (typeof window !== 'undefined') {
  (window as typeof window & { clearUserCache: () => void }).clearUserCache = clearUserCache;
}

const MainLayout: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Usuario>({
    id: 0,
    nome: "Usuário",
    email: "usuario@example.com",
  });
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userLoadError, setUserLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      setUserLoadError(null);
      
      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
          setUserLoadError('ID do usuário não encontrado no armazenamento local');
          console.warn('MainLayout: No user ID found in localStorage');
          setCurrentUser(prevUser => ({ ...prevUser, nome: 'Usuário' }));
          return;
        }

        const userIdNumber = parseInt(userId);
        if (isNaN(userIdNumber) || userIdNumber <= 0) {
          setUserLoadError('ID do usuário inválido');
          console.error('MainLayout: Invalid user ID:', userId);
          setCurrentUser(prevUser => ({ ...prevUser, nome: 'Usuário' }));
          return;
        }
        
        const user = await getCachedUser(userIdNumber);
        setCurrentUser(user);
        setUserLoadError(null);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao carregar perfil';
        setUserLoadError(errorMessage);
        console.error('MainLayout: Failed to load user profile:', error);
        
        // Set a fallback user on error but keep the original structure
        setCurrentUser(prevUser => ({ 
          ...prevUser, 
          nome: 'Usuário',
          email: 'usuario@example.com'
        }));
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadUserProfile();
  }, []);

  // Debug: Track currentUser changes
  useEffect(() => {
  }, [currentUser]);

  const handleUpdateProfile = (updatedUser: Usuario) => {
    setCurrentUser(updatedUser);
    // Update cache with new user data
    if (updatedUser.id > 0) {
      userCache.set(updatedUser.id, { user: updatedUser, timestamp: Date.now() });
    }
  };

  // Function to refresh user data
  const refreshUserData = async () => {
    const userId = localStorage.getItem('user_id');
    if (userId && !isLoadingUser) {
      const userIdNumber = parseInt(userId);
      if (!isNaN(userIdNumber) && userIdNumber > 0) {
        setIsLoadingUser(true);
        setUserLoadError(null);
        
        try {
          // Clear cache for this user to force fresh fetch
          userCache.delete(userIdNumber);
          const user = await getCachedUser(userIdNumber);
          setCurrentUser(user);
          setUserLoadError(null);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao recarregar dados';
          setUserLoadError(errorMessage);
          console.error('Failed to refresh user data:', error);
        } finally {
          setIsLoadingUser(false);
        }
      }
    }
  };
  
  const { isLocked } = useError();

  return (
    <div style={{display: 'flex', flexDirection: 'row', height: '100vh', width: '100vw' }}>
      <Sidebar isLocked={isLocked} />
      <main
        className="marble-bg"
        style={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column' }}
      >
        <Header 
          userName={
            isLoadingUser 
              ? "Carregando..." 
              : userLoadError 
                ? "Erro ao carregar"
                : (currentUser?.nome || "Usuário")
          }
          currentUser={currentUser}
          onUpdateProfile={handleUpdateProfile}
          isLoading={isLoadingUser}
          loadError={userLoadError}
          onRefreshUser={refreshUserData}
        />
        <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
          {/* Disable interaction overlay when locked */}
          {isLocked && (
            <div className="absolute inset-0 z-40 cursor-not-allowed" />
          )}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
