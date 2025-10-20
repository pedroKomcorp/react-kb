import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Table, Button, message, Space, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getClientes, deleteCliente } from '../../../services/clientes';
import ClienteFormModal from '../../../components/cliente/ClienteFormModal';
import { useResponsive } from '../../../hooks/useResponsive';
import type { Cliente } from '../../../types/cliente';

const ClientesPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);

  // Custom pagination styles
  const paginationStyle = `
    .custom-pagination .ant-pagination-item {
      background-color: #f0f8ff !important;
      border: 2px solid #1890ff !important;
      border-radius: 8px !important;
      margin: 0 4px !important;
      transition: all 0.3s ease !important;
    }
    
    .custom-pagination .ant-pagination-item:hover {
      background-color: #e6f7ff !important;
      border-color: #40a9ff !important;
      transform: translateY(-1px) !important;
    }
    
    .custom-pagination .ant-pagination-item-active {
      background-color: #1890ff !important;
      border-color: #1890ff !important;
    }
    
    .custom-pagination .ant-pagination-item-active a {
      color: #ffffff !important;
      font-weight: 600 !important;
    }
    
    .custom-pagination .ant-pagination-item a {
      color: #1890ff !important;
      font-weight: 500 !important;
    }
    
    .custom-pagination .ant-pagination-prev,
    .custom-pagination .ant-pagination-next {
      background-color: #f0f8ff !important;
      border: 2px solid #1890ff !important;
      border-radius: 8px !important;
      color: #1890ff !important;
    }
    
    .custom-pagination .ant-pagination-prev:hover,
    .custom-pagination .ant-pagination-next:hover {
      background-color: #e6f7ff !important;
      border-color: #40a9ff !important;
      color: #40a9ff !important;
    }
    
    .custom-pagination .ant-pagination-jump-prev,
    .custom-pagination .ant-pagination-jump-next {
      color: #1890ff !important;
    }
  `;
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [deleting, setDeleting] = useState<number | null>(null);

  // Get responsive breakpoints
  const { mobile, tablet, desktop } = useResponsive();

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const clientesData = await getClientes(token || undefined);
      setClientes(clientesData);
    } catch (e) {
      message.error(`Erro ao carregar clientes. ${e}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const handleEdit = useCallback((cliente: Cliente) => {
    console.log('Edit button clicked for cliente:', cliente);
    setEditingCliente(cliente);
    setModalMode('edit');
    setShowModal(true);
    console.log('Modal should be open now. showModal:', true, 'mode:', 'edit');
  }, []);

  const handleAdd = useCallback(() => {
    setEditingCliente(null);
    setModalMode('create');
    setShowModal(true);
  }, []);

  const handleModalSuccess = useCallback((cliente: Cliente) => {
    console.log('Modal success called with cliente:', cliente);
    fetchClientes();
    setShowModal(false);
    setEditingCliente(null);
  }, [fetchClientes]);

  const handleDelete = useCallback(async (id: number) => {
    setDeleting(id);
    try {
      await deleteCliente(id);
      message.success('Cliente removido com sucesso!');
      fetchClientes();
    } catch (error) {
      console.error('Error deleting cliente:', error);
      message.error('Erro ao deletar cliente');
    } finally {
      setDeleting(null);
    }
  }, [fetchClientes]);

  const formatCNPJ = (cnpj: string) => {
    if (!cnpj) return '';
    const digits = cnpj.replace(/\D/g, '');
    return digits.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5'
    );
  };

  // Responsive columns configuration
  const columns = useMemo(() => {
    const baseColumns: ColumnsType<Cliente> = [
      { 
        title: 'Nome', 
        key: 'nome_display',
        render: (record: Cliente) => (
          <div>
            <div className="font-medium">
              {record.nome_fantasia || record.nome || record.razao_social}
            </div>
            {mobile && (
              <div className="text-xs text-gray-500">
                {formatCNPJ(record.cnpj_cpf || record.cnpj || '')}
              </div>
            )}
          </div>
        ),
      },
      {
        title: 'Ações',
        key: 'acoes',
        width: mobile ? 100 : 150,
        render: (record: Cliente) => {
          console.log('Rendering actions for record:', record.id);
          return (
          <Space size={mobile ? "small" : "middle"}>
            <Button 
              size="small" 
              icon={<EditOutlined />} 
              onClick={() => {
                console.log('Edit button clicked for record:', record);
                handleEdit(record);
              }}
            >
              {mobile ? '' : 'Editar'}
            </Button>
            <Popconfirm
              title="Deletar Cliente"
              description="Tem certeza que deseja deletar este cliente? Esta ação não pode ser desfeita."
              onConfirm={() => record.id && handleDelete(record.id)}
              okText="Sim"
              cancelText="Não"
              okButtonProps={{ loading: deleting === record.id }}
            >
              <Button 
                size="small" 
                danger 
                icon={<DeleteOutlined />} 
                loading={deleting === record.id}
              >
                {mobile ? '' : 'Excluir'}
              </Button>
            </Popconfirm>
          </Space>
          );
        }
      }
    ];

    // Add more columns based on screen size
    if (!mobile) {
      baseColumns.splice(1, 0, 
        { 
          title: 'CNPJ/CPF', 
          key: 'cnpj_display',
          render: (record: Cliente) => <span>{formatCNPJ(record.cnpj_cpf || record.cnpj || '')}</span>,
          width: tablet ? 140 : 160,
        }
      );
    }

    if (desktop) {
      baseColumns.splice(1, 0, 
        { 
          title: 'ID', 
          dataIndex: 'id', 
          key: 'id',
          width: 80,
        }
      );
      
      baseColumns.splice(3, 0,
        { 
          title: 'Razão Social', 
          dataIndex: 'razao_social', 
          key: 'razao_social',
        }
      );
    }

    if (desktop) {
      baseColumns.splice(-1, 0,
        { 
          title: 'Cidade/UF', 
          key: 'localizacao',
          render: (record: Cliente) => <span>{`${record.cidade || ''} - ${record.estado || ''}`}</span>,
        },
        { 
          title: 'Email', 
          dataIndex: 'email', 
          key: 'email',
        }
      );
    }

    return baseColumns;
  }, [mobile, tablet, desktop, deleting, handleEdit, handleDelete]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Custom Pagination Styles */}
      <style dangerouslySetInnerHTML={{ __html: paginationStyle }} />
      
      {/* Page Content */}
      <div className="flex-1 flex flex-col pl-20 p-4 space-y-4">
        {/* Page Title and Controls */}
        <div className="bg-transparent rounded-lg flex items-center justify-between flex-shrink-0">
          <h1 className="text-2xl font-bold text-white">CLIENTES</h1>
          <Button
            className='bg-[#775343 hover:bg-[#a67c65] hover:text-white transition-colors duration-200'
            icon={<PlusOutlined />}
            onClick={handleAdd}
            >
            Novo Cliente
          </Button>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <Table
            dataSource={clientes}
            rowKey="id"
            loading={loading}
            columns={columns}
            scroll={{ x: true }}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} de ${total} clientes`,
              className: "custom-pagination",
              style: { 
                backgroundColor: '#ffffff',
                padding: '20px',
                borderRadius: '12px',
                marginTop: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid #e8e8e8'
              }
            }}
          />
        </div>
      </div>
      
      {/* Cliente Form Modal */}
      <ClienteFormModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleModalSuccess}
        cliente={editingCliente}
        mode={modalMode}
      />
    </div>
  );
};

export default ClientesPage;
