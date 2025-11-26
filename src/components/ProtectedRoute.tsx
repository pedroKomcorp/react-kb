// src/components/ProtectedRoute.tsx
import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../hooks/UseAuth';
import { API_BASE_URL } from '../services/api';

const ProtectedRoute: React.FC = () => {
  const { token, logout } = useAuth();
  const [checking, setChecking] = React.useState(true);
  const [valid, setValid] = React.useState(true);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setValid(false);
        setChecking(false);
        return;
      }
      try {
        // Try a lightweight auth check endpoint
        const res = await fetch(`${API_BASE_URL}/auth/validate`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data.valid) {
          // Try refresh token
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken })
              });
              const refreshData = await refreshRes.json();
              if (refreshRes.ok && refreshData.access_token) {
                localStorage.setItem('token', refreshData.access_token);
                setValid(true);
                window.location.reload();
                return;
              }
            } catch {
              // Intentionally ignored: refresh token failed
            }
          }
          throw new Error('Invalid token');
        }
        setValid(true);
      } catch {
        setValid(false);
        if (logout) {
          logout();
        }
      } finally {
        setChecking(false);
      }
    };
    validateToken();
    // Only run on mount and when token changes
  }, [token, logout]);

  if (checking) return null;
  if (!token || !valid) {
    return <Navigate to="/" />;
  }
  return <Outlet />;
};

export default ProtectedRoute;