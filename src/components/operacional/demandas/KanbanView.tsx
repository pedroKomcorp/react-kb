import React from 'react';
import type { Etapa, StatusEtapaEnum } from '../../../types/etapa';
import type { Usuario } from '../../../types/usuario';
import { Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';

// Define a more detailed type for the props
type EtapaWithDetails = Etapa & { 
    projetoNome?: string; 
    responsavel?: Usuario;
    // This property is not in the base Etapa type, so it needs to be optional or handled carefully
    prioridade?: 'UT' | 'AL' | 'MD' | 'BA'; 
};

interface KanbanViewProps {
  etapas: EtapaWithDetails[];
  onEtapaClick: (etapa: Etapa) => void;
  onUpdateEtapaStatus: (etapaId: number, newStatus: StatusEtapaEnum) => void;
}

const KanbanView: React.FC<KanbanViewProps> = ({ etapas, onEtapaClick, onUpdateEtapaStatus }) => {
  // Column definitions for the Kanban board
  const kanbanColumns = [
    { id: 'NI', title: 'A fazer', color: 'bg-gray-400' },
    { id: 'EA', title: 'Em andamento', color: 'bg-[#bde5f4]' },
    { id: 'P', title: 'Pausado', color: 'bg-[#f7debc]' },
    { id: 'C', title: 'Concluído', color: 'bg-[#d3f4d4]' },
  ];

  // Mapping for priority display
  const priorities: Record<string, { label: string; color: string }> = {
    'UT': { label: 'Urgente', color: 'red' },
    'AL': { label: 'Alta', color: 'orange' },
    'MD': { label: 'Média', color: 'blue' },
    'BA': { label: 'Baixa', color: 'green' },
  };

  // Filter etapas for a specific status column
  const getEtapasByStatus = (statusId: string) => {
    return etapas.filter(etapa => etapa.status === statusId);
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, etapaId: number) => {
    e.dataTransfer.setData('etapaId', etapaId.toString());
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: StatusEtapaEnum) => {
    e.preventDefault();
    const etapaId = parseInt(e.dataTransfer.getData('etapaId'), 10);
    const etapa = etapas.find(e => e.id === etapaId);
    // Only trigger update if the status is actually different
    if (etapa && etapa.status !== newStatus) {
      onUpdateEtapaStatus(etapaId, newStatus);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  return (
    <div className="flex-grow bg-white rounded-lg shadow p-4 overflow-hidden h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
        {kanbanColumns.map(status => (
          <div
            key={status.id}
            className={`${status.color} rounded-lg p-3 flex flex-col h-full`}
            onDrop={(e) => handleDrop(e, status.id as StatusEtapaEnum)}
            onDragOver={handleDragOver}
          >
            {/* Column Header */}
            <h3 className="font-bold text-white mb-3 flex items-center sticky top-0 bg-black/20 py-2 px-1 rounded z-10">
              <span>{status.title}</span>
              <span className="ml-auto text-sm bg-white/20 rounded-full px-2 py-0.5">{getEtapasByStatus(status.id).length}</span>
            </h3>
            {/* Column Content */}
            <div className="flex-grow space-y-3 overflow-y-auto pr-1">
              {getEtapasByStatus(status.id).map(etapa => (
                <div
                  key={etapa.id}
                  className="bg-white rounded-lg p-3 shadow-sm cursor-grab hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={(e) => handleDragStart(e, etapa.id)}
                  onClick={() => onEtapaClick(etapa)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-semibold text-gray-800 text-sm">{etapa.nome}</p>
                    {etapa.prioridade && priorities[etapa.prioridade] && (
                      <Tag color={priorities[etapa.prioridade].color}>{priorities[etapa.prioridade].label}</Tag>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-2 truncate">{etapa.projetoNome}</p>
                  <div className="flex items-center text-xs text-gray-600">
                    <UserOutlined className="mr-1" />
                    <span>{etapa.responsavel?.nome || 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanView;
