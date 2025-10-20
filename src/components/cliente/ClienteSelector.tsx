import React, { useState, useEffect } from 'react';
import { Select, Spin, Alert, Button, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { getClientes } from '../../services/clientes';
import type { Cliente } from '../../types/cliente';

interface ClienteSelectorProps {
  onClientSelect: (cliente: Cliente | null) => void;
  selectedClient?: Cliente | null;
  placeholder?: string;
  showClearButton?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
}

const ClienteSelector: React.FC<ClienteSelectorProps> = ({
  onClientSelect,
  selectedClient,
  placeholder = "Selecione um cliente...",
  showClearButton = true,
  disabled = false,
  style
}) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load clients on component mount
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const clientsData = await getClientes(token || undefined);
      setClientes(clientsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar clientes';
      setError(errorMessage);
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClientChange = (value: number | undefined) => {
    if (value === undefined) {
      onClientSelect(null);
      return;
    }
    
    const selectedClient = clientes.find(client => client.id === value);
    onClientSelect(selectedClient || null);
  };

  const formatClientDisplay = (client: Cliente) => {
    const nome = client.nome_fantasia || client.nome || client.razao_social;
    const cnpj = client.cnpj_cpf || client.cnpj;
    return `${nome} - ${cnpj} (${client.estado})`;
  };

  return (
    <div style={style}>
      <Space.Compact style={{ width: '100%' }}>
        <Select
          placeholder={placeholder}
          value={selectedClient?.id}
          onChange={handleClientChange}
          loading={loading}
          disabled={disabled}
          allowClear={showClearButton}
          showSearch
          optionFilterProp="label"
          optionLabelProp="title"
          style={{ width: '100%' }}
          notFoundContent={loading ? <Spin size="small" /> : 'Nenhum cliente encontrado'}
          filterOption={(input, option) => {
            const label = option?.label?.toString() || '';
            return label.toLowerCase().includes(input.toLowerCase());
          }}
        >
          {clientes.map(client => {
            const nomeDisplay = client.nome_fantasia || client.nome || client.razao_social;
            return (
              <Select.Option 
                key={client.id} 
                value={client.id}
                label={formatClientDisplay(client)}
                title={nomeDisplay}
              >
                <div>
                  <div style={{ fontWeight: 'bold' }}>
                    {nomeDisplay}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {client.cnpj_cpf || client.cnpj} • {client.cidade} - {client.estado}
                  </div>
                </div>
              </Select.Option>
            );
          })}
        </Select>
        
        <Button 
          icon={<ReloadOutlined />} 
          onClick={loadClients}
          disabled={disabled || loading}
          title="Recarregar lista de clientes"
        />
      </Space.Compact>

      {error && (
        <Alert 
          message="Erro ao carregar clientes" 
          description={error}
          type="error" 
          showIcon 
          style={{ marginTop: 8 }}
          action={
            <Button size="small" onClick={loadClients}>
              Tentar novamente
            </Button>
          }
        />
      )}
    </div>
  );
};

export default ClienteSelector;