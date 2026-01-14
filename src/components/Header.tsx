import React, { useState } from "react";
import { SettingFilled, BellFilled, UserOutlined, CloseOutlined, ExclamationCircleOutlined, LogoutOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import ConfigModal from './config/ConfigModal';
import type { Usuario } from '../types/usuario';
import { useError } from '../context/ErrorContext';
import { setGlobalErrorHandler, setAuthLockHandler } from '../services/api';
import { useNavigate } from 'react-router';

interface Header {
  userName: string;
  title?: string;
  showTitle?: boolean;
  currentUser?: Usuario;
  onUpdateProfile?: (updatedUser: Usuario) => void;
  isLoading?: boolean;
  loadError?: string | null;
  onRefreshUser?: () => Promise<void>;
}

const Header: React.FC<Header> = ({ 
  userName, 
  title = "", 
  showTitle = false,
  currentUser,
  onUpdateProfile,
  isLoading = false,
  loadError = null,
  onRefreshUser
}) => {
  // Get the display name with fallbacks
  const displayName = currentUser?.nome || userName || 'Usuário';
  const [showNotifications, setShowNotifications] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const { errors, removeError, addError, isLocked, setAuthLocked } = useError();
  const navigate = useNavigate();

  // Setup global error handler for API errors
  React.useEffect(() => {
    setGlobalErrorHandler(addError);
    setAuthLockHandler(setAuthLocked);
  }, [addError, setAuthLocked]);

  const handleLogout = () => {
    // Clear all localStorage
    localStorage.clear();
    
    // Clear all sessionStorage
    sessionStorage.clear();
    
    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Clear any cache if available
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
    
    // Reset auth lock state
    setAuthLocked(false);
    
    // Redirect to login
    navigate('/login', { replace: true });
    
    // Force page reload to clear any in-memory state
    window.location.href = '/login';
  };

  React.useEffect(() => {
  }, [showConfigModal]);

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Check if the click is inside any dropdown or button
      const isInsideConfig = target.closest('.config-dropdown') || target.closest('[data-config-button]');
      const isInsideNotifications = target.closest('.notifications-dropdown') || target.closest('[data-notifications-button]');
      
      if (!isInsideConfig) {
        setShowConfig(false);
      }
      
      if (!isInsideNotifications) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <>
      {/* Auth Lock Modal Overlay */}
      {isLocked && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-4 text-center">
            <div className="mb-4 text-red-500">
              <ExclamationCircleOutlined style={{ fontSize: '64px' }} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Sessão Inválida</h2>
            <p className="text-gray-600 mb-6">
              Suas credenciais não puderam ser validadas. Por favor, faça logout e entre novamente.
            </p>
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <LogoutOutlined />
              Fazer Logout
            </button>
          </div>
        </div>
      )}

      {/* Error notifications section */}
      {errors.length > 0 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 space-y-2 max-w-md w-full px-4" style={{ zIndex: 10000 }}>
          {errors.map((error) => (
            <div
              key={error.id}
              className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-2xl flex items-start gap-3"
              style={{
                animation: 'slideInDown 0.4s ease-out, fadeOut 0.5s ease-in 4.5s forwards'
              }}
            >
              <ExclamationCircleOutlined className="text-xl flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">{error.message}</p>
              </div>
              <button
                onClick={() => removeError(error.id)}
                className="flex-shrink-0 hover:bg-red-600 rounded p-1 transition-colors"
                aria-label="Fechar"
              >
                <CloseOutlined className="text-sm" />
              </button>
            </div>
          ))}
        </div>
      )}

      <header className="w-full z-10 flex items-center justify-between min-h-[60px] px-6 py-3 bg-black" style={{ backgroundColor: 'transparent' }}>
        {/* Left side - Title or empty space */}
        <div className="flex items-center gap-4">
        {showTitle && title && (
          <div>
            <h1 className="text-xl font-semibold text-white">{title}</h1>
          </div>
        )}
      </div>

      {/* Right side - Config, Notifications, and User display */}
      <div className="flex items-center gap-3">
        {/* Config button */}
        <div className="relative">
          <button
            data-config-button
            onClick={(e) => {
              if (isLocked) return;
              e.stopPropagation();
              setShowConfig(!showConfig);
              setShowNotifications(false);
            }}
            disabled={isLocked}
            className={`p-2 rounded-lg transition-colors ${
              showConfig 
                ? 'bg-white/30 hover:bg-white/35' 
                : 'bg-white/5 hover:bg-white/20'
            } ${isLocked ? 'cursor-not-allowed' : ''}`}
            title={isLocked ? 'Bloqueado - Faça logout' : 'Configurações'}
          >
            <SettingFilled 
              style={{ fontSize: '24px', color: '#BA8364' }} 
            />
          </button>

          {/* Config dropdown */}
          {showConfig && (
            <div 
              className="config-dropdown absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[250px] z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-semibold mb-3 text-gray-800">Configurações</h3>
              <div className="space-y-2">
                <button 
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm text-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConfigModal(true);
                    setShowConfig(false);
                  }}
                >
                  Configurações do Perfil
                </button>
                <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm text-gray-700">
                  Configurações de Notificações
                </button>
                {onRefreshUser && (
                  <button 
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm text-gray-700 disabled:opacity-50"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await onRefreshUser();
                        setShowConfig(false);
                      } catch (error) {
                        console.error('Failed to refresh user data:', error);
                      }
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Recarregando...' : 'Recarregar Perfil'}
                  </button>
                )}
                <div className="border-t pt-2 mt-2">
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm text-red-600 flex items-center gap-2"
                  >
                    <LogoutOutlined />
                    Sair
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notifications button */}
        <div className="relative">
          <button
            data-notifications-button
            onClick={(e) => {
              if (isLocked) return;
              e.stopPropagation();
              setShowNotifications(!showNotifications);
              setShowConfig(false);
            }}
            disabled={isLocked}
            className={`p-2 rounded-lg transition-colors relative ${
              showNotifications 
                ? 'bg-white/30 hover:bg-white/35' 
                : 'bg-white/5 hover:bg-white/20'
            } ${isLocked ? ' ursor-not-allowed' : ''}`}
            title={isLocked ? 'Bloqueado - Faça logout' : 'Notificações'}
          >
            <BellFilled 
              style={{ fontSize: '24px', color: '#BA8364' }} 
            />
          </button>
          
          {/* Notifications dropdown */}
          {showNotifications && (
            <div 
              className="notifications-dropdown absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[300px] z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-semibold mb-3 text-gray-800">Notificações</h3>
              <div className="text-center text-gray-500 py-4">
                Nenhuma notificação
              </div>
            </div>
          )}
        </div>

        {/* User display */}
        <div className="flex items-center gap-3 ml-3">
          <Avatar
            size={40}
            icon={<UserOutlined />}
            className={`border-2 border-white/20 ${isLoading ? 'animate-pulse' : ''}`}
            style={{
              color: '#fff',
              backgroundColor: loadError ? '#dc2626' : '#BA8364'
            }}
          >
          </Avatar>
          <div className="flex flex-col">
            <span 
              className={`font-medium text-sm ${loadError ? 'text-red-300' : 'text-white'}`}
              style={{ minWidth: '80px' }}
              title={loadError || displayName}
            >
              {displayName}
            </span>      
            {loadError && (
              <span className="text-red-300 text-xs truncate" style={{ maxWidth: '150px' }}>
                {loadError}
              </span>
            )}
            {isLoading && (
              <span className="text-white/70 text-xs animate-pulse">
                Carregando...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Config Modal */}
      <ConfigModal
        open={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        currentUser={currentUser}
        onUpdateProfile={onUpdateProfile || (() => {})}
      />
      </header>
    </>
  );
};

export default Header;