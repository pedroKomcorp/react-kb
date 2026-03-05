import React, { useState } from 'react';
import {
  AppstoreOutlined,
  BellFilled,
  CloseOutlined,
  ExclamationCircleOutlined,
  LogoutOutlined,
  SettingFilled,
  UserOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Checkbox,
  Divider,
  Drawer,
  Empty,
  Modal,
  Space,
  Tag,
  Typography,
  message,
  type DrawerProps,
} from 'antd';
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
const RAIL_ACTION_ORDER: ActiveRailAction[] = ['config', 'notifications', 'widgets'];
const RAIL_ACTION_LABELS: Record<ActiveRailAction, string> = {
  config: 'Configurações',
  notifications: 'Notificações',
  widgets: 'Widgets Home',
};
const SHELL_COLORS = {
  deep: '#05060a',
  panel: '#1f1e27',
  accent: '#BA8364',
  accentStrong: '#775343',
  accentShadow: '#452D2C',
  white: '#fff',
};

const isRailAction = (value: string): value is ActiveRailAction | 'none' =>
  value === 'none' || value === 'config' || value === 'notifications' || value === 'widgets';

const getActionIcon = (action: ActiveRailAction, size = 18) => {
  if (action === 'config') {
    return <SettingFilled style={{ fontSize: size }} />;
  }
  if (action === 'notifications') {
    return <BellFilled style={{ fontSize: size }} />;
  }
  return <AppstoreOutlined style={{ fontSize: size }} />;
};

const drawerShellStyles: NonNullable<DrawerProps['styles']> = {
  header: {
    background: `linear-gradient(180deg, ${SHELL_COLORS.panel} 0%, ${SHELL_COLORS.deep} 100%)`,
    borderBottom: `1px solid ${SHELL_COLORS.accentShadow}`,
    color: SHELL_COLORS.white,
  },
  body: {
    background: `linear-gradient(180deg, ${SHELL_COLORS.panel} 0%, ${SHELL_COLORS.deep} 100%)`,
    color: SHELL_COLORS.white,
  },
  content: {
    borderLeft: `1px solid ${SHELL_COLORS.accentShadow}`,
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
  },
};

const panelCardStyle: React.CSSProperties = {
  background: 'rgba(31, 30, 39, 0.85)',
  border: '1px solid rgba(255, 255, 255, 0.10)',
};

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

  const visibleActions = RAIL_ACTION_ORDER.filter((action) => action !== 'widgets' || isHomeRoute);

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

  const closeActionPanel = () => setActiveRailAction('none');

  const renderActionIconButton = (action: ActiveRailAction, drawerMode: boolean) => {
    const isActive = activeRailAction === action;
    const baseClass =
      '!w-10 !h-10 !rounded-lg !border !transition-all !duration-200';
    const activeClass =
      '!border-[#452D2C] !bg-black/80 !text-[#775343] inset-shadow-[0px_0px_10px_0px_#452D2C]';
    const inactiveClass = drawerMode
      ? '!border-white/10 !bg-black/30 !text-slate-200 hover:!bg-black/40 hover:!text-white hover:inset-shadow-[0px_0px_10px_0px_#452D2C]'
      : '!border-transparent !bg-transparent !text-white hover:!bg-black/40 hover:inset-shadow-[0px_0px_10px_0px_#452D2C]';

    return (
      <Button
        key={action}
        type="text"
        icon={getActionIcon(action, 20)}
        onClick={() => openActionModal(action, drawerMode)}
        disabled={isLocked}
        title={isLocked ? 'Bloqueado - Faça logout' : RAIL_ACTION_LABELS[action]}
        className={`${baseClass} ${isActive ? activeClass : inactiveClass} ${
          isLocked ? '!opacity-60' : ''
        }`}
      />
    );
  };

  const renderRailBody = (drawerMode: boolean) => {
    if (!drawerMode) {
      return (
        <div className="flex h-full flex-col items-center py-3">
          <Space direction="vertical" size={8}>
            {renderActionIconButton('config', false)}
            {renderActionIconButton('notifications', false)}
            {isHomeRoute && renderActionIconButton('widgets', false)}
          </Space>

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
          <Typography.Title level={5} style={{ margin: 0, color: '#f1f5f9' }}>
            Painel
          </Typography.Title>
          <Typography.Text style={{ color: '#94a3b8', fontSize: 12 }}>Ações</Typography.Text>
        </div>

        <Space size={8} style={{ marginTop: 12 }}>
          {renderActionIconButton('config', true)}
          {renderActionIconButton('notifications', true)}
          {isHomeRoute && renderActionIconButton('widgets', true)}
        </Space>

        <div className="flex-1" />

        <Card
          style={{ ...panelCardStyle, marginTop: 24 }}
          styles={{ body: { padding: 12 } }}
        >
          <Space align="start" size={12}>
            <Avatar
              size={42}
              icon={<UserOutlined />}
              className={isLoading ? 'animate-pulse' : ''}
              style={{
                color: '#fff',
                backgroundColor: loadError ? '#dc2626' : '#BA8364',
              }}
            />
            <div className="min-w-0">
              <Typography.Text
                strong
                style={{ color: '#f1f5f9' }}
                title={loadError || displayName}
              >
                {displayName}
              </Typography.Text>
              {loadError && (
                <div className="text-xs text-red-400 truncate">{loadError}</div>
              )}
              {isLoading && (
                <div className="text-xs text-slate-400">Carregando...</div>
              )}
            </div>
          </Space>
        </Card>
      </div>
    );
  };

  const renderActionPanelContent = () => {
    if (activeRailAction === 'none') {
      return null;
    }

    if (activeRailAction === 'config') {
      return (
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Card style={panelCardStyle} styles={{ body: { padding: 12 } }}>
            <Typography.Text style={{ color: '#94a3b8', fontSize: 12 }}>
              CONTA
            </Typography.Text>
            <Space direction="vertical" size={8} style={{ width: '100%', marginTop: 8 }}>
              <Button
                type="text"
                block
                onClick={openProfileModal}
                className="!justify-start !text-slate-100 hover:!bg-black/40"
              >
                Configurações do Perfil
              </Button>
              <Button
                type="text"
                block
                className="!justify-start !text-slate-100 hover:!bg-black/40"
              >
                Configurações de Notificações
              </Button>
              {onRefreshUser && (
                <Button
                  type="text"
                  block
                  onClick={async () => {
                    try {
                      await onRefreshUser();
                      closeActionPanel();
                    } catch (error) {
                      console.error('Failed to refresh user data:', error);
                    }
                  }}
                  loading={isLoading}
                  disabled={isLoading}
                  className="!justify-start !text-slate-100 hover:!bg-black/40"
                >
                  Recarregar Perfil
                </Button>
              )}
            </Space>
          </Card>

          <Card style={panelCardStyle} styles={{ body: { padding: 12 } }}>
            <Typography.Text style={{ color: '#94a3b8', fontSize: 12 }}>
              SESSÃO
            </Typography.Text>
            <Divider style={{ margin: '8px 0', borderColor: 'rgba(255,255,255,0.10)' }} />
            <Button
              danger
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              block
              className="!justify-start hover:!bg-red-500/10"
            >
              Sair
            </Button>
          </Card>
        </Space>
      );
    }

    if (activeRailAction === 'notifications') {
      return (
        <Card style={panelCardStyle} styles={{ body: { padding: 16 } }}>
          <Typography.Text style={{ color: '#94a3b8', fontSize: 12 }}>
            STATUS
          </Typography.Text>
          <div style={{ marginTop: 12 }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<Typography.Text style={{ color: '#cbd5e1' }}>Nenhuma notificação</Typography.Text>}
            />
          </div>
        </Card>
      );
    }

    return (
      <Card style={panelCardStyle} styles={{ body: { padding: 12 } }}>
        <Typography.Text style={{ color: '#94a3b8', fontSize: 12 }}>
          WIDGETS DA HOME
        </Typography.Text>
        <div style={{ marginTop: 8 }}>
          <Checkbox.Group
            value={selectedKeys}
            options={selectorOptions}
            onChange={handleWidgetSelectionChange}
            className="grid gap-2 text-slate-100"
          />
        </div>
        <Button
          type="link"
          size="small"
          onClick={restoreDefaultWidgets}
          className="!px-0 !mt-2 !text-[#BA8364] hover:!text-[#d8a98d]"
        >
          Restaurar padrão
        </Button>
      </Card>
    );
  };

  return (
    <>
      <Modal
        open={isLocked}
        closable={false}
        footer={null}
        maskClosable={false}
        centered
        width={420}
      >
        <Space direction="vertical" size={14} style={{ width: '100%', textAlign: 'center' }}>
          <ExclamationCircleOutlined style={{ color: '#ef4444', fontSize: 56 }} />
          <Typography.Title level={4} style={{ margin: 0 }}>
            Sessão Inválida
          </Typography.Title>
          <Typography.Text type="secondary">
            Suas credenciais não puderam ser validadas. Por favor, faça logout e entre novamente.
          </Typography.Text>
          <Button danger type="primary" icon={<LogoutOutlined />} onClick={handleLogout} block>
            Fazer Logout
          </Button>
        </Space>
      </Modal>

      {errors.length > 0 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 max-w-md w-full px-4 z-[10000]">
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            {errors.map((error) => (
              <Alert
                key={error.id}
                message={error.message}
                type="error"
                showIcon
                closable
                onClose={() => removeError(error.id)}
              />
            ))}
          </Space>
        </div>
      )}

      <aside className="hidden lg:flex w-16 min-w-[4rem] h-full border-l border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="w-full h-full p-2">{renderRailBody(false)}</div>
      </aside>

      <Button
        type="text"
        shape="circle"
        icon={<SettingFilled style={{ fontSize: 18, color: '#fff' }} />}
        onClick={() => setIsDrawerOpen(true)}
        disabled={isLocked}
        title="Abrir painel"
        className="lg:!hidden !fixed !top-4 !right-4 !z-30 !w-11 !h-11 !bg-black/60 !border !border-white/20 hover:!bg-black/70"
      />

      <Drawer
        title="Painel"
        placement="right"
        width={280}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        closeIcon={<CloseOutlined style={{ color: SHELL_COLORS.white }} />}
        styles={drawerShellStyles}
      >
        {renderRailBody(true)}
      </Drawer>

      <Drawer
        title={activeRailAction === 'none' ? 'Painel' : RAIL_ACTION_LABELS[activeRailAction]}
        placement="right"
        width={380}
        open={activeRailAction !== 'none'}
        onClose={closeActionPanel}
        closeIcon={<CloseOutlined style={{ color: SHELL_COLORS.white }} />}
        destroyOnClose
        styles={drawerShellStyles}
      >
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Card style={panelCardStyle} styles={{ body: { padding: 12 } }}>
            <Space align="center" size={8} style={{ marginBottom: 6 }}>
              <Tag
                bordered={false}
                style={{ background: 'rgba(186, 131, 100, 0.15)', color: '#d8a98d', margin: 0 }}
              >
                Ações rápidas
              </Tag>
            </Space>
            <Typography.Text style={{ color: '#cbd5e1' }}>
              Gerencie preferências, avisos e widgets.
            </Typography.Text>
          </Card>

          <Space wrap size={8}>
            {visibleActions.map((action) => {
              const isActive = activeRailAction === action;
              return (
                <Button
                  key={action}
                  type="text"
                  icon={getActionIcon(action)}
                  onClick={() => setActiveRailAction(action)}
                  className={`!rounded-lg !border !h-9 ${
                    isActive
                      ? '!border-[#452D2C] !bg-black/80 !text-[#775343] inset-shadow-[0px_0px_10px_0px_#452D2C]'
                      : '!border-white/10 !bg-black/20 !text-slate-200 hover:!bg-black/40 hover:!border-white/20 hover:!text-white'
                  }`}
                >
                  {RAIL_ACTION_LABELS[action]}
                </Button>
              );
            })}
          </Space>

          {renderActionPanelContent()}
        </Space>
      </Drawer>

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
