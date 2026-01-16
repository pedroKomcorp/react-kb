import React from 'react';
import type { Projeto } from '../../../types/projeto';
import { Tag, Progress, Tooltip, Avatar } from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FlagOutlined,
} from '@ant-design/icons';
import './kanban-scrollbar.css';

interface ProjetoKanbanViewProps {
  projetos: Projeto[];
  onProjetoClick: (projeto: Projeto) => void;
  onUpdateProjetoStatus: (projetoId: number, newStatus: 'NI' | 'EA' | 'C' | 'P') => void;
}

const ProjetoKanbanView: React.FC<ProjetoKanbanViewProps> = ({
  projetos,
  onProjetoClick,
  onUpdateProjetoStatus,
}) => {
  // Column definitions for the Kanban board
  const kanbanColumns = [
    { id: 'NI', title: 'Não Iniciado', bgColor: 'bg-slate-200', headerBg: 'bg-slate-500' },
    { id: 'EA', title: 'Em Andamento', bgColor: 'bg-blue-100', headerBg: 'bg-blue-500' },
    { id: 'P', title: 'Pausado', bgColor: 'bg-amber-100', headerBg: 'bg-amber-500' },
    { id: 'C', title: 'Concluído', bgColor: 'bg-emerald-100', headerBg: 'bg-emerald-500' },
  ];

  // Mapping for priority display with icons
  const priorities: Record<string, { label: string; color: string; bgColor: string }> = {
    UT: { label: 'Urgente', color: '#dc2626', bgColor: 'bg-red-50 border-red-200' },
    AL: { label: 'Alta', color: '#ea580c', bgColor: 'bg-orange-50 border-orange-200' },
    MD: { label: 'Média', color: '#2563eb', bgColor: 'bg-blue-50 border-blue-200' },
    BA: { label: 'Baixa', color: '#16a34a', bgColor: 'bg-green-50 border-green-200' },
  };

  // Mapping for category display
  const categories: Record<string, { label: string; color: string; shortLabel: string }> = {
    CP: { label: 'Compensação', color: 'purple', shortLabel: 'CP' },
    RC: { label: 'Recuperação de Crédito', color: 'green', shortLabel: 'RC' },
    AO: { label: 'Análise de Oportunidade', color: 'cyan', shortLabel: 'AO' },
    AU: { label: 'Auditoria', color: 'orange', shortLabel: 'AU' },
    CM: { label: 'Comparativo', color: 'blue', shortLabel: 'CM' },
    PL: { label: 'Planejamento', color: 'geekblue', shortLabel: 'PL' },
    CO: { label: 'Consultoria', color: 'magenta', shortLabel: 'CO' },
    ES: { label: 'Escrituração', color: 'gold', shortLabel: 'ES' },
    RA: { label: 'Radar', color: 'lime', shortLabel: 'RA' },
    ST: { label: 'Solicitação TTD', color: 'volcano', shortLabel: 'ST' },
    OT: { label: 'Outro', color: 'default', shortLabel: 'OT' },
  };

  // Filter projetos for a specific status column
  const getProjetosByStatus = (statusId: string) => {
    return projetos.filter((projeto) => projeto.status === statusId);
  };

  // Calculate etapas progress
  const getEtapasProgress = (projeto: Projeto) => {
    if (!projeto.etapas || projeto.etapas.length === 0) return { completed: 0, total: 0, percent: 0 };
    const completed = projeto.etapas.filter((e) => e.status === 'C').length;
    const total = projeto.etapas.length;
    return { completed, total, percent: Math.round((completed / total) * 100) };
  };

  // Format date for display
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  // Check if deadline is near (within 3 days) or overdue
  const getDeadlineStatus = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const deadline = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays <= 3) return 'soon';
    return 'ok';
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, projetoId: number) => {
    e.dataTransfer.setData('projetoId', projetoId.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: 'NI' | 'EA' | 'C' | 'P') => {
    e.preventDefault();
    const projetoId = parseInt(e.dataTransfer.getData('projetoId'), 10);
    const projeto = projetos.find((p) => p.id === projetoId);

    // Only trigger update if the status is actually different
    if (projeto && projeto.status !== newStatus) {
      onUpdateProjetoStatus(projetoId, newStatus);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Get color for avatar based on name
  const getAvatarColor = (name: string) => {
    const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#eb2f96', '#52c41a', '#1890ff'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Column content background colors (using 200/300 shades for better visibility)
  const contentBgColors: Record<string, string> = {
    'NI': '#BFBCBB', // slate-300
    'EA': '#93c5fd', // blue-300
    'P': '#fcd34d', // amber-300
    'C': '#6ee7b7', // emerald-300
  };

  // ✅ Force "scroll after ~4 cards" (tweak if your card height differs)
  const MAX_VISIBLE_CARDS = 4;
  const ESTIMATED_CARD_HEIGHT_PX = 150; // adjust to match your card density
  const GAP_PX = 8; // gap-2
  const PADDING_Y_PX = 16; // p-2 top+bottom
  const columnContentMaxHeightPx =
    MAX_VISIBLE_CARDS * ESTIMATED_CARD_HEIGHT_PX + (MAX_VISIBLE_CARDS - 1) * GAP_PX + PADDING_Y_PX;

  return (
    // ✅ min-h-0 + h-full help overflow-y-auto actually work inside flex layouts
    <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg p-4 h-full min-h-0 overflow-hidden flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 h-full min-h-0">
        {kanbanColumns.map((column) => {
          const columnProjetos = getProjetosByStatus(column.id);
          const contentBgColor = contentBgColors[column.id as keyof typeof contentBgColors] || '#f3f4f6';

          return (
            <div
              key={column.id}
              className="rounded-xl flex flex-col h-full min-h-0 overflow-hidden"
              style={{ backgroundColor: contentBgColor }}
              onDrop={(e) => handleDrop(e, column.id as 'NI' | 'EA' | 'C' | 'P')}
              onDragOver={handleDragOver}
            >
              {/* Column Header */}
              <div className={`${column.headerBg} px-4 py-2 flex items-center justify-between flex-shrink-0`}>
                <h3 className="font-bold text-white text-sm tracking-wide">{column.title}</h3>
                <span className="text-xs bg-white/30 text-white rounded-full px-2.5 py-1 font-semibold">
                  {columnProjetos.length}
                </span>
              </div>

              {/* Column Content - Scrollable container */}
              <div
                className="flex-1 min-h-0 p-2 gap-2 overflow-y-auto kanban-scroll flex flex-col"
                style={{
                  backgroundColor: contentBgColor,
                  // ✅ ensures the column does NOT keep growing; it scrolls after ~4 cards
                  maxHeight: columnContentMaxHeightPx,
                }}
              >
                {columnProjetos.map((projeto) => {
                  const progress = getEtapasProgress(projeto);
                  const priority = priorities[projeto.prioridade];
                  const category = categories[projeto.categoria];
                  const deadlineStatus = getDeadlineStatus(projeto.data_prazo);

                  return (
                    <div
                      key={projeto.id}
                      className={`bg-white rounded-lg shadow-sm cursor-grab hover:shadow-lg transition-all duration-200 border-l-4 hover:scale-[1.01] flex-shrink-0 ${
                        priority?.bgColor || 'border-gray-200'
                      }`}
                      style={{
                        borderLeftColor: priority?.color,
                      }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, projeto.id)}
                      onClick={() => onProjetoClick(projeto)}
                    >
                      {/* Card Content - Compact Layout */}
                      <div className="p-2 flex flex-col">
                        {/* Top Row: Category & Priority */}
                        <div className="flex items-center justify-between mb-1 flex-shrink-0">
                          {category && (
                            <Tooltip title={category.label}>
                              <Tag color={category.color} className="text-[10px] font-medium px-1.5 py-0 rounded m-0 leading-tight">
                                {category.shortLabel}
                              </Tag>
                            </Tooltip>
                          )}
                          {priority && (
                            <Tooltip title={`Prioridade: ${priority.label}`}>
                              <div className="flex items-center gap-0.5">
                                <FlagOutlined style={{ color: priority.color, fontSize: '10px' }} />
                                <span className="text-[10px] font-semibold" style={{ color: priority.color }}>
                                  {priority.label}
                                </span>
                              </div>
                            </Tooltip>
                          )}
                        </div>

                        {/* Project Name */}
                        <h4 className="font-semibold text-gray-800 text-xs leading-tight mb-1 line-clamp-2 flex-shrink-0">
                          {projeto.nome}
                        </h4>

                        {/* Description preview */}
                        {projeto.descricao && (
                          <p className="text-[10px] text-gray-500 line-clamp-2 leading-tight mb-1">{projeto.descricao}</p>
                        )}

                        {/* Etapas Progress - Compact */}
                        {progress.total > 0 && (
                          <Tooltip title={`${progress.completed} de ${progress.total} etapas concluídas`}>
                            <div className="bg-gray-50 rounded p-1.5 mb-1 flex-shrink-0">
                              <div className="flex items-center justify-between text-[10px] text-gray-600 mb-1">
                                <span className="flex items-center font-medium">
                                  <CheckCircleOutlined className="mr-1 text-green-500" style={{ fontSize: '10px' }} />
                                  Progresso
                                </span>
                                <span className="font-semibold text-gray-700">
                                  {progress.completed}/{progress.total}
                                </span>
                              </div>
                              <Progress
                                percent={progress.percent}
                                size="small"
                                showInfo={false}
                                strokeColor={progress.percent === 100 ? '#10b981' : '#3b82f6'}
                                trailColor="#e5e7eb"
                                style={{ margin: 0 }}
                              />
                            </div>
                          </Tooltip>
                        )}

                        {/* Card Footer */}
                        <div className="flex items-center justify-between flex-shrink-0">
                          {/* Deadline */}
                          {projeto.data_prazo && (
                            <Tooltip title={`Prazo: ${new Date(projeto.data_prazo).toLocaleDateString('pt-BR')}`}>
                              <div
                                className={`flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                  deadlineStatus === 'overdue'
                                    ? 'bg-red-100 text-red-600'
                                    : deadlineStatus === 'soon'
                                      ? 'bg-amber-100 text-amber-600'
                                      : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {deadlineStatus === 'overdue' ? (
                                  <ClockCircleOutlined style={{ fontSize: '10px' }} />
                                ) : (
                                  <CalendarOutlined style={{ fontSize: '10px' }} />
                                )}
                                <span>{formatDate(projeto.data_prazo)}</span>
                              </div>
                            </Tooltip>
                          )}

                          {/* Team Members */}
                          {projeto.anexados && projeto.anexados.length > 0 && (
                            <Tooltip
                              title={
                                <div>
                                  <div className="font-semibold mb-1">Equipe:</div>
                                  {projeto.anexados.map((u) => (
                                    <div key={u.id}>• {u.nome}</div>
                                  ))}
                                </div>
                              }
                            >
                              <Avatar.Group
                                maxCount={2}
                                size={20}
                                maxStyle={{
                                  backgroundColor: '#6366f1',
                                  fontSize: '9px',
                                  width: '20px',
                                  height: '20px',
                                }}
                              >
                                {projeto.anexados.map((user) => (
                                  <Avatar
                                    key={user.id}
                                    size={20}
                                    style={{
                                      backgroundColor: getAvatarColor(user.nome),
                                      fontSize: '9px',
                                    }}
                                  >
                                    {getInitials(user.nome)}
                                  </Avatar>
                                ))}
                              </Avatar.Group>
                            </Tooltip>
                          )}

                          {/* Show user icon if no anexados but there might be a responsible */}
                          {(!projeto.anexados || projeto.anexados.length === 0) && !projeto.data_prazo && (
                            <span className="text-gray-300">
                              <UserOutlined style={{ fontSize: '12px' }} />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Empty state */}
                {columnProjetos.length === 0 && (
                  <div className="flex flex-col items-center justify-center flex-grow text-gray-400">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                      <span className="text-xl">📋</span>
                    </div>
                    <p className="text-xs">Nenhum projeto</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjetoKanbanView;
