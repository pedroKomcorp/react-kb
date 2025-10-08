import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Input, message, Space, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getClientes, createCliente, updateCliente, deleteCliente } from '../../../services/clientes';
import type { Cliente } from '../../../types/cliente';

const ClientesPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [estado, setEstado] = useState('');

  const formatCNPJ = (value: string) => {
    const digits = value.replace(/\D/g, '');
    
    const limitedDigits = digits.slice(0, 14);
    
    return limitedDigits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCNPJ(e.target.value);
    setCnpj(formattedValue);
  };

  const fetchClientes = async () => {
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
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setNome(cliente.nome);
    setCnpj(cliente.cnpj);
    setEstado(cliente.estado);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingCliente(null);
    setNome('');
    setCnpj('');
    setEstado('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!nome.trim() || !cnpj.trim() || !estado.trim()) {
      message.error('Preencha todos os campos.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (editingCliente) {
        await updateCliente(editingCliente.id, { nome, cnpj, estado }, token || undefined);
        message.success('Cliente atualizado!');
      } else {
        await createCliente({ nome, cnpj, estado }, token || undefined);
        message.success('Cliente criado!');
      }
      setShowModal(false);
      fetchClientes();
    } catch (e) {
      message.error(`Erro ao salvar cliente. ${e}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await deleteCliente(id, token || undefined);
      message.success('Cliente removido!');
      fetchClientes();
    } catch (e) {
      message.error(`Erro ao remover cliente. ${e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Page Content */}
      <div className="flex-1 flex flex-col pl-20 p-4 space-y-4">
        {/* Page Title and Controls */}
        <div className="bg-transparent rounded-lg flex items-center justify-between flex-shrink-0">
          <h1 className="text-2xl font-bold text-white">CLIENTES</h1>
          <button
            className="px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors duration-200 font-semibold flex items-center space-x-2"
            onClick={handleAdd}
          >
            <PlusOutlined />
            <span>Novo Cliente</span>
          </button>
        </div>
        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <Table
            dataSource={clientes}
            rowKey="id"
            loading={loading}
            style={{ width: '100%' }}
            columns={[
              { title: 'ID', dataIndex: 'id', key: 'id' },
              { title: 'Nome', dataIndex: 'nome', key: 'nome' },
              { title: 'CNPJ', dataIndex: 'cnpj', key: 'cnpj' },
              { title: 'Estado', dataIndex: 'estado', key: 'estado' },
              {
                title: 'Ações',
                key: 'acoes',
                render: (_, record: Cliente) => (
                  <Space>
                    <Button onClick={() => handleEdit(record)}>Editar</Button>
                    <Button danger onClick={() => handleDelete(record.id)}>Excluir</Button>
                  </Space>
                )
              }
            ]}
          />
        </div>
      </div>
      <Modal
        open={showModal}
        onCancel={() => setShowModal(false)}
        onOk={handleSave}
        okText={editingCliente ? 'Salvar' : 'Criar'}
        confirmLoading={loading}
        title={editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <Input value={nome} onChange={e => setNome(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">CNPJ</label>
            <Input 
              value={cnpj} 
              onChange={handleCNPJChange}
              placeholder="00.000.000/0000-00"
              maxLength={18}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <Select
              value={estado}
              onChange={setEstado}
              placeholder="Selecione um estado"
              style={{ width: '100%' }}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={[
                { value: 'AC', label: 'Acre' },
                { value: 'AL', label: 'Alagoas' },
                { value: 'AP', label: 'Amapá' },
                { value: 'AM', label: 'Amazonas' },
                { value: 'BA', label: 'Bahia' },
                { value: 'CE', label: 'Ceará' },
                { value: 'DF', label: 'Distrito Federal' },
                { value: 'ES', label: 'Espírito Santo' },
                { value: 'GO', label: 'Goiás' },
                { value: 'MA', label: 'Maranhão' },
                { value: 'MT', label: 'Mato Grosso' },
                { value: 'MS', label: 'Mato Grosso do Sul' },
                { value: 'MG', label: 'Minas Gerais' },
                { value: 'PA', label: 'Pará' },
                { value: 'PB', label: 'Paraíba' },
                { value: 'PR', label: 'Paraná' },
                { value: 'PE', label: 'Pernambuco' },
                { value: 'PI', label: 'Piauí' },
                { value: 'RJ', label: 'Rio de Janeiro' },
                { value: 'RN', label: 'Rio Grande do Norte' },
                { value: 'RS', label: 'Rio Grande do Sul' },
                { value: 'RO', label: 'Rondônia' },
                { value: 'RR', label: 'Roraima' },
                { value: 'SC', label: 'Santa Catarina' },
                { value: 'SP', label: 'São Paulo' },
                { value: 'SE', label: 'Sergipe' },
                { value: 'TO', label: 'Tocantins' }
              ]}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClientesPage;
