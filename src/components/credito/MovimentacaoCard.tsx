import React from 'react';
import { Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { MovimentacaoCredito } from '../../types/movimentacao';

interface MovimentacaoCardProps {
  movimentacao: MovimentacaoCredito;
  onEdit: (movimentacao: MovimentacaoCredito) => void;
  onDelete: (movimentacaoId: number) => void;
}

const MovimentacaoCard: React.FC<MovimentacaoCardProps> = ({
  movimentacao,
  onEdit,
  onDelete
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value).replace('R$', 'R$').replace(/\s/, '');
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
            movimentacao.tipo === 'COMPENSACAO' ? 'bg-red-100 text-red-800' :
            movimentacao.tipo === 'CREDITO' ? 'bg-green-100 text-green-800' :
            movimentacao.tipo === 'DEBITO' ? 'bg-red-100 text-red-800' :
            movimentacao.tipo === 'AJUSTE' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {movimentacao.tipo.replace('_', ' ')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {new Date(movimentacao.created_at).toLocaleDateString('pt-BR')}
          </span>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(movimentacao)}
            className="text-blue-600 hover:text-blue-800"
          />
          <Popconfirm
            title="Deletar Movimentação"
            description="Tem certeza que deseja deletar esta movimentação?"
            onConfirm={() => onDelete(movimentacao.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              className="text-red-600 hover:text-red-800"
            />
          </Popconfirm>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <strong>Valor:</strong> 
          <span className={`ml-1 ${movimentacao.valor >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(movimentacao.valor))}
          </span>
        </div>
        <div>
          <strong>Saldo Anterior:</strong> {formatCurrency(movimentacao.saldo_anterior)}
        </div>
        <div>
          <strong>Saldo Posterior:</strong> {formatCurrency(movimentacao.saldo_posterior)}
        </div>
      </div>
      {movimentacao.descricao && (
        <div className="mt-2 text-sm text-gray-600">
          <strong>Descrição:</strong> {movimentacao.descricao}
        </div>
      )}
    </div>
  );
};

export default MovimentacaoCard;