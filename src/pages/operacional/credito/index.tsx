
import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, InputNumber, Select, Switch, message, Popconfirm, DatePicker } from 'antd';
import { PlusOutlined, CreditCardOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import ClienteSelector from '../../../components/cliente/ClienteSelector';
import { getCreditosCliente, createCredito, updateCredito, deleteCredito, getMovimentacoes, createMovimentacao, updateMovimentacao, deleteMovimentacao } from '../../../services/creditos';
import type { Cliente } from '../../../types/cliente';
import type { Credito, CreateCreditoData, UpdateCreditoData, StatusCredito, MovimentacaoCredito, CreateMovimentacaoData, UpdateMovimentacaoData, TipoMovimentacao } from '../../../types/credito';
import { StatusCreditoEnum } from '../../../types/credito';



interface CreateFormValues {
  nome: string;
  descricao?: string;
  saldo_inicial: number;
  status: StatusCredito;
  tem_atualizacao_selic: boolean;
  created_at?: Dayjs;
}

interface UpdateFormValues {
  nome: string;
  descricao?: string;
  valor_original: number;
  saldo_atual: number;
  status: StatusCredito;
  tem_atualizacao_selic: boolean;
}

interface MovimentacaoFormValues {
  tipo: TipoMovimentacao;
  valor: number;
  descricao: string;
  created_at?: Dayjs;
}


const CreditoPage: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [creditos, setCreditos] = useState<Credito[]>([]);
  const [filteredCreditos, setFilteredCreditos] = useState<Credito[]>([]);
  const [nomeFilter, setNomeFilter] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCredito, setEditingCredito] = useState<Credito | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCredito, setSelectedCredito] = useState<Credito | null>(null);
  const [showMovimentacaoModal, setShowMovimentacaoModal] = useState(false);
  const [creatingMovimentacao, setCreatingMovimentacao] = useState(false);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoCredito[]>([]);
  const [loadingMovimentacoes, setLoadingMovimentacoes] = useState(false);
  const [showEditMovimentacaoModal, setShowEditMovimentacaoModal] = useState(false);
  const [editingMovimentacao, setEditingMovimentacao] = useState<MovimentacaoCredito | null>(null);
  const [updatingMovimentacao, setUpdatingMovimentacao] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [movimentacaoForm] = Form.useForm();
  const [editMovimentacaoForm] = Form.useForm();

  // Fetch credits when client is selected
  useEffect(() => {
    if (selectedClient?.id) {
      loadCreditos(selectedClient.id);
    } else {
      setCreditos([]);
      setFilteredCreditos([]);
    }
  }, [selectedClient]);

  // Filter credits based on name
  useEffect(() => {
    if (!nomeFilter.trim()) {
      setFilteredCreditos(creditos);
    } else {
      const filtered = creditos.filter(credito =>
        credito.nome?.toLowerCase().includes(nomeFilter.toLowerCase())
      );
      setFilteredCreditos(filtered);
    }
  }, [creditos, nomeFilter]);

  const loadCreditos = async (clienteId: number) => {
    setLoading(true);
    try {
      const creditosData = await getCreditosCliente(clienteId);
      setCreditos(creditosData);
    } catch (error) {
      console.error('Error loading credits:', error);
      message.error('Erro ao carregar créditos do cliente');
      setCreditos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClientSelect = (client: Cliente | null) => {
    setSelectedClient(client);
  };

  const handleCreateCredito = async (values: CreateFormValues) => {
    if (!selectedClient?.id) return;
    
    setCreating(true);
    try {
      const createData: CreateCreditoData = {
        cliente_id: selectedClient.id,
        nome: values.nome,
        descricao: values.descricao,
        valor_original: values.saldo_inicial,
        status: values.status,
        tem_atualizacao_selic: values.tem_atualizacao_selic || false,
        created_at: values.created_at ? values.created_at.toISOString() : undefined,
      };
      
      await createCredito(createData);
      
      if (selectedClient?.id) {
        await loadCreditos(selectedClient.id);
      }
      
      message.success('Crédito criado com sucesso!');
      setShowCreateModal(false);
      form.resetFields();
    } catch (error) {
      console.error('Error creating credit:', error);
      message.error('Erro ao criar crédito');
    } finally {
      setCreating(false);
    }
  };

  const handleEditCredito = (credito: Credito) => {
    setEditingCredito(credito);
    editForm.setFieldsValue({
      nome: credito.nome,
      descricao: credito.descricao,
      valor_original: credito.valor_original,
      saldo_atual: credito.saldo_atual,
      status: credito.status,
      tem_atualizacao_selic: credito.tem_atualizacao_selic,
    });
    setShowEditModal(true);
  };

  const handleUpdateCredito = async (values: UpdateFormValues) => {
    if (!editingCredito) return;
    
    setUpdating(true);
    try {
      const updateData: UpdateCreditoData = {
        nome: values.nome,
        descricao: values.descricao,
        valor_original: values.valor_original,
        saldo_atual: values.saldo_atual,
        status: values.status,
        tem_atualizacao_selic: values.tem_atualizacao_selic,
      };
      
      await updateCredito(editingCredito.id, updateData);
      if (selectedClient?.id) {
        await loadCreditos(selectedClient.id);
      }
      
      message.success('Crédito atualizado com sucesso!');
      setShowEditModal(false);
      setEditingCredito(null);
      editForm.resetFields();
    } catch (error) {
      console.error('Error updating credit:', error);
      message.error('Erro ao atualizar crédito');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteCredito = async (creditoId: number) => {
    setDeleting(creditoId);
    try {
      await deleteCredito(creditoId);
      if (selectedClient?.id) {
        await loadCreditos(selectedClient.id);
      }
      message.success('Crédito deletado com sucesso!');
    } catch (error) {
      console.error('Error deleting credit:', error);
      message.error('Erro ao deletar crédito');
    } finally {
      setDeleting(null);
    }
  };

  const handleCreditoClick = async (credito: Credito) => {
    setSelectedCredito(credito);
    setShowDetailModal(true);
    await loadMovimentacoes(credito.id);
  };

  const loadMovimentacoes = async (creditoId: number) => {
    setLoadingMovimentacoes(true);
    try {
      const movimentacoesData = await getMovimentacoes(creditoId);
      setMovimentacoes(movimentacoesData);
    } catch (error) {
      console.error('❌ Error loading movimentacoes:', error);
      message.error('Erro ao carregar movimentações do crédito');
      setMovimentacoes([]);
    } finally {
      setLoadingMovimentacoes(false);
    }
  };

  const handleCreateMovimentacao = async (values: MovimentacaoFormValues) => {
    if (!selectedCredito) return;
    
    setCreatingMovimentacao(true);
    try {
      const movimentacaoData: CreateMovimentacaoData = {
        tipo: values.tipo,
        valor: values.valor,
        descricao: values.descricao,
        created_at: values.created_at ? dayjs(values.created_at).toISOString() : undefined,
      };
      
      await createMovimentacao(selectedCredito.id, movimentacaoData);
      await loadMovimentacoes(selectedCredito.id);
      if (selectedClient?.id) {
        await loadCreditos(selectedClient.id); // Refresh credit list to update balance
      }
      
      message.success('Movimentação criada com sucesso!');
      setShowMovimentacaoModal(false);
      movimentacaoForm.resetFields();
    } catch (error) {
      console.error('=== Error creating movimentacao ===');
      console.error('Full error object:', error);
      
      // Verificar se é erro do Axios
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string; message?: string }; status?: number } };
        console.error('Response status:', axiosError.response?.status);
        console.error('Response data:', axiosError.response?.data);
        
        // Verificar diferentes formatos de erro
        const errorDetail = axiosError.response?.data?.detail || axiosError.response?.data?.message;
        console.error('Error detail:', errorDetail);
        
        if (errorDetail === "Operação resultaria em saldo negativo") {
          message.error('❌ Operação não permitida: A movimentação resultaria em saldo negativo. Verifique o valor informado.');
          return; // Não continua para outros tratamentos
        }
        
        if (errorDetail && typeof errorDetail === 'string') {
          // Outros erros específicos da API
          message.error(`❌ Erro: ${errorDetail}`);
          return;
        }
        
        // Se chegou aqui, é um erro sem detail específico
        message.error('❌ Erro ao criar movimentação. Verifique os dados informados.');
      } else {
        // Erro não é do Axios (rede, etc.)
        console.error('Non-axios error:', error);
        message.error('❌ Erro de comunicação. Verifique sua conexão.');
      }
    } finally {
      setCreatingMovimentacao(false);
    }
  };

  const handleEditMovimentacao = (movimentacao: MovimentacaoCredito) => {
    setEditingMovimentacao(movimentacao);
    editMovimentacaoForm.setFieldsValue({
      tipo: movimentacao.tipo,
      valor: movimentacao.valor,
      descricao: movimentacao.descricao,
      created_at: dayjs(movimentacao.created_at)
    });
    setShowEditMovimentacaoModal(true);
  };

  const handleUpdateMovimentacao = async (values: MovimentacaoFormValues) => {
    if (!selectedCredito || !editingMovimentacao) return;
    
    setUpdatingMovimentacao(true);
    try {
      const updateData: UpdateMovimentacaoData = {
        tipo: values.tipo,
        valor: values.valor,
        descricao: values.descricao,
        created_at: values.created_at ? dayjs(values.created_at).toISOString() : undefined,
      };
      
      await updateMovimentacao(selectedCredito.id, editingMovimentacao.id, updateData);
      await loadMovimentacoes(selectedCredito.id);
      if (selectedClient?.id) {
        await loadCreditos(selectedClient.id); // Refresh credit list
      }
      
      message.success('Movimentação atualizada com sucesso!');
      setShowEditMovimentacaoModal(false);
      editMovimentacaoForm.resetFields();
      setEditingMovimentacao(null);
    } catch (error) {
      console.error('=== Error updating movimentacao ===');
      console.error('Full error object:', error);
      
      // Verificar se é erro do Axios
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string; message?: string }; status?: number } };
        console.error('Response status:', axiosError.response?.status);
        console.error('Response data:', axiosError.response?.data);
        
        // Verificar diferentes formatos de erro
        const errorDetail = axiosError.response?.data?.detail || axiosError.response?.data?.message;
        console.error('Error detail:', errorDetail);
        
        if (errorDetail === "Operação resultaria em saldo negativo") {
          message.error('❌ Operação não permitida: A movimentação resultaria em saldo negativo. Verifique o valor informado.');
          return;
        }
        
        if (errorDetail && typeof errorDetail === 'string') {
          message.error(`❌ Erro: ${errorDetail}`);
          return;
        }
        
        message.error('❌ Erro ao atualizar movimentação. Verifique os dados informados.');
      } else {
        console.error('Non-axios error:', error);
        message.error('❌ Erro de comunicação. Verifique sua conexão.');
      }
    } finally {
      setUpdatingMovimentacao(false);
    }
  };

  const handleDeleteMovimentacao = async (movimentacaoId: number) => {
    if (!selectedCredito) return;
    
    try {
      await deleteMovimentacao(selectedCredito.id, movimentacaoId);
      await loadMovimentacoes(selectedCredito.id);
      if (selectedClient?.id) {
        await loadCreditos(selectedClient.id); // Refresh credit list
      }
      message.success('Movimentação deletada com sucesso!');
    } catch (error) {
      console.error('Error deleting movimentacao:', error);
      message.error('Erro ao deletar movimentação');
    }
  };

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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value).replace('R$', 'R$').replace(/\s/, '');
  };

  const formatInputCurrency = (value: string | number | undefined) => {
    if (!value) return '';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue).replace('R$', 'R$').replace(/\s/, '');
  };

  const parseInputCurrency = (value: string | undefined) => {
    if (!value) return '';
    return value.replace(/R\$\s?/g, '').replace(/\./g, '').replace(',', '.');
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-transparent rounded-lg pl-20 p-4 flex items-center justify-between flex-shrink-0">
        <h1 className="text-2xl font-bold text-white">
          CONTROLE DE CRÉDITO
        </h1>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-auto p-6">
        <div className="w-full pl-20">
          {/* Main Content Container */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              {/* Inline Filter */}
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cliente:
                    </label>
                    <ClienteSelector
                      onClientSelect={handleClientSelect}
                      selectedClient={selectedClient}
                      placeholder="Selecione um cliente..."
                    />
                  </div>
                </div>
                
                {/* Credit Name Filter */}
                {selectedClient && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filtrar por nome do crédito:
                    </label>
                    <Input
                      placeholder="Digite o nome do crédito para filtrar..."
                      value={nomeFilter}
                      onChange={(e) => setNomeFilter(e.target.value)}
                      allowClear
                      className="max-w-md"
                    />
                  </div>
                )}
              </div>
              {!selectedClient ? (
                <div className="text-center py-12">
                  <CreditCardOutlined className="text-6xl text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Selecione um cliente
                  </h3>
                  <p className="text-gray-500">
                    Para visualizar as informações de crédito, selecione um cliente no campo acima.
                  </p>
                </div>
              ) : (
                <div>
                  {/* Client Info Header */}
                  <div className="mb-6 pb-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                      
                      <p className="text-gray-600">
                        CNPJ: {selectedClient.cnpj} | Estado: {selectedClient.estado}
                      </p>
                    </div>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => setShowCreateModal(true)}
                    >
                      Adicionar Crédito
                    </Button>
                  </div>

                  {/* Credits List */}
                  {loading ? (
                    <div className="text-center py-8">
                      <p>Carregando créditos...</p>
                    </div>
                  ) : filteredCreditos.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">
                        {nomeFilter.trim() ? 
                          `Nenhum crédito encontrado com o nome "${nomeFilter}".` :
                          'Nenhum crédito encontrado para este cliente.'
                        }
                      </p>
                      <Button 
                        type="dashed" 
                        icon={<PlusOutlined />}
                        onClick={() => setShowCreateModal(true)}
                      >
                        Criar Primeiro Crédito
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h4 className="text-lg font-semibold text-gray-900">
                          Créditos do Cliente ({filteredCreditos.length}
                          {nomeFilter.trim() && ` de ${creditos.length} total`})
                        </h4>
                        {nomeFilter.trim() && (
                          <Button 
                            type="link" 
                            onClick={() => setNomeFilter('')}
                            className="text-sm"
                          >
                            Limpar filtro
                          </Button>
                        )}
                      </div>
                      
                      {/* Credit Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredCreditos.map((credito) => (
                          <div 
                            key={credito.id} 
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleCreditoClick(credito)}
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
                                    onClick={() => handleEditCredito(credito)}
                                    className="text-blue-600 hover:text-blue-800"
                                  />
                                  <Popconfirm
                                    title="Deletar Crédito"
                                    description="Tem certeza que deseja deletar este crédito? Esta ação não pode ser desfeita."
                                    onConfirm={() => handleDeleteCredito(credito.id)}
                                    okText="Sim"
                                    cancelText="Não"
                                    okButtonProps={{ loading: deleting === credito.id }}
                                  >
                                    <Button
                                      type="text"
                                      size="small"
                                      icon={<DeleteOutlined />}
                                      className="text-red-600 hover:text-red-800"
                                      loading={deleting === credito.id}
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
                                  credito.tem_atualizacao_selic ? 'text-green-600' : 'text-gray-600'
                                }`}>
                                  {credito.tem_atualizacao_selic ? 'Sim' : 'Não'}
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
                        ))}
                      </div>

                      {/* Summary */}
                      <div className="bg-gray-50 rounded-lg p-6 mt-6">
                        <h5 className="font-medium text-gray-900 mb-4">
                          Resumo {nomeFilter.trim() ? 'Filtrado' : 'Total'}
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {formatCurrency(filteredCreditos.reduce((sum, c) => sum + c.valor_original, 0))}
                            </div>
                            <div className="text-sm text-gray-600">Total Inicial</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(filteredCreditos.reduce((sum, c) => sum + c.saldo_atual, 0))}
                            </div>
                            <div className="text-sm text-gray-600">Total Atual</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${
                              filteredCreditos.reduce((sum, c) => sum + (c.saldo_atual - c.valor_original), 0) >= 0 
                                ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatCurrency(filteredCreditos.reduce((sum, c) => sum + (c.saldo_atual - c.valor_original), 0))}
                            </div>
                            <div className="text-sm text-gray-600">Diferença Total</div>
                          </div>
                        </div>
                        {nomeFilter.trim() && (
                          <div className="mt-4 text-center">
                            <p className="text-xs text-gray-500">
                              * Resumo baseado nos {filteredCreditos.length} créditos filtrados de {creditos.length} total
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Credit Modal */}
      <Modal
        title="Criar Novo Crédito"
        open={showCreateModal}
        onCancel={() => {
          setShowCreateModal(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={creating}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateCredito}
        >
          <Form.Item
            name="nome"
            label="Nome do Crédito"
            rules={[
              { required: true, message: 'Por favor, insira o nome do crédito' },
              { min: 3, message: 'O nome deve ter pelo menos 3 caracteres' }
            ]}
          >
            <Input placeholder="Ex: Crédito Rotativo, Capital de Giro, etc." />
          </Form.Item>

          <Form.Item
            name="descricao"
            label="Descrição (Opcional)"
          >
            <Input.TextArea 
              placeholder="Descrição detalhada do crédito..."
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="saldo_inicial"
            label="Saldo Inicial"
            rules={[
              { required: true, message: 'Por favor, insira o saldo inicial' },
              { type: 'number', min: 0.01, message: 'O saldo deve ser maior que zero' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="0,00"
              formatter={formatInputCurrency}
              parser={parseInputCurrency}
              precision={2}
            />
          </Form.Item>

          <Form.Item
            name="created_at"
            label="Data de Criação"
            initialValue={dayjs()}
            rules={[{ required: true, message: 'Por favor, selecione a data de criação' }]}
          >
            <DatePicker
              showTime={{ format: 'HH:mm' }}
              format="DD/MM/YYYY HH:mm"
              placeholder="Selecione a data e hora"
              style={{ width: '100%' }}
              disabledDate={(current) => current && current > dayjs().endOf('day')}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status Inicial"
            initialValue="em_andamento"
          >
            <Select>
              <Select.Option value="em_andamento">Em Andamento</Select.Option>
              <Select.Option value="habilitado">Habilitado</Select.Option>
              <Select.Option value="compensado">Compensado</Select.Option>
              <Select.Option value="indeferido">Indeferido</Select.Option>
              <Select.Option value="parcialmente_compensado">Parcialmente Compensado</Select.Option>
              <Select.Option value="aguardando_habilitacao">Aguardando Habilitação</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="tem_atualizacao_selic"
            label="Tem Atualização SELIC"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch 
              checkedChildren="Sim" 
              unCheckedChildren="Não"
            />
          </Form.Item>

          {selectedClient && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Cliente:</strong> {selectedClient.nome}
              </p>
              <p className="text-sm text-gray-600">
                <strong>CNPJ:</strong> {selectedClient.cnpj}
              </p>
            </div>
          )}
        </Form>
      </Modal>

      {/* Edit Credit Modal */}
      <Modal
        title={`Editar Crédito - ${editingCredito?.nome}`}
        open={showEditModal}
        onCancel={() => {
          setShowEditModal(false);
          setEditingCredito(null);
          editForm.resetFields();
        }}
        onOk={() => editForm.submit()}
        confirmLoading={updating}
        width={500}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateCredito}
        >
          <Form.Item
            name="nome"
            label="Nome do Crédito"
            rules={[
              { required: true, message: 'Por favor, insira o nome do crédito' },
              { min: 3, message: 'O nome deve ter pelo menos 3 caracteres' }
            ]}
          >
            <Input placeholder="Ex: Crédito Rotativo, Capital de Giro, etc." />
          </Form.Item>

          <Form.Item
            name="descricao"
            label="Descrição (Opcional)"
          >
            <Input.TextArea 
              placeholder="Descrição detalhada do crédito..."
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="valor_original"
            label="Valor Original"
            rules={[
              { required: true, message: 'Por favor, insira o valor original' },
              { type: 'number', min: 0.01, message: 'O valor deve ser maior que zero' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="0,00"
              formatter={formatInputCurrency}
              parser={parseInputCurrency}
              precision={2}
            />
          </Form.Item>

          <Form.Item
            name="saldo_atual"
            label="Saldo Atual"
            rules={[
              { required: true, message: 'Por favor, insira o saldo atual' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="0,00"
              formatter={formatInputCurrency}
              parser={parseInputCurrency}
              precision={2}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Por favor, selecione o status' }]}
          >
            <Select>
              <Select.Option value={StatusCreditoEnum.EM_ANDAMENTO}>Em Andamento</Select.Option>
              <Select.Option value={StatusCreditoEnum.HABILITADO}>Habilitado</Select.Option>
              <Select.Option value={StatusCreditoEnum.COMPENSADO}>Compensado</Select.Option>
              <Select.Option value={StatusCreditoEnum.INDEFERIDO}>Indeferido</Select.Option>
              <Select.Option value={StatusCreditoEnum.PARCIALMENTE_COMPENSADO}>Parcialmente Compensado</Select.Option>
              <Select.Option value={StatusCreditoEnum.AGUARDANDO_HABILITACAO}>Aguardando Habilitação</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="tem_atualizacao_selic"
            label="Tem Atualização SELIC"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Sim" 
              unCheckedChildren="Não"
            />
          </Form.Item>

          {editingCredito && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>ID:</strong> #{editingCredito.id}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Criado em:</strong> {new Date(editingCredito.created_at).toLocaleDateString('pt-BR')}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Atualizado em:</strong> {new Date(editingCredito.updated_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}
        </Form>
      </Modal>

      {/* Credit Detail Modal */}
      <Modal
        title={`Detalhes do Crédito - ${selectedCredito?.nome}`}
        open={showDetailModal}
        onCancel={() => {
          setShowDetailModal(false);
          setSelectedCredito(null);
          setMovimentacoes([]);
        }}
        width={800}
        footer={[
          <Button key="close" onClick={() => setShowDetailModal(false)}>
            Fechar
          </Button>,
          <Button 
            key="movimentacao" 
            type="primary" 
            onClick={() => setShowMovimentacaoModal(true)}
          >
            Nova Movimentação
          </Button>
        ]}
      >
        {selectedCredito && (
          <div className="space-y-6">
            {/* Credit Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Informações do Crédito</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Nome:</strong> {selectedCredito.nome}
                </div>
                <div>
                  <strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    getStatusColor(selectedCredito.status) === 'green' ? 'bg-green-100 text-green-800' :
                    getStatusColor(selectedCredito.status) === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                    getStatusColor(selectedCredito.status) === 'red' ? 'bg-red-100 text-red-800' :
                    getStatusColor(selectedCredito.status) === 'orange' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatusText(selectedCredito.status)}
                  </span>
                </div>
                <div>
                  <strong>Valor Original:</strong> {formatCurrency(selectedCredito.valor_original)}
                </div>
                <div>
                  <strong>Saldo Atual:</strong> 
                  <span className={`ml-2 ${
                    selectedCredito.saldo_atual > 0 ? 'text-green-600' : 
                    selectedCredito.saldo_atual < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {formatCurrency(selectedCredito.saldo_atual)}
                  </span>
                </div>
                <div>
                  <strong>Diferença:</strong>
                  <span className={`ml-2 ${
                    (selectedCredito.saldo_atual - selectedCredito.valor_original) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(selectedCredito.saldo_atual - selectedCredito.valor_original)}
                  </span>
                </div>
                <div>
                  <strong>Criado em:</strong> {new Date(selectedCredito.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
              
              {selectedCredito.descricao && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <strong>Descrição:</strong>
                  <p className="text-gray-700 mt-1">{selectedCredito.descricao}</p>
                </div>
              )}
            </div>

            {/* Movimentacoes List */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Histórico de Movimentações</h3>
              {loadingMovimentacoes ? (
                <div className="text-center py-4">
                  <p>Carregando movimentações...</p>
                </div>
              ) : movimentacoes.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p>Nenhuma movimentação encontrada.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {movimentacoes.map((mov) => (
                    <div 
                      key={mov.id} 
                      className="border border-gray-200 rounded-lg p-3 bg-white"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            mov.tipo === 'COMPENSACAO' ? 'bg-red-100 text-red-800' :
                            mov.tipo === 'ATUALIZACAO_SELIC' ? 'bg-orange-100 text-orange-800' :
                            mov.tipo === 'REAJUSTE' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {mov.tipo.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {new Date(mov.created_at).toLocaleDateString('pt-BR')}
                          </span>
                          <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEditMovimentacao(mov)}
                            className="text-blue-600 hover:text-blue-800"
                          />
                          <Popconfirm
                            title="Deletar Movimentação"
                            description="Tem certeza que deseja deletar esta movimentação?"
                            onConfirm={() => handleDeleteMovimentacao(mov.id)}
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
                          <span className={`ml-1 ${mov.valor >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(Math.abs(mov.valor))}
                          </span>
                        </div>
                        <div>
                          <strong>Saldo Anterior:</strong> {formatCurrency(mov.saldo_anterior)}
                        </div>
                        <div>
                          <strong>Saldo Posterior:</strong> {formatCurrency(mov.saldo_posterior)}
                        </div>
                      </div>
                      {mov.descricao && (
                        <div className="mt-2 text-sm text-gray-600">
                          <strong>Descrição:</strong> {mov.descricao}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Create Movimentacao Modal */}
      <Modal
        title="Nova Movimentação"
        open={showMovimentacaoModal}
        onCancel={() => {
          setShowMovimentacaoModal(false);
          movimentacaoForm.resetFields();
        }}
        onOk={() => movimentacaoForm.submit()}
        confirmLoading={creatingMovimentacao}
        width={500}
      >
        <Form
          form={movimentacaoForm}
          layout="vertical"
          onFinish={handleCreateMovimentacao}
        >
          <Form.Item
            name="tipo"
            label="Tipo de Movimentação"
            rules={[{ required: true, message: 'Por favor, selecione o tipo de movimentação' }]}
          >
            <Select placeholder="Selecione o tipo">
              <Select.Option value="COMPENSACAO">Compensação</Select.Option>
              <Select.Option value="ATUALIZACAO_SELIC">Atualização SELIC</Select.Option>
              <Select.Option value="REAJUSTE">Reajuste</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="valor"
            label="Valor da Movimentação"
            rules={[
              { required: true, message: 'Por favor, insira o valor' },
              { type: 'number', min: 0.01, message: 'O valor deve ser maior que zero' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="0,00"
              formatter={formatInputCurrency}
              parser={parseInputCurrency}
              precision={2}
            />
          </Form.Item>

          <Form.Item
            name="descricao"
            label="Descrição"
            rules={[
              { required: true, message: 'Por favor, insira uma descrição' },
              { min: 5, message: 'A descrição deve ter pelo menos 5 caracteres' }
            ]}
          >
            <Input.TextArea 
              placeholder="Descreva o motivo ou detalhes da movimentação..."
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="created_at"
            label="Data da Movimentação"
            initialValue={dayjs()}
            rules={[{ required: true, message: 'Por favor, selecione a data da movimentação' }]}
          >
            <DatePicker
              showTime={{ format: 'HH:mm' }}
              format="DD/MM/YYYY HH:mm"
              placeholder="Selecione a data e hora"
              style={{ width: '100%' }}
              disabledDate={(current) => current && current > dayjs().endOf('day')}
            />
          </Form.Item>

          {selectedCredito && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Crédito:</strong> {selectedCredito.nome}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Saldo Atual:</strong> {formatCurrency(selectedCredito.saldo_atual)}
              </p>
            </div>
          )}
        </Form>
      </Modal>

      {/* Edit Movimentacao Modal */}
      <Modal
        title="Editar Movimentação"
        open={showEditMovimentacaoModal}
        onCancel={() => {
          setShowEditMovimentacaoModal(false);
          editMovimentacaoForm.resetFields();
          setEditingMovimentacao(null);
        }}
        onOk={() => editMovimentacaoForm.submit()}
        confirmLoading={updatingMovimentacao}
        width={500}
      >
        <Form
          form={editMovimentacaoForm}
          layout="vertical"
          onFinish={handleUpdateMovimentacao}
        >
          <Form.Item
            name="tipo"
            label="Tipo de Movimentação"
            rules={[{ required: true, message: 'Por favor, selecione o tipo de movimentação' }]}
          >
            <Select placeholder="Selecione o tipo">
              <Select.Option value="COMPENSACAO">Compensação</Select.Option>
              <Select.Option value="ATUALIZACAO_SELIC">Atualização SELIC</Select.Option>
              <Select.Option value="REAJUSTE">Reajuste</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="valor"
            label="Valor da Movimentação"
            rules={[
              { required: true, message: 'Por favor, insira o valor' },
              { type: 'number', min: 0.01, message: 'O valor deve ser maior que zero' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="0,00"
              formatter={formatInputCurrency}
              parser={parseInputCurrency}
              precision={2}
            />
          </Form.Item>

          <Form.Item
            name="descricao"
            label="Descrição"
            rules={[
              { required: true, message: 'Por favor, insira uma descrição' },
              { min: 5, message: 'A descrição deve ter pelo menos 5 caracteres' }
            ]}
          >
            <Input.TextArea 
              placeholder="Descreva o motivo ou detalhes da movimentação..."
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="created_at"
            label="Data da Movimentação"
            rules={[{ required: true, message: 'Por favor, selecione a data da movimentação' }]}
          >
            <DatePicker
              showTime={{ format: 'HH:mm' }}
              format="DD/MM/YYYY HH:mm"
              placeholder="Selecione a data e hora"
              style={{ width: '100%' }}
              disabledDate={(current) => current && current > dayjs().endOf('day')}
            />
          </Form.Item>

          {editingMovimentacao && (
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Editando:</strong> Movimentação #{editingMovimentacao.id}
              </p>
              <p className="text-sm text-blue-600">
                <strong>Saldo Anterior:</strong> {formatCurrency(editingMovimentacao.saldo_anterior)}
              </p>
              <p className="text-sm text-blue-600">
                <strong>Saldo Posterior:</strong> {formatCurrency(editingMovimentacao.saldo_posterior)}
              </p>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
}

export default CreditoPage;