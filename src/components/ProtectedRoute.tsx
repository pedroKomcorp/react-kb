import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/UseAuth';
import { BASE_URL } from '../services/api';

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

        console.log("BASE_URL:", BASE_URL);

        const res = await fetch(`${BASE_URL}/auth/validate`, {
          headers: { Authorization: `Bearer ${token}` },
        });


        const data = await res.json();

        if (!data.valid) {
          const refreshToken = localStorage.getItem('refresh_token');

          if (refreshToken) {
            try {
              const refreshRes = await fetch(`${BASE_URL}auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken }),
              });

              const refreshData = await refreshRes.json();

              if (refreshRes.ok && refreshData.access_token) {
                localStorage.setItem('token', refreshData.access_token);
                setValid(true);
                window.location.reload();
                return;
              }
            } catch (err) {
              console.warn("Refresh token failed", err);
            }
          }

          throw new Error('Invalid token');
        }

        setValid(true);
      } catch {
        setValid(false);
        logout?.();
      } finally {
        setChecking(false);
      }
    };

    validateToken();
  }, [tok]()
