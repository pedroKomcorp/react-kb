import React from 'react';
import { Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Credito, StatusCredito } from '../../types/credito';

interface CreditoCardProps {
  credito: Credito;
  onEdit: (credito: Credito) => void;
  onDelete: (creditoId: number) => void;
  onClick: (credito: Credito) => void;
  isDeleting: boolean;
}

const CreditoCard: React.FC<CreditoCardProps> = ({
  credito,
  onEdit,
  onDelete,
  onClick,
  isDeleting
}) => {
  const getStatusColor = (status: StatusCredito) => {
    switch (status) {
      case 'habilitado': return 'green';
      case 'em_andamento': return 'blue';
      case 'aguardando_habilitacao': return 'orange';
      case 'parcialmente_compensado': return 'yellow';
      case 'compensado': return 'gray';
      case 'indeferido': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = (status: StatusCredito) => {
    switch (status) {
      case 'em_andamento': return 'Em Andamento';
      case 'habilitado': return 'Habilitado';
      case 'compensado': return 'Compensado';
      case 'indeferido': return 'Indeferido';
      case 'parcialmente_compensado': return 'Parcialmente Compensado';
      case 'aguardando_habilitacao': return 'Aguardando Habilitação';
      default: return status;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value).replace('R$', 'R$').replace(/\s/, '');
  };

  const isSelicEnabled = (value: unknown): boolean => {
    return value === true || value === 'true' || value === 1 || value === '1';
  };

  return (
    <div 
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(credito)}
    >
      <div className="flex items-center justify-between mb-3">
        <h5 className="font-medium text-gray-900">
          {credito.nome}
        </h5>
        <div className="flex items-center gap-2">
          <span 
            className={`px-2 py-1 text-xs rounded-full ${
              getStatusColor(credito.status) === 'green' ? 'bg-green-100 text-green-800' :
              getStatusColor(credito.status) === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
              getStatusColor(credito.status) === 'red' ? 'bg-red-100 text-red-800' :
              getStatusColor(credito.status) === 'orange' ? 'bg-orange-100 text-orange-800' :
              'bg-gray-100 text-gray-800'
            }`}
          >
            {getStatusText(credito.status)}
          </span>
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(credito)}
              className="text-blue-600 hover:text-blue-800"
            />
            <Popconfirm
              title="Deletar Crédito"
              description="Tem certeza que deseja deletar este crédito? Esta ação não pode ser desfeita."
              onConfirm={() => onDelete(credito.id)}
              okText="Sim"
              cancelText="Não"
              okButtonProps={{ loading: isDeleting }}
            >
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                className="text-red-600 hover:text-red-800"
                loading={isDeleting}
              />
            </Popconfirm>
          </div>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Saldo Inicial:</span>
          <span className="font-medium">
            {formatCurrency(credito.valor_original)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Saldo Atual:</span>
          <span className={`font-medium ${
            credito.saldo_atual > 0 ? 'text-green-600' : 
            credito.saldo_atual < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {formatCurrency(credito.saldo_atual)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Diferença:</span>
          <span className={`font-medium ${
            (credito.saldo_atual - credito.valor_original) >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(credito.saldo_atual - credito.valor_original)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Atualização SELIC:</span>
          <span className={`font-medium ${
            isSelicEnabled(credito.tem_atualizacao_selic) ? 'text-green-600' : 'text-gray-600'
          }`}>
            {isSelicEnabled(credito.tem_atualizacao_selic) ? 'Sim' : 'Não'}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Criado:</span>
          <span>{new Date(credito.created_at).toLocaleDateString('pt-BR')}</span>
        </div>
        <div className="mt-3 pt-2 border-t border-gray-100">
          <p className="text-xs text-blue-600 font-medium text-center">
            👆 Clique para ver detalhes e movimentações
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreditoCard;