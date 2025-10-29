import React from 'react';
import { Modal, Button } from 'antd';
import type { Credito } from '../../types/credito';
import type { MovimentacaoCredito } from '../../types/movimentacao';
import MovimentacaoCard from './MovimentacaoCard';

interface CreditoDetailModalProps {
  open: boolean;
  onCancel: () => void;
  credito: Credito | null;
  movimentacoes: MovimentacaoCredito[];
  loading: boolean;
  onNovaMovimentacao: () => void;
  onEditMovimentacao: (movimentacao: MovimentacaoCredito) => void;
  onDeleteMovimentacao: (movimentacaoId: number) => void;
}

const CreditoDetailModal: React.FC<CreditoDetailModalProps> = ({
  open,
  onCancel,
  credito,
  movimentacoes,
  loading,
  onNovaMovimentacao,
  onEditMovimentacao,
  onDeleteMovimentacao
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value).replace('R$', 'R$').replace(/\s/, '');
  };

  const getStatusColor = (status: string) => {
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

  const getStatusText = (status: string) => {
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

  return (
    <Modal
      title={`Detalhes do Crédito - ${credito?.nome}`}
      open={open}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="close" onClick={onCancel}>
          Fechar
        </Button>,
        <Button 
          key="movimentacao" 
          type="primary" 
          onClick={onNovaMovimentacao}
        >
          Nova Movimentação
        </Button>
      ]}
    >
      {credito && (
        <div className="space-y-6">
          {/* Credit Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Informações do Crédito</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Nome:</strong> {credito.nome}
              </div>
              <div>
                <strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  getStatusColor(credito.status) === 'green' ? 'bg-green-100 text-green-800' :
                  getStatusColor(credito.status) === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                  getStatusColor(credito.status) === 'red' ? 'bg-red-100 text-red-800' :
                  getStatusColor(credito.status) === 'orange' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {getStatusText(credito.status)}
                </span>
              </div>
              <div>
                <strong>Valor Original:</strong> {formatCurrency(credito.valor_original)}
              </div>
              <div>
                <strong>Saldo Atual:</strong> 
                <span className={`ml-2 ${
                  credito.saldo_atual > 0 ? 'text-green-600' : 
                  credito.saldo_atual < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {formatCurrency(credito.saldo_atual)}
                </span>
              </div>
              <div>
                <strong>Diferença:</strong>
                <span className={`ml-2 ${
                  (credito.saldo_atual - credito.valor_original) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(credito.saldo_atual - credito.valor_original)}
                </span>
              </div>
              <div>
                <strong>Criado em:</strong> {new Date(credito.created_at).toLocaleDateString('pt-BR')}
              </div>
            </div>
            
            {credito.descricao && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <strong>Descrição:</strong>
                <p className="text-gray-700 mt-1">{credito.descricao}</p>
              </div>
            )}
          </div>

          {/* Movimentacoes List */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Histórico de Movimentações</h3>
            {loading ? (
              <div className="text-center py-4">
                <p>Carregando movimentações...</p>
              </div>
            ) : !Array.isArray(movimentacoes) || movimentacoes.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p>Nenhuma movimentação encontrada.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {movimentacoes.map((mov) => (
                  <MovimentacaoCard
                    key={mov.id}
                    movimentacao={mov}
                    onEdit={onEditMovimentacao}
                    onDelete={onDeleteMovimentacao}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CreditoDetailModal;