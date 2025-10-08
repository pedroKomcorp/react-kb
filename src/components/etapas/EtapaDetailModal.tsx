import React from 'react';
import { Modal, Descriptions, Tag, Typography } from 'antd';
import { UserOutlined, ClockCircleOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import type { Etapa } from '../../types/etapa';
import type { Usuario } from '../../types/usuario';

interface EtapaDetailModalProps {
  etapa: Etapa | null;
  usuarios: Usuario[];
  open: boolean;
  onClose: () => void;
}

const { Title } = Typography;

const statusOptions = [
  { value: 'NI', label: 'Não Iniciada', color: 'default' },
  { value: 'EA', label: 'Em Andamento', color: 'processing' },
  { value: 'C', label: 'Concluída', color: 'success' },
  { value: 'P', label: 'Pausada', color: 'warning' },
];

const getStatusTag = (status: string) => {
  const option = statusOptions.find(opt => opt.value === status);
  return <Tag color={option?.color || 'default'}>{option?.label || status}</Tag>;
};

// Helper to format date for display
const formatDateForDisplay = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('pt-BR');
  } catch {
    return '-';
  }
};

const EtapaDetailModal: React.FC<EtapaDetailModalProps> = ({
  etapa,
  usuarios,
  open,
  onClose,
}) => {
  if (!etapa) return null;

  const responsavel = usuarios.find(u => u.id === etapa.usuario_id);

  // Calculate if etapa is overdue
  const isOverdue = etapa.data_prazo && etapa.status !== 'C' && new Date(etapa.data_prazo) < new Date();

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClockCircleOutlined style={{ color: '#1890ff' }} />
            <Title level={4} style={{ margin: 0 }}>Detalhes da Etapa</Title>
          </div>
          {isOverdue && (
            <Tag color="red" style={{ margin: 0 }}>
              Em Atraso
            </Tag>
          )}
        </div>
      }
    >
      <div className="pt-4">
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="Nome da Etapa" span={2}>
            <strong>{etapa.nome}</strong>
          </Descriptions.Item>
          
          <Descriptions.Item label="Status">
            {getStatusTag(etapa.status)}
          </Descriptions.Item>
          
          <Descriptions.Item label="Responsável">
            {responsavel ? (
              <Tag icon={<UserOutlined />} color="blue">
                {responsavel.nome}
              </Tag>
            ) : '-'}
          </Descriptions.Item>

          <Descriptions.Item label="Data de Início">
            <div className="flex items-center gap-2">
              <CalendarOutlined />
              {formatDateForDisplay(etapa.data_inicio)}
            </div>
          </Descriptions.Item>
          
          <Descriptions.Item label="Data Prazo">
            <div className="flex items-center gap-2">
              <CalendarOutlined />
              {formatDateForDisplay(etapa.data_prazo)}
            </div>
          </Descriptions.Item>
          
          <Descriptions.Item label="Data de Conclusão">
            <div className="flex items-center gap-2">
              <CalendarOutlined />
              {formatDateForDisplay(etapa.data_fim)}
            </div>
          </Descriptions.Item>
          
          <Descriptions.Item label="Data de Criação">
            <div className="flex items-center gap-2">
              <CalendarOutlined />
              {formatDateForDisplay(etapa.created_at)}
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="Descrição" span={2}>
            <div className="flex items-start gap-2">
              <FileTextOutlined className="mt-1" />
              <div className="flex-1">
                {etapa.descricao ? (
                  <div className="whitespace-pre-wrap">{etapa.descricao}</div>
                ) : (
                  <span className="text-gray-400 italic">Sem descrição</span>
                )}
              </div>
            </div>
          </Descriptions.Item>
        </Descriptions>
      </div>
    </Modal>
  );
};

export default EtapaDetailModal;