import { useState, useEffect } from 'react';
import { Form, message } from 'antd';
import { 
  getCreditosCliente, 
  createCredito, 
  updateCredito, 
  deleteCredito 
} from '../services/creditos';
import type { Cliente } from '../types/cliente';
import type { Credito, CreateCreditoData, UpdateCreditoData } from '../types/credito';
import type { CreateFormValues, UpdateFormValues } from '../components/credito';
import { isSelicEnabled } from '../utils/creditoHelpers';

export const useCreditos = (selectedClient: Cliente | null) => {
  const [creditos, setCreditos] = useState<Credito[]>([]);
  const [filteredCreditos, setFilteredCreditos] = useState<Credito[]>([]);
  const [nomeFilter, setNomeFilter] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm] = Form.useForm();
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCredito, setEditingCredito] = useState<Credito | null>(null);
  const [updating, setUpdating] = useState(false);
  const [editForm] = Form.useForm();
  
  // Delete state
  const [deleting, setDeleting] = useState<number | null>(null);

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
      createForm.resetFields();
    } catch (error) {
      console.error('Error creating credit:', error);
      message.error('Erro ao criar crédito');
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (credito: Credito) => {
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

  const closeCreateModal = () => {
    setShowCreateModal(false);
    createForm.resetFields();
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingCredito(null);
    editForm.resetFields();
  };

  return {
    // State
    creditos,
    filteredCreditos,
    nomeFilter,
    loading,
    deleting,
    
    // Create modal
    showCreateModal,
    creating,
    createForm,
    openCreateModal: () => setShowCreateModal(true),
    closeCreateModal,
    handleCreateCredito,
    
    // Edit modal
    showEditModal,
    editingCredito,
    updating,
    editForm,
    openEditModal,
    closeEditModal,
    handleUpdateCredito,
    
    // Actions
    setNomeFilter,
    handleDeleteCredito,
    loadCreditos,
  };
};
