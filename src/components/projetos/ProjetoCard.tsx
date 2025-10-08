
import React from 'react';
import { Card, Button, Popconfirm, Tag, Tooltip, Space } from 'antd';
import { UserOutlined, FolderOpenOutlined } from '@ant-design/icons';
import type { Projeto } from '../../types/projeto';
import type { Usuario } from '../../types/usuario';

interface ProjetoCardProps {
  projeto: Projeto;
  usuarios: Usuario[];
  onClick: () => void;
  onAddEtapa: (projetoId: number) => void;
  onDeleteProjeto: (projetoId: number) => void;
  showDeleteButton?: boolean;
  showStatus?: boolean;
}


const statusMap: Record<string, { color: string; label: string }> = {
  NI: { color: 'default', label: 'Não Iniciado' },
  EA: { color: 'processing', label: 'Em Andamento' },
  C: { color: 'success', label: 'Concluído' },
  P: { color: 'warning', label: 'Pausado' },
};
const prioridadeMap: Record<string, { color: string; label: string }> = {
  UT: { color: 'red', label: 'Urgente' },
  AL: { color: 'orange', label: 'Alta' },
  MD: { color: 'blue', label: 'Média' },
  BA: { color: 'green', label: 'Baixa' },
};
const categoriaMap: Record<string, { color: string; label: string }> = {
  DV: { color: 'geekblue', label: 'Desenvolvimento' },
  MK: { color: 'purple', label: 'Marketing' },
  OT: { color: 'default', label: 'Outros' },
};

const ProjetoCard: React.FC<ProjetoCardProps> = ({ projeto, usuarios, onClick, onDeleteProjeto, showDeleteButton = true, showStatus = true }) => (
  <Card
    className="rounded-lg shadow  bg-white w-full transition-all duration-200 cursor-pointer hover:border-blue-400 border border-gray-200 p-2"
    onClick={onClick}
    title={
      <div className="flex flex-col gap-0.5 md:flex-row md:items-center md:justify-between min-h-0">
        <div className="flex items-center gap-1">
          <FolderOpenOutlined className="text-blue-500 text-base" />
          <span className="font-semibold text-sm md:text-base leading-tight">{projeto.nome}</span>
        </div>
        <Space size={2} className="mt-1 md:mt-0">
          {showStatus ? (
            <Tooltip title="Status do Projeto">
              <Tag color={statusMap[projeto.status]?.color || 'default'}>{statusMap[projeto.status]?.label || projeto.status}</Tag>
            </Tooltip>
          ) : null}
          <Tooltip title="Prioridade">
            <Tag color={prioridadeMap[projeto.prioridade]?.color || 'default'}>{prioridadeMap[projeto.prioridade]?.label || projeto.prioridade}</Tag>
          </Tooltip>
          <Tooltip title="Categoria">
            <Tag color={categoriaMap[projeto.categoria]?.color || 'default'}>{categoriaMap[projeto.categoria]?.label || projeto.categoria}</Tag>
          </Tooltip>
        </Space>
      </div>
    }
  >
    <div className="flex items-center gap-1 text-gray-500 text-[11px] mb-1 min-h-0">
      <UserOutlined className="text-blue-400 text-xs" />
      <span>
        Responsável: {
          usuarios.find(u => u.id === projeto.responsavel_id)
            ? `${usuarios.find(u => u.id === projeto.responsavel_id)?.nome}`
            : `Responsável não encontrado`
        }
      </span>
      <span className="ml-2 font-medium text-gray-600">Etapas: <span className="font-semibold">{projeto.etapas ? projeto.etapas.length : 0}</span></span>
    </div>
    {showDeleteButton && (
      <div className="flex justify-end mt-1">
        <Popconfirm title="Tem certeza que deseja deletar este projeto?" onConfirm={e => { e?.stopPropagation(); onDeleteProjeto(projeto.id); }} okText="Sim" cancelText="Não">
          <Button danger size="small" onClick={e => e.stopPropagation()}>Deletar Projeto</Button>
        </Popconfirm>
      </div>
    )}
  </Card>
);

export default ProjetoCard;
