import React, { useState } from 'react';
import {
  BellFilled,
  AppstoreOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  LogoutOutlined,
  SettingFilled,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Checkbox, Drawer, Modal, message } from 'antd';
import { useLocation, useNavigate } from 'react-router';
import ConfigModal from './config/ConfigModal';
import type { Usuario } from '../types/usuario';
import { useError } from '../context/ErrorContext';
import { normalizeHomeWidgetKeys, useHomeWidgets } from '../context/HomeWidgetsContext';

interface RightRailProps {
  userName: string;
  currentUser?: Usuario;
  onUpdateProfile?: (updatedUser: Usuario) => void;
  isLoading?: boolean;
  loadError?: string | null;
  onRefreshUser?: () => Promise<void>;
}

type RailAction = 'none' | 'config' | 'notifications';
type ActiveRailAction = Exclude<RailAction, 'none'> | 'widgets';
const RIGHT_RAIL_ACTIVE_ACTION_STORAGE_KEY = 'right_rail_active_action_v1';

const isRailAction = (value: string): value is ActiveRailAction | 'none' =>
  value === 'none' || value === 'config' || value === 'notifications' || value === 'widgets';

const RightRail: React.FC<RightRailProps> = ({
  userName,
  currentUser,
  onUpdateProfile,
  isLoading = false,
  loadError = null,
  onRefreshUser,
}) => {
  const displayName = currentUser?.nome || userName || 'Usuário';
  const [activeRailAction, setActiveRailAction] = useState<ActiveRailAction | 'none'>(() => {
    try {
      const savedAction = localStorage.getItem(RIGHT_RAIL_ACTIVE_ACTION_STORAGE_KEY);
      return savedAction && isRailAction(savedAction) ? savedAction : 'none';
    } catch {
      return 'none';
    }
  });
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { errors, removeError, isLocked, setAuthLocked } = useError();
  const { selectedKeys, setSelectedKeys, restoreDefaultWidgets, widgetOptions } = useHomeWidgets();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomeRoute = location.pathname.startsWith('/home');
  const selectorOptions = widgetOptions.map((option) => ({
    value: option.value,
    label: option.label,
  }));

  React.useEffect(() => {
    try {
      if (activeRailAction === 'none') {
        localStorage.removeItem(RIGHT_RAIL_ACTIVE_ACTION_STORAGE_KEY);
        return;
      }
      localStorage.setItem(RIGHT_RAIL_ACTIVE_ACTION_STORAGE_KEY, activeRailAction);
    } catch {
      // Ignore localStorage write failures.
    }
  }, [activeRailAction]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();

    document.cookie.split(';').forEach((cookie) => {
      document.cookie = cookie
        .replace(/^ +/, '')
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });

    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }

    setAuthLocked(false);
    navigate('/login', { replace: true });
    window.location.href = '/login';
  };

  const openProfileModal = () => {
    setActiveRailAction('none');
    setIsDrawerOpen(false);
    setShowConfigModal(true);
  };

  const handleWidgetSelectionChange = (values: Array<string | number>) => {
    const nextKeys = normalizeHomeWidgetKeys(values);
    if (!nextKeys.length) {
      message.warning('Selecione ao menos um widget.');
      return;
    }
    setSelectedKeys(nextKeys);
  };

  const openActionModal = (action: ActiveRailAction, drawerMode: boolean) => {
    if (isLocked) return;
    if (drawerMode) setIsDrawerOpen(false);
    setActiveRailAction(action);
  };

  const renderRailBody = (drawerMode: boolean) => {
    const inactiveActionButtonClass = drawerMode
      ? 'p-2 rounded-lg transition-colors bg-slate-100 hover:bg-slate-200 text-slate-700'
      : 'p-2 rounded-lg transition-colors text-white hover:bg-black/40';
    const activeActionButtonClass = drawerMode
      ? 'p-2 rounded-lg transition-colors bg-slate-200 text-slate-800'
      : 'p-2 rounded-lg transition-colors bg-black/80 inset-shadow-[0px_0px_10px_0px_#452D2C] text-white';

    const userCardClass = drawerMode
      ? 'mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4'
      : 'mt-6 rounded-xl border border-white/10 bg-black/20 p-4';

    if (!drawerMode) {
      return (
        <div className="flex h-full flex-col items-center py-3">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => openActionModal('config', false)}
              disabled={isLocked}
              className={`${
                activeRailAction === 'config' ? activeActionButtonClass : inactiveActionButtonClass
              } ${isLocked ? 'cursor-not-allowed opacity-60' : ''}`}
              title={isLocked ? 'Bloqueado - Faça logout' : 'Configurações'}
            >
              <SettingFilled style={{ fontSize: 20 }} />
            </button>

            <button
              onClick={() => openActionModal('notifications', false)}
              disabled={isLocked}
              className={`${
                activeRailAction === 'notifications'
                  ? activeActionButtonClass
                  : inactiveActionButtonClass
              } ${isLocked ? 'cursor-not-allowed opacity-60' : ''}`}
              title={isLocked ? 'Bloqueado - Faça logout' : 'Notificações'}
            >
              <BellFilled style={{ fontSize: 20 }} />
            </button>

            {isHomeRoute && (
              <button
                onClick={() => openActionModal('widgets', false)}
                disabled={isLocked}
                className={`${
                  activeRailAction === 'widgets' ? activeActionButtonClass : inactiveActionButtonClass
                } ${isLocked ? 'cursor-not-allowed opacity-60' : ''}`}
                title={isLocked ? 'Bloqueado - Faça logout' : 'Widgets Home'}
              >
                <AppstoreOutlined style={{ fontSize: 20 }} />
              </button>
            )}
          </div>

          <div className="mt-auto" title={loadError || displayName}>
            <Avatar
              size={38}
              icon={<UserOutlined />}
              className={isLoading ? 'animate-pulse' : ''}
              style={{
                color: '#fff',
                backgroundColor: loadError ? '#dc2626' : '#BA8364',
              }}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-700">Painel</h2>
          <span className="text-xs text-slate-500">Ações</span>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => openActionModal('config', drawerMode)}
            disabled={isLocked}
            className={`${
              activeRailAction === 'config' ? activeActionButtonClass : inactiveActionButtonClass
            } ${isLocked ? 'cursor-not-allowed opacity-60' : ''}`}
            title={isLocked ? 'Bloqueado - Faça logout' : 'Configurações'}
          >
            <SettingFilled style={{ fontSize: 20 }} />
          </button>

          <button
            onClick={() => openActionModal('notifications', drawerMode)}
            disabled={isLocked}
            className={`${
              activeRailAction === 'notifications'
                ? activeActionButtonClass
                : inactiveActionButtonClass
            } ${isLocked ? 'cursor-not-allowed opacity-60' : ''}`}
            title={isLocked ? 'Bloqueado - Faça logout' : 'Notificações'}
          >
            <BellFilled style={{ fontSize: 20 }} />
          </button>
          {isHomeRoute && (
            <button
              onClick={() => openActionModal('widgets', drawerMode)}
              disabled={isLocked}
              className={`${
                activeRailAction === 'widgets' ? activeActionButtonClass : inactiveActionButtonClass
              } ${isLocked ? 'cursor-not-allowed opacity-60' : ''}`}
              title={isLocked ? 'Bloqueado - Faça logout' : 'Widgets Home'}
            >
              <AppstoreOutlined style={{ fontSize: 20 }} />
            </button>
          )}
        </div>

        <div className="flex-1" />

        <div className={userCardClass}>
          <div className="flex items-center gap-3">
            <Avatar
              size={42}
              icon={<UserOutlined />}
              className={isLoading ? 'animate-pulse' : ''}
              style={{
                color: '#fff',
                backgroundColor: loadError ? '#dc2626' : '#BA8364',
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate text-slate-700" title={loadError || displayName}>
                {displayName}
              </div>
              {loadError && <div className="text-xs text-red-400 truncate">{loadError}</div>}
              {isLoading && <div className="text-xs text-slate-500">Carregando...</div>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {isLocked && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-4 text-center">
            <div className="mb-4 text-red-500">
              <ExclamationCircleOutlined style={{ fontSize: '64px' }} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Sessão Inválida</h2>
            <p className="text-slate-600 mb-6">
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

      {errors.length > 0 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 space-y-2 max-w-md w-full px-4 z-[10000]">
          {errors.map((error) => (
            <div
              key={error.id}
              className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-2xl flex items-start gap-3"
              style={{
                animation: 'slideInDown 0.4s ease-out, fadeOut 0.5s ease-in 4.5s forwards',
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

      <aside className="hidden lg:flex w-16 min-w-[4rem] h-full border-l border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="w-full h-full p-2">{renderRailBody(false)}</div>
      </aside>

      <button
        className="lg:hidden fixed top-4 right-4 z-30 p-3 rounded-full bg-black/60 text-white backdrop-blur-sm border border-white/20"
        onClick={() => setIsDrawerOpen(true)}
        disabled={isLocked}
        title="Abrir painel"
      >
        <SettingFilled style={{ fontSize: 18 }} />
      </button>

      <Drawer
        title="Painel"
        placement="right"
        width={280}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        {renderRailBody(true)}
      </Drawer>

      <Modal
        title="Configurações"
        open={activeRailAction === 'config'}
        onCancel={() => setActiveRailAction('none')}
        footer={null}
        destroyOnClose
      >
        <div className="space-y-2">
          <button
            className="w-full text-left px-3 py-2 rounded hover:bg-slate-100 text-sm text-slate-700"
            onClick={openProfileModal}
          >
            Configurações do Perfil
          </button>
          <button className="w-full text-left px-3 py-2 rounded hover:bg-slate-100 text-sm text-slate-700">
            Configurações de Notificações
          </button>
          {onRefreshUser && (
            <button
              className="w-full text-left px-3 py-2 rounded hover:bg-slate-100 text-sm text-slate-700 disabled:opacity-50"
              onClick={async () => {
                try {
                  await onRefreshUser();
                  setActiveRailAction('none');
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
              className="w-full text-left px-3 py-2 rounded hover:bg-slate-100 text-sm text-red-600 flex items-center gap-2"
            >
              <LogoutOutlined />
              Sair
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        title="Notificações"
        open={activeRailAction === 'notifications'}
        onCancel={() => setActiveRailAction('none')}
        footer={null}
        destroyOnClose
      >
        <div className="text-center text-slate-500 py-2">Nenhuma notificação</div>
      </Modal>

      <Modal
        title="Widgets Home"
        open={activeRailAction === 'widgets'}
        onCancel={() => setActiveRailAction('none')}
        footer={null}
        destroyOnClose
      >
        <Checkbox.Group
          value={selectedKeys}
          options={selectorOptions}
          onChange={handleWidgetSelectionChange}
          className="grid gap-2"
        />
        <Button
          type="link"
          size="small"
          onClick={restoreDefaultWidgets}
          className="px-0 mt-2"
        >
          Restaurar padrão
        </Button>
      </Modal>

      <ConfigModal
        open={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        currentUser={currentUser}
        onUpdateProfile={onUpdateProfile || (() => {})}
      />
    </>
  );
};

export default RightRail;
