import React from 'react';
import { Card, Button, Space, Tag, Divider } from 'antd';
import { UserOutlined, EditOutlined, CloseOutlined, FileTextOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import type { Cliente } from '../../types/cliente';

interface ClientCardProps {
  client: Cliente | null;
  onEdit?: (client: Cliente) => void;
  onRemove?: () => void;
  showActions?: boolean;
  style?: React.CSSProperties;
  size?: 'small' | 'default';
}

const ClientCard: React.FC<ClientCardProps> = ({
  client,
  onEdit,
  onRemove,
  showActions = true,
  style,
  size = 'default'
}) => {
  if (!client) {
    return (
      <Card 
        style={{ ...style, textAlign: 'center' }}
        size={size}
      >
        <div style={{ padding: '20px', color: '#999' }}>
          <UserOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
          <div>Nenhum cliente selecionado</div>
          <div style={{ fontSize: '12px', marginTop: '8px' }}>
            Selecione um cliente para continuar
          </div>
        </div>
      </Card>
    );
  }

  const formatCNPJ = (cnpj: string) => {
    if (!cnpj) return '';
    // Format CNPJ: 12.345.678/0001-90
    const digits = cnpj.replace(/\D/g, '');
    return digits.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5'
    );
  };

  const formatPhone = (ddd: string, number: string) => {
    if (!ddd || !number) return '';
    return `(${ddd}) ${number}`;
  };

  const formatCEP = (cep: string) => {
    if (!cep) return '';
    const digits = cep.replace(/\D/g, '');
    return digits.replace(/^(\d{5})(\d{3})$/, '$1-$2');
  };

  const cardTitle = (
    <Space>
      <UserOutlined style={{ color: '#1890ff' }} />
      <span>Cliente Selecionado</span>
    </Space>
  );

  const cardActions = showActions ? [
    onEdit && (
      <Button 
        key="edit"
        type="text" 
        icon={<EditOutlined />}
        onClick={() => onEdit(client)}
      >
        Editar
      </Button>
    ),
    onRemove && (
      <Button 
        key="remove"
        type="text" 
        danger
        icon={<CloseOutlined />}
        onClick={onRemove}
      >
        Remover
      </Button>
    )
  ].filter(Boolean) : undefined;

  return (
    <Card
      title={cardTitle}
      style={style}
      size={size}
      actions={cardActions}
      hoverable={showActions}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* Client Name */}
        <div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#262626' }}>
            {client.nome_fantasia || client.nome || client.razao_social}
          </div>
          {client.razao_social && client.razao_social !== client.nome_fantasia && (
            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
              {client.razao_social}
            </div>
          )}
        </div>

        <Divider style={{ margin: '12px 0' }} />

        {/* Client Details */}
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FileTextOutlined style={{ marginRight: '8px', color: '#666' }} />
            <span style={{ color: '#666', marginRight: '8px' }}>CNPJ:</span>
            <Tag color="blue">{formatCNPJ(client.cnpj_cpf || client.cnpj || '')}</Tag>
          </div>

          {/* Contact Info */}
          {client.contato && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <UserOutlined style={{ marginRight: '8px', color: '#666' }} />
              <span style={{ color: '#666', marginRight: '8px' }}>Contato:</span>
              <span>{client.contato}</span>
            </div>
          )}

          {/* Phone */}
          {(client.telefone1_ddd || client.telefone1_numero) && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <PhoneOutlined style={{ marginRight: '8px', color: '#666' }} />
              <span style={{ color: '#666', marginRight: '8px' }}>Telefone:</span>
              <span>{formatPhone(client.telefone1_ddd || '', client.telefone1_numero || '')}</span>
            </div>
          )}

          {/* Address */}
          {(client.endereco || client.cidade) && (
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <HomeOutlined style={{ marginRight: '8px', color: '#666', marginTop: '2px' }} />
              <div>
                <div style={{ color: '#666', marginBottom: '2px' }}>Endereço:</div>
                <div>
                  {client.endereco && `${client.endereco}, ${client.endereco_numero}`}
                  {client.complemento && `, ${client.complemento}`}
                  {client.bairro && `, ${client.bairro}`}
                  <br />
                  {client.cidade} - {client.estado}
                  {client.cep && ` - CEP: ${formatCEP(client.cep)}`}
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {client.tags && client.tags.length > 0 && (
            <div>
              <span style={{ color: '#666', marginRight: '8px' }}>Tags:</span>
              <Space size="small">
                {client.tags.map((tag, index) => (
                  <Tag key={tag.id || index} color="processing">{tag.nome}</Tag>
                ))}
              </Space>
            </div>
          )}

          {/* Status indicators */}
          <Space size="small">
            {client.inativo === 'S' && <Tag color="red">Inativo</Tag>}
            {client.pessoa_fisica === 'S' && <Tag color="blue">Pessoa Física</Tag>}
            {client.exterior === 'S' && <Tag color="purple">Exterior</Tag>}
          </Space>

          {client.id && (
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
              <span style={{ color: '#666', marginRight: '8px' }}>ID:</span>
              <Tag color="purple">#{client.id}</Tag>
            </div>
          )}
        </Space>
      </Space>
    </Card>
  );
};

export default ClientCard;