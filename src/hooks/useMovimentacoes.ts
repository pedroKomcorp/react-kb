import { useState } from 'react';
import { Form, message } from 'antd';
import dayjs from 'dayjs';
import {
  getMovimentacoesByCredito,
  createMovimentacaoForCredito,
  updateMovimentacao as updateMovFromService,
  deleteMovimentacao as deleteMovFromService,
} from '../services/movimentacoes';
import type { Credito } from '../types/credito';
import type {
  MovimentacaoCredito,
  CreateMovimentacaoData,
  UpdateMovimentacaoData,
} from '../types/movimentacao';
import type { MovimentacaoFormValues } from '../components/credito';
import { handleApiError } from '../utils/creditoHelpers';

interface UseMovimentacoesProps {
  onCreditoUpdate?: () => Promise<void>;
}

export const useMovimentacoes = ({ onCreditoUpdate }: UseMovimentacoesProps = {}) => {
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoCredito[]>([]);
  const [loadingMovimentacoes, setLoadingMovimentacoes] = useState(false);
  
  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingMovimentacao, setCreatingMovimentacao] = useState(false);
  const [createForm] = Form.useForm();
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMovimentacao, setEditingMovimentacao] = useState<MovimentacaoCredito | null>(null);
  const [updatingMovimentacao, setUpdatingMovimentacao] = useState(false);
  const [editForm] = Form.useForm();
  
  // Selected credito for operations
  const [selectedCredito, setSelectedCredito] = useState<Credito | null>(null);

  const loadMovimentacoes = async (creditoId: number) => {
    setLoadingMovimentacoes(true);
    try {
      const movimentacoesData = await getMovimentacoesByCredito(creditoId);
      
      // Handle different response formats
      if (Array.isArray(movimentacoesData)) {
        setMovimentacoes(movimentacoesData);
      } else if (movimentacoesData && typeof movimentacoesData === 'object' && 'movimentacoes' in movimentacoesData) {
        const wrappedData = movimentacoesData as { movimentacoes: MovimentacaoCredito[] };
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
        descricao: movimentacaoData.descricao,
      });
      
      await loadMovimentacoes(selectedCredito.id);
      await onCreditoUpdate?.();
      
      message.success('Movimentação criada com sucesso!');
      setShowCreateModal(false);
      createForm.resetFields();
    } catch (error) {
      const errorMessage = handleApiError(error, 'Erro ao criar movimentação. Verifique os dados informados.');
      message.error(errorMessage);
    } finally {
      setCreatingMovimentacao(false);
    }
  };

  const openEditModal = (movimentacao: MovimentacaoCredito) => {
    setEditingMovimentacao(movimentacao);
    editForm.setFieldsValue({
      tipo: movimentacao.tipo,
      valor: movimentacao.valor,
      descricao: movimentacao.descricao,
      created_at: dayjs(movimentacao.created_at),
    });
    setShowEditModal(true);
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
      await onCreditoUpdate?.();
      
      message.success('Movimentação atualizada com sucesso!');
      setShowEditModal(false);
      editForm.resetFields();
      setEditingMovimentacao(null);
    } catch (error) {
      const errorMessage = handleApiError(error, 'Erro ao atualizar movimentação. Verifique os dados informados.');
      message.error(errorMessage);
    } finally {
      setUpdatingMovimentacao(false);
    }
  };

  const handleDeleteMovimentacao = async (movimentacaoId: number) => {
    if (!selectedCredito) return;
    
    try {
      await deleteMovFromService(movimentacaoId);
      await loadMovimentacoes(selectedCredito.id);
      await onCreditoUpdate?.();
      
      message.success('Movimentação deletada com sucesso!');
    } catch (error) {
      console.error('Error deleting movimentacao:', error);
      message.error('Erro ao deletar movimentação');
    }
  };

  const openCreditoDetail = (credito: Credito) => {
    setSelectedCredito(credito);
    loadMovimentacoes(credito.id);
  };

  const closeCreditoDetail = () => {
    setSelectedCredito(null);
    setMovimentacoes([]);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    createForm.resetFields();
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    editForm.resetFields();
    setEditingMovimentacao(null);
  };

  return {
    // State
    movimentacoes,
    loadingMovimentacoes,
    selectedCredito,
    
    // Create modal
    showCreateModal,
    creatingMovimentacao,
    createForm,
    openCreateModal: () => setShowCreateModal(true),
    closeCreateModal,
    handleCreateMovimentacao,
    
    // Edit modal
    showEditModal,
    editingMovimentacao,
    updatingMovimentacao,
    editForm,
    openEditModal,
    closeEditModal,
    handleUpdateMovimentacao,
    
    // Actions
    loadMovimentacoes,
    handleDeleteMovimentacao,
    openCreditoDetail,
    closeCreditoDetail,
  };
};
