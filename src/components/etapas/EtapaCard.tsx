
import React from 'react';
import { Card, Button, Popconfirm, Tag, Tooltip, Typography } from 'antd';
import { FolderOpenOutlined } from '@ant-design/icons';
import type { Etapa } from '../../types/etapa';

interface EtapaCardProps {
  etapa: Etapa & { projetoNome: string; projetoId: number };
  onClick: () => void;
  onDeleteEtapa: (etapaId: number) => void;
}

const { Text } = Typography;


const statusMap: Record<string, { color: string; label: string }> = {
  NI: { color: 'default', label: 'Não Iniciada' },
  EA: { color: 'processing', label: 'Em Andamento' },
  C: { color: 'success', label: 'Concluída' },
  P: { color: 'warning', label: 'Pausada' },
};

const EtapaCard: React.FC<EtapaCardProps> = ({ etapa, onClick, onDeleteEtapa }) => (
  <Card
    className="rounded-lg shadow bg-white w-full transition-all duration-200 cursor-pointer hover:border-blue-400 border border-gray-200"
    onClick={onClick}
    title={
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpenOutlined className="text-blue-500 text-base" />
          <span className="font-semibold text-base">{etapa.nome}</span>
          <Text type="secondary" className="ml-2">({etapa.projetoNome})</Text>
        </div>
        <Tooltip title="Status da Etapa">
          <Tag color={statusMap[etapa.status]?.color || 'default'}>{statusMap[etapa.status]?.label || etapa.status}</Tag>
        </Tooltip>
      </div>
    }
  >
    <div className="flex justify-end mt-2">
      <Popconfirm title="Tem certeza que deseja deletar esta etapa?" onConfirm={e => { e?.stopPropagation(); onDeleteEtapa(etapa.id); }} okText="Sim" cancelText="Não">
        <Button danger size="small" onClick={e => e.stopPropagation()}>Deletar</Button>
      </Popconfirm>
    </div>
  </Card>
);

export default EtapaCard;
