import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Avatar, Tooltip, Dropdown, Modal, Form, Input, DatePicker, Select, message } from 'antd';
import { 
  CalendarOutlined, 
  TeamOutlined, 
  ThunderboltOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  MoreOutlined,
  PushpinOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';
import { updateProjeto, getProjetoByID } from '../../../services/projetos';
import { createEtapa, getEtapasByProjeto } from '../../../services/etapas';
import type { Projeto } from '../../../types/projeto';
import type { Usuario } from '../../../types/usuario';

interface ProjetoCarouselCardProps {
  projeto: Projeto;
  usuarios: Usuario[];
  onClick: (e?: React.MouseEvent) => void;
  onUpdate?: (projeto: Projeto) => void;
}

const ProjetoCarouselCard: React.FC<ProjetoCarouselCardProps> = ({ projeto, usuarios, onClick, onUpdate }) => {
  const responsavel = usuarios.find(u => u.id === projeto.responsavel_id);
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<'compact' | 'normal' | 'expanded'>('normal');
  const [etapaModalOpen, setEtapaModalOpen] = useState(false);
  const [creatingEtapa, setCreatingEtapa] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [form] = Form.useForm();

  // Status config with icons and gradients
  const statusConfig: { [key: string]: { label: string; icon: React.ReactNode; gradient: string; textColor: string } } = {
    'EA': { 
      label: 'Em Andamento', 
      icon: <PlayCircleOutlined />, 
      gradient: 'from-blue-500 to-cyan-400',
      textColor: 'text-blue-600'
    },
    'NI': { 
      label: 'Não Iniciado', 
      icon: <ClockCircleOutlined />, 
      gradient: 'from-slate-400 to-gray-300',
      textColor: 'text-slate-600'
    },
    'C': { 
      label: 'Concluído', 
      icon: <CheckCircleOutlined />, 
      gradient: 'from-emerald-500 to-green-400',
      textColor: 'text-emerald-600'
    },
    'P': { 
      label: 'Pausado', 
      icon: <PauseCircleOutlined />, 
      gradient: 'from-amber-500 to-yellow-400',
      textColor: 'text-amber-600'
    },
  };

  // Priority config
  const prioridadeConfig: { [key: string]: { label: string; color: string; dotColor: string } } = {
    'UT': { label: 'Urgente', color: 'text-red-500', dotColor: 'bg-red-500' },
    'AL': { label: 'Alta', color: 'text-orange-500', dotColor: 'bg-orange-500' },
    'MD': { label: 'Média', color: 'text-yellow-500', dotColor: 'bg-yellow-500' },
    'BA': { label: 'Baixa', color: 'text-green-500', dotColor: 'bg-green-500' },
  };

  // Category config with colors and abbreviations
  const categoriaConfig: { [key: string]: { label: string; abbrev: string; bgColor: string; textColor: string } } = {
    'CP': { label: 'Compensação', abbrev: 'CP', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
    'RC': { label: 'Recuperação de Crédito', abbrev: 'RC', bgColor: 'bg-indigo-100', textColor: 'text-indigo-700' },
    'AO': { label: 'Análise de Oportunidade', abbrev: 'AO', bgColor: 'bg-cyan-100', textColor: 'text-cyan-700' },
    'AU': { label: 'Auditoria', abbrev: 'AU', bgColor: 'bg-rose-100', textColor: 'text-rose-700' },
    'CM': { label: 'Comparativo', abbrev: 'CM', bgColor: 'bg-teal-100', textColor: 'text-teal-700' },
    'PL': { label: 'Planejamento', abbrev: 'PL', bgColor: 'bg-sky-100', textColor: 'text-sky-700' },
    'CO': { label: 'Consultoria', abbrev: 'CO', bgColor: 'bg-violet-100', textColor: 'text-violet-700' },
    'ES': { label: 'Escrituração', abbrev: 'ES', bgColor: 'bg-fuchsia-100', textColor: 'text-fuchsia-700' },
    'RA': { label: 'Radar', abbrev: 'RA', bgColor: 'bg-lime-100', textColor: 'text-lime-700' },
    'ST': { label: 'Solicitação TTD', abbrev: 'ST', bgColor: 'bg-amber-100', textColor: 'text-amber-700' },
    'OT': { label: 'Outro', abbrev: 'OT', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
  };

  // Calculate progress based on etapas
  const totalEtapas = projeto.etapas?.length || 0;
  const etapasConcluidas = projeto.etapas?.filter(e => e.status === 'C').length || 0;
  const progress = totalEtapas > 0 ? Math.round((etapasConcluidas / totalEtapas) * 100) : 0;

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const updated = await updateProjeto(projeto.id, { status: newStatus as Projeto['status'] }, token || undefined);
      message.success('Status atualizado!');
      onUpdate?.(updated);
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Erro ao atualizar status');
    }
  };

  // Handle create etapa
  const handleCreateEtapa = async (values: { nome: string; descricao?: string; data_prazo?: dayjs.Dayjs; usuario_id: number }) => {
    setCreatingEtapa(true);
    try {
      await createEtapa({
        nome: values.nome,
        descricao: values.descricao || null,
        status: 'NI',
        projeto_id: projeto.id,
        usuario_id: values.usuario_id,
        data_prazo: values.data_prazo?.format('YYYY-MM-DD') || null,
        data_inicio: null,
        data_fim: null,
      });
      message.success('Etapa criada!');
      setEtapaModalOpen(false);
      form.resetFields();
      // Fetch updated project with new etapas
      if (onUpdate) {
        const token = localStorage.getItem('token');
        const [updatedProjeto, etapas] = await Promise.all([
          getProjetoByID(projeto.id, token || undefined),
          getEtapasByProjeto(projeto.id)
        ]);
        onUpdate({ ...updatedProjeto, etapas });
      }
    } catch (error) {
      console.error('Error creating etapa:', error);
      message.error('Erro ao criar etapa');
    } finally {
      setCreatingEtapa(false);
    }
  };

  // Add cache handling for pinned state
  useEffect(() => {
    const cachedPinnedState = localStorage.getItem(`pinned_${projeto.id}`);
    if (cachedPinnedState) {
      setIsPinned(JSON.parse(cachedPinnedState));
    }
  }, [projeto.id]);

  useEffect(() => {
    localStorage.setItem(`pinned_${projeto.id}`, JSON.stringify(isPinned));
  }, [isPinned, projeto.id]);

  // Update "Fixar" action to ensure pinned projects remain at the top
  const handlePinToggle = () => {
    setIsPinned((prev) => !prev);
    message.success(isPinned ? 'Projeto desfixado!' : 'Projeto fixado!');
    onUpdate?.({ ...projeto, isPinned: !isPinned });
  };

  // Status dropdown menu
  const statusMenuItems: MenuProps['items'] = Object.entries(statusConfig).map(([key, config]) => ({
    key,
    label: (
      <div className="flex items-center gap-2">
        <span className={config.textColor}>{config.icon}</span>
        <span>{config.label}</span>
      </div>
    ),
    onClick: () => handleStatusChange(key),
  }));

  // Action menu items
  const actionMenuItems: MenuProps['items'] = [
    {
      key: 'status',
      label: 'Alterar Status',
      children: statusMenuItems,
    },
    {
      key: 'etapa',
      label: (
        <div className="flex items-center gap-2">
          <PlusOutlined />
          <span>Nova Etapa</span>
        </div>
      ),
      onClick: () => setEtapaModalOpen(true),
    },
    {
      key: 'fixar',
      label: (
        <div className="flex items-center gap-2">
          <PushpinOutlined />
          <span>{isPinned ? 'Desfixar' : 'Fixar'}</span>
        </div>
      ),
      onClick: handlePinToggle,
    },
  ];

  useLayoutEffect(() => {
    function checkSize() {
      if (ref.current) {
        const width = ref.current.offsetWidth;
        if (width < 160) {
          setSize('compact');
        } else if (width < 220) {
          setSize('normal');
        } else {
          setSize('expanded');
        }
      }
    }
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const status = statusConfig[projeto.status] || statusConfig['NI'];
  const priority = prioridadeConfig[projeto.prioridade];
  const categoria = categoriaConfig[projeto.categoria] || categoriaConfig['OT'];

  // Get initials for avatar
  const getInitials = (nome: string) => {
    return nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  // Z-index para expanded
  const dropdownZ = size === 'expanded' ? 1000003 : 1000003;
  const modalZ = size === 'expanded' ? 1000003 : 1000003;

  // Renderização condicional do Modal via Portal se expanded
  const etapaModal = (
    <Modal
      title={`Nova Etapa - ${projeto.nome}`}
      open={etapaModalOpen}
      onCancel={() => {
        setEtapaModalOpen(false);
        form.resetFields();
      }}
      onOk={() => form.submit()}
      confirmLoading={creatingEtapa}
      okText="Criar"
      cancelText="Cancelar"
      style={modalZ ? { zIndex: modalZ } : undefined}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleCreateEtapa}
        initialValues={{ usuario_id: Number(localStorage.getItem('user_id')) }}
      >
        <Form.Item
          name="nome"
          label="Nome da Etapa"
          rules={[{ required: true, message: 'Informe o nome da etapa' }]}
        >
          <Input placeholder="Nome da etapa" />
        </Form.Item>
        <Form.Item name="descricao" label="Descrição">
          <Input.TextArea rows={3} placeholder="Descrição (opcional)" />
        </Form.Item>
        <Form.Item name="data_prazo" label="Prazo">
          <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Selecione o prazo" />
        </Form.Item>
        <Form.Item
          name="usuario_id"
          label="Responsável"
          rules={[{ required: true, message: 'Selecione o responsável' }]}
        >
          <Select placeholder="Selecione o responsável">
            {usuarios.map(u => (
              <Select.Option key={u.id} value={u.id}>{u.nome}</Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );

  return (
    <>
      {/* Etapa Modal */}
      {size === 'expanded'
        ? ReactDOM.createPortal(etapaModal, document.body)
        : etapaModal}
    <div
      ref={ref}
      onClick={(e) => {
        // Não abrir modal se dropdown está aberto ou acabou de fechar
        if (dropdownOpen) return;
        e.preventDefault();
        e.stopPropagation();
        onClick(e);
      }}
      className="group relative bg-white rounded-xl cursor-pointer transition-all duration-300 h-full overflow-hidden"
      style={{
        boxSizing: 'border-box',
        minWidth: 120,
        maxWidth: 320,
        width: '100%',
        minHeight: 100,
        boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.1), 0 2px 6px -2px rgba(0, 0, 0, 0.05)',
        opacity: isPinned ? 0.8 : 1, // Make pinned projects slightly lighter
      }}
    >
      {/* Top gradient bar indicating status */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${status.gradient}`} />
      
      {/* Priority indicator dot */}
      {priority && (
        <Tooltip title={priority.label}>
          <div className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${priority.dotColor} animate-pulse`} />
        </Tooltip>
      )}

      <div className="p-3 flex flex-col h-[calc(100%-6px)]">
        {/* Compact Layout */}
        {size === 'compact' && (
          <div className="flex flex-col h-full justify-between">
            <div>
              <Tooltip title={categoria.label}>
                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${categoria.bgColor} ${categoria.textColor} mb-1`}>
                  {categoria.abbrev}
                </span>
              </Tooltip>
              <div className="font-semibold text-xs text-gray-800 line-clamp-2" title={projeto.nome}>
                {projeto.nome}
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className={`text-lg ${status.textColor}`}>{status.icon}</span>
              {totalEtapas > 0 && (
                <span className="text-[10px] text-gray-500">{progress}%</span>
              )}
            </div>
          </div>
        )}

        {/* Normal Layout */}
        {size === 'normal' && (
          <div className="flex flex-col h-full">
            {/* Category badge */}
            <Tooltip title={categoria.label}>
              <span className={`inline-block self-start px-2 py-0.5 rounded-md text-[10px] font-bold ${categoria.bgColor} ${categoria.textColor} mb-1.5`}>
                {categoria.abbrev} • {categoria.label}
              </span>
            </Tooltip>
            
            {/* Header with status icon */}
            <div className="flex items-start gap-2 mb-2">
              <span className={`text-xl ${status.textColor} flex-shrink-0`}>{status.icon}</span>
              <div className="font-semibold text-sm text-gray-800 line-clamp-2 leading-tight" title={projeto.nome}>
                {projeto.nome}
              </div>
            </div>

            {/* Progress bar */}
            {totalEtapas > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${progress}%`,
                        background: progress === 100 
                          ? 'linear-gradient(90deg, #22c55e, #16a34a)' 
                          : 'linear-gradient(90deg, #3b82f6, #06b6d4)'
                      }}
                    />
                  </div>
                  <span className={`text-xs font-bold min-w-[36px] text-right ${
                    progress === 100 ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {progress}%
                  </span>
                </div>
                <div className="text-[10px] text-gray-500">
                  <span className="font-medium text-gray-700">{etapasConcluidas}</span>
                  <span> de </span>
                  <span className="font-medium text-gray-700">{totalEtapas}</span>
                  <span> etapas concluídas</span>
                </div>
              </div>
            )}

            {/* Footer with responsavel */}
            <div className="mt-auto flex items-center gap-2">
              {responsavel && (
                <Tooltip title={responsavel.nome}>
                  <Avatar 
                    size={20} 
                    style={{ 
                      backgroundColor: '#3b82f6',
                      fontSize: '10px'
                    }}
                  >
                    {getInitials(responsavel.nome)}
                  </Avatar>
                </Tooltip>
              )}
              <span className="text-[11px] text-gray-600 truncate flex-1">
                {responsavel?.nome || 'Sem responsável'}
              </span>
            </div>
          </div>
        )}

        {/* Expanded Layout */}
        {size === 'expanded' && (
          <div className="flex flex-col h-full">
            {/* Category badge */}
            <div className={`inline-flex items-center self-start px-2 py-1 rounded-lg text-xs font-bold ${categoria.bgColor} ${categoria.textColor} mb-2`}>
              <span className="mr-1.5 opacity-80">{categoria.abbrev}</span>
              <span>{categoria.label}</span>
            </div>
            
            {/* Header */}
            <div className="flex items-start gap-2 mb-3">
              <div className={`p-1.5 rounded-lg bg-gradient-to-br ${status.gradient} text-white`}>
                <span className="text-base">{status.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-800 line-clamp-2 leading-tight" title={projeto.nome}>
                  {projeto.nome}
                </div>
                <div className={`text-[10px] ${status.textColor} font-medium mt-0.5`}>
                  {status.label}
                </div>
              </div>
            </div>

            {/* Progress section */}
            {totalEtapas > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${progress}%`,
                        background: progress === 100 
                          ? 'linear-gradient(90deg, #22c55e, #16a34a)' 
                          : 'linear-gradient(90deg, #3b82f6, #06b6d4)'
                      }}
                    />
                  </div>
                  <span className={`text-sm font-bold min-w-[40px] text-right ${
                    progress === 100 ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {progress}%
                  </span>
                </div>
                <div className="text-[10px] text-gray-500">
                  <span className="font-medium text-gray-700">{etapasConcluidas}</span>
                  <span> de </span>
                  <span className="font-medium text-gray-700">{totalEtapas}</span>
                  <span> etapas concluídas</span>
                </div>
              </div>
            )}

            {/* Info row */}
            <div className="flex items-center gap-3 text-[10px] text-gray-500 mb-2">
              {projeto.data_inicio && (
                <Tooltip title="Data de início">
                  <div className="flex items-center gap-1">
                    <CalendarOutlined className="text-gray-400" />
                    <span>{new Date(projeto.data_inicio).toLocaleDateString('pt-BR')}</span>
                  </div>
                </Tooltip>
              )}
              {projeto.anexados && projeto.anexados.length > 0 && (
                <Tooltip title="Membros da equipe">
                  <div className="flex items-center gap-1">
                    <TeamOutlined className="text-gray-400" />
                    <span>{projeto.anexados.length}</span>
                  </div>
                </Tooltip>
              )}
              {priority && (
                <Tooltip title={`Prioridade: ${priority.label}`}>
                  <div className={`flex items-center gap-1 ${priority.color}`}>
                    <ThunderboltOutlined />
                    <span className="font-medium">{priority.label}</span>
                  </div>
                </Tooltip>
              )}
            </div>

            {/* Footer */}
            <div className="mt-auto pt-2 border-t border-gray-100 flex items-center gap-2">
              {responsavel && (
                <Avatar 
                  size={24} 
                  style={{ 
                    backgroundColor: '#3b82f6',
                    fontSize: '11px'
                  }}
                >
                  {getInitials(responsavel.nome)}
                </Avatar>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-700 font-medium truncate">
                  {responsavel?.nome || 'Sem responsável'}
                </div>
              </div>
              {/* Action button */}
              <Dropdown 
                menu={{ items: actionMenuItems }} 
                trigger={['click']} 
                placement="bottomRight"
                onOpenChange={(open) => setDropdownOpen(open)}
                overlayStyle={{ zIndex: dropdownZ }}
              >
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 bg-gray-100 hover:bg-blue-100 rounded-lg transition-colors border border-gray-200 hover:border-blue-300"
                >
                  <MoreOutlined className="text-gray-600 hover:text-blue-600 text-base" />
                </button>
              </Dropdown>
            </div>
          </div>
        )}
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl" />

      {/* Action button for compact/normal sizes */}
      {(size === 'compact' || size === 'normal') && (
        <Dropdown 
          menu={{ items: actionMenuItems }} 
          trigger={['click']} 
          placement="bottomRight"
          onOpenChange={(open) => setDropdownOpen(open)}
          overlayStyle={{ zIndex: dropdownZ }}
        >
          <button
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-2 right-2 p-1.5 bg-white/90 hover:bg-blue-100 rounded-lg transition-all border border-gray-300 hover:border-blue-400 shadow-sm"
          >
            <MoreOutlined className="text-gray-600 hover:text-blue-600 text-sm" />
          </button>
        </Dropdown>
      )}

      {/* Pinned icon */}
      {isPinned && (
        <div className="flex items-center gap-2">
          {priority && (
            <Tooltip title={`Prioridade: ${priority.label}`}>
              <div className={`flex items-center gap-1 ${priority.color}`}>
                <ThunderboltOutlined />
                <span className="font-medium">{priority.label}</span>
              </div>
            </Tooltip>
          )}
          {isPinned && (
            <Tooltip title="Projeto fixado">
              <PushpinOutlined className="text-blue-500 text-lg" />
            </Tooltip>
          )}
        </div>
      )}
    </div>
    </>
  );
};

export default ProjetoCarouselCard;
