import React from 'react';
import { Button, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ClienteSelector from '../cliente/ClienteSelector';
import type { Cliente } from '../../types/cliente';

interface CreditoFiltersProps {
  selectedClient: Cliente | null;
  onClientSelect: (client: Cliente | null) => void;
  nomeFilter: string;
  onNomeFilterChange: (value: string) => void;
  onCreateCredito: () => void;
}

const CreditoFilters: React.FC<CreditoFiltersProps> = ({
  selectedClient,
  onClientSelect,
  nomeFilter,
  onNomeFilterChange,
  onCreateCredito
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cliente:
          </label>
          <ClienteSelector
            onClientSelect={onClientSelect}
            selectedClient={selectedClient}
            placeholder="Selecione um cliente..."
          />
        </div>
      </div>
      
      {/* Credit Name Filter */}
      {selectedClient && (
        <div className="mt-4 flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por nome do crédito:
            </label>
            <Input
              placeholder="Digite o nome do crédito para filtrar..."
              value={nomeFilter}
              onChange={(e) => onNomeFilterChange(e.target.value)}
              allowClear
            />
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={onCreateCredito}
            className="mb-0"
          >
            Adicionar Crédito
          </Button>
        </div>
      )}
    </div>
  );
};

export default CreditoFilters;