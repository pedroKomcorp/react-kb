
import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, message } from 'antd';
import { CreditCardOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getCreditosCliente, createCredito, updateCredito, deleteCredito } from '../../../services/creditos';
import { getMovimentacoesByCredito, createMovimentacaoForCredito, updateMovimentacao as updateMovFromService, deleteMovimentacao as deleteMovFromService } from '../../../services/movimentacoes';
import type { Cliente } from '../../../types/cliente';
import type { Credito, CreateCreditoData, UpdateCreditoData } from '../../../types/credito';
import type { MovimentacaoCredito as MovimentacaoFromService, CreateMovimentacaoData, UpdateMovimentacaoData } from '../../../types/movimentacao';

import {
  CreditoCard,
  CreditoSummary,
  CreditoFilters,
  CreditoCreateModal,
  CreditoEditModal,
  CreditoDetailModal,
  MovimentacaoForm,
  type CreateFormValues,
  type UpdateFormValues,
  type MovimentacaoFormValues
} from '../../../components/credito';





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
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoFromService[]>([]);
  const [loadingMovimentacoes, setLoadingMovimentacoes] = useState(false);
  const [showEditMovimentacaoModal, setShowEditMovimentacaoModal] = useState(false);
  const [editingMovimentacao, setEditingMovimentacao] = useState<MovimentacaoFromService | null>(null);
  const [updatingMovimentacao, setUpdatingMovimentacao] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [movimentacaoForm] = Form.useForm();
  const [editMovimentacaoForm] = Form.useForm();

  // Helper function to check if tem_atualizacao_selic is true (handles different data types from API)
  const isSelicEnabled = (value: unknown): boolean => {
    return value === true || value === 'true' || value === 1 || value === '1';
  };

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
      setCreditos(creditosData || []);
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
        tem_atualizacao_selic: Boolean(values.tem_atualizacao_selic),
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
      tem_atualizacao_selic: isSelicEnabled(credito.tem_atualizacao_selic),
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
        tem_atualizacao_selic: Boolean(values.tem_atualizacao_selic),
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
      const movimentacoesData = await getMovimentacoesByCredito(creditoId);      
      // Handle different response formats
      if (Array.isArray(movimentacoesData)) {
        setMovimentacoes(movimentacoesData);
      } else if (movimentacoesData && typeof movimentacoesData === 'object' && 'movimentacoes' in movimentacoesData) {
        // If the response is wrapped in an object with a movimentacoes property
        const wrappedData = movimentacoesData as { movimentacoes: MovimentacaoFromService[] };
        setMovimentacoes(wrappedData.movimentacoes || []);
      } else {
        console.warn('Unexpected movimentacoes data format:', movimentacoesData);
        setMovimentacoes([]);
      }
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
        credito_id: selectedCredito.id,
        tipo: values.tipo,
        valor: values.valor,
        descricao: values.descricao,
      };
      
      await createMovimentacaoForCredito(selectedCredito.id, { 
        tipo: movimentacaoData.tipo, 
        valor: movimentacaoData.valor, 
        descricao: movimentacaoData.descricao 
      });
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

  const handleEditMovimentacao = (movimentacao: MovimentacaoFromService) => {
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
      };
      
      await updateMovFromService(editingMovimentacao.id, updateData);
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
      await deleteMovFromService(movimentacaoId);
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



  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value).replace('R$', 'R$').replace(/\s/, '');
  };



  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-transparent rounded-lg pl-20 p-4 flex items-center justify-between flex-shrink-0">
        <h1 className="text-2xl pl-5 font-bold text-white">
          CONTROLE DE CRÉDITO
        </h1>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-auto p-6">
        <div className="w-full pl-20">
          {/* Main Content Container */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              {/* Filters */}
              <CreditoFilters
                selectedClient={selectedClient}
                onClientSelect={handleClientSelect}
                nomeFilter={nomeFilter}
                onNomeFilterChange={setNomeFilter}
                onCreateCredito={() => setShowCreateModal(true)}
              />
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
                          <CreditoCard
                            key={credito.id}
                            credito={credito}
                            onEdit={handleEditCredito}
                            onDelete={handleDeleteCredito}
                            onClick={handleCreditoClick}
                            isDeleting={deleting === credito.id}
                          />
                        ))}
                      </div>

                      {/* Summary */}
                      <CreditoSummary
                        creditos={filteredCreditos}
                        isFiltered={!!nomeFilter.trim()}
                        totalCreditos={creditos.length}
                        filterName={nomeFilter}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Credit Modal */}
      <CreditoCreateModal
        open={showCreateModal}
        onCancel={() => {
          setShowCreateModal(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        form={form}
        onFinish={handleCreateCredito}
        loading={creating}
        selectedClient={selectedClient}
      />

      {/* Edit Credit Modal */}
      <CreditoEditModal
        open={showEditModal}
        onCancel={() => {
          setShowEditModal(false);
          setEditingCredito(null);
          editForm.resetFields();
        }}
        onOk={() => editForm.submit()}
        form={editForm}
        onFinish={handleUpdateCredito}
        loading={updating}
        editingCredito={editingCredito}
      />

      {/* Credit Detail Modal */}
      <CreditoDetailModal
        open={showDetailModal}
        onCancel={() => {
          setShowDetailModal(false);
          setSelectedCredito(null);
          setMovimentacoes([]);
        }}
        credito={selectedCredito}
        movimentacoes={movimentacoes}
        loading={loadingMovimentacoes}
        onNovaMovimentacao={() => setShowMovimentacaoModal(true)}
        onEditMovimentacao={handleEditMovimentacao}
        onDeleteMovimentacao={handleDeleteMovimentacao}
      />

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
        <MovimentacaoForm
          form={movimentacaoForm}
          onFinish={handleCreateMovimentacao}
        />
        {selectedCredito && (
          <div className="bg-gray-50 p-3 rounded-md mt-4">
            <p className="text-sm text-gray-600">
              <strong>Crédito:</strong> {selectedCredito.nome}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Saldo Atual:</strong> {formatCurrency(selectedCredito.saldo_atual)}
            </p>
          </div>
        )}
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
        <MovimentacaoForm
          form={editMovimentacaoForm}
          onFinish={handleUpdateMovimentacao}
        />
        {editingMovimentacao && (
          <div className="bg-blue-50 p-3 rounded-md mt-4">
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
      </Modal>
    </div>
  );
}

export default CreditoPage;