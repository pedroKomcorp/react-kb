import React, { useState } from "react";
import { SettingFilled, BellFilled, UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import ConfigModal from './config/ConfigModal';
import type { Usuario } from '../types/usuario';

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
    <header className="w-full z-10 flex items-center justify-between min-h-[60px] px-6 py-3">
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
              e.stopPropagation();
              setShowConfig(!showConfig);
              setShowNotifications(false);
            }}
            className={`p-2 rounded-lg transition-colors ${
              showConfig 
                ? 'bg-white/30 hover:bg-white/35' 
                : 'bg-white/5 hover:bg-white/20'
            }`}
            title="Configurações"
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
                  <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm text-red-600">
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
              e.stopPropagation();
              setShowNotifications(!showNotifications);
              setShowConfig(false);
            }}
            className={`p-2 rounded-lg transition-colors relative ${
              showNotifications 
                ? 'bg-white/30 hover:bg-white/35' 
                : 'bg-white/5 hover:bg-white/20'
            }`}
            title="Notificações"
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
            {!isLoading && !loadError && currentUser?.email && (
              <span className="text-white/70 text-xs truncate" style={{ maxWidth: '150px' }}>
                {currentUser.email}
              </span>
            )}
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
  );
};

export default Header;