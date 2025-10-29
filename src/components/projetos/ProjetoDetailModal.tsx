import React, { useEffect, useState } from 'react';
import { Modal, List, Button, Input, Select, Space, Typography, Popconfirm, Descriptions, Divider, Tag, message, InputNumber } from 'antd';
import { FolderOpenOutlined, EditOutlined, SaveOutlined, CloseCircleOutlined, PlusOutlined, DeleteOutlined, UserOutlined, CreditCardOutlined, DollarOutlined } from '@ant-design/icons';
import type { Projeto } from '../../types/projeto';
import type { Usuario } from '../../types/usuario';
import type { Etapa, StatusEtapaEnum } from '../../types/etapa';
import type { Credito } from '../../types/credito';
import type { MovimentacaoCredito } from '../../types/movimentacao';
import type { Guia, StatusGuiaEnum } from '../../types/guia';
import ClienteSelector from '../cliente/ClienteSelector';
import type { Cliente } from '../../types/cliente';
import { getCreditosCliente } from '../../services/creditos';
import { getClientes } from '../../services/clientes';
import { createMovimentacao, associarMovimentacaoAGuia, getMovimentacoesByProjeto, updateMovimentacao, deleteMovimentacao } from '../../services/movimentacoes';
// Note: getMovimentacoesByProjetoDetalhadas is available for detailed reports if needed
import { getGuias, createGuia, getGuiasByCliente, updateGuia } from '../../services/guias';

import { associateCreditoToProjeto, disassociateCreditoFromProjeto } from '../../services/projetos';

interface ProjetoDetailModalProps {
  projeto: Projeto | null;
  usuarios: Usuario[];
  open: boolean;
  onClose: () => void;
  onAddEtapa: (etapa: Partial<Etapa>) => void;
  onSelectEtapa: (etapa: Etapa) => void;
  onUpdateProjeto: (projeto: Partial<Projeto>) => void;
  onUpdateEtapa: (etapa: Partial<Etapa> & { id: number }) => void;
  onDeleteEtapa: (etapaId: number) => void;
  loading?: boolean;
  canEditProjeto?: boolean;
  canAddEtapa?: boolean;
  canEditEtapa?: boolean;
  canAddCredito?: boolean;
}

const { Title, Text } = Typography;

// Helper to extract error messages from API responses
const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>;
    if (err.response && typeof err.response === 'object') {
      const response = err.response as Record<string, unknown>;
      if (response.data && typeof response.data === 'object') {
        const data = response.data as Record<string, unknown>;
        if (typeof data.detail === 'string') return data.detail;
      }
    }
    if (typeof err.message === 'string') return err.message;
  }
  return 'Erro desconhecido';
};

const statusOptions = [
  { value: 'NI', label: 'Não Iniciada', color: 'default' },
  { value: 'EA', label: 'Em Andamento', color: 'processing' },
  { value: 'C', label: 'Concluída', color: 'success' },
  { value: 'P', label: 'Pausada', color: 'warning' },
];

const getStatusTag = (status: string) => {
  const option = statusOptions.find(opt => opt.value === status);
  return <Tag color={option?.color || 'default'}>{option?.label || status}</Tag>;
};

const priorityOptions = [
    { value: 'UT', label: 'Urgente' },
    { value: 'AL', label: 'Alta' },
    { value: 'MD', label: 'Média' },
    { value: 'BA', label: 'Baixa' },
];

const categoryOptions = [
    { value: 'OT', label: 'Outro' },
    { value: 'CP', label: 'Compensação' },
];

// Helper to format date for input[type="date"]
const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  return dateString.split('T')[0];
};


const ProjetoDetailModal: React.FC<ProjetoDetailModalProps> = ({
  projeto,
  usuarios,
  open,
  onClose,
  onAddEtapa,
  onSelectEtapa,
  onUpdateProjeto,
  onUpdateEtapa,
  onDeleteEtapa,
  loading,
  // --- DESTRUCTURED WITH DEFAULT VALUE ---
  canEditProjeto = true,
  canAddEtapa = true,
  canEditEtapa = true,
  canAddCredito = true,
}) => {
  // State for toggling UI sections
  const [isAddingEtapa, setIsAddingEtapa] = useState(false);
  const [isEditingProjeto, setIsEditingProjeto] = useState(false);
  const [editingEtapaId, setEditingEtapaId] = useState<number | null>(null);

  // Credito management state
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [availableCreditos, setAvailableCreditos] = useState<Credito[]>([]);
  const [selectedCredito, setSelectedCredito] = useState<number | undefined>(undefined);
  const [loadingCreditos, setLoadingCreditos] = useState(false);
  const [associatingCredito, setAssociatingCredito] = useState(false);
  
  // Clientes list for displaying cliente name
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);

  // Movimentacoes and Guias state for CP projects
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoCredito[]>([]);
  const [guias, setGuias] = useState<Guia[]>([]);
  const [isAddingMovimentacao, setIsAddingMovimentacao] = useState(false);
  const [isAddingGuia, setIsAddingGuia] = useState(false);
  const [editingGuiaId, setEditingGuiaId] = useState<number | undefined>(undefined);
  const [editingMovimentacaoId, setEditingMovimentacaoId] = useState<number | undefined>(undefined);
  const [movimentacaoError, setMovimentacaoError] = useState<string>('');
  const [editedGuia, setEditedGuia] = useState<Partial<Guia>>({});
  const [newMovimentacao, setNewMovimentacao] = useState<{
    credito_id?: number;
    valor: number;
    descricao: string;
    referencia_externa: string;
    guia_id?: number;
  }>({
    valor: 0,
    descricao: '',
    referencia_externa: ''
  });
  const [newGuia, setNewGuia] = useState<{
    tipo_guia: string;
    valor_principal: number;
    valor_total: number;
    data_vencimento: string;
    codigo_receita: string;
    periodo_apuracao: string;
    observacoes: string;
  }>({
    tipo_guia: '',
    valor_principal: 0,
    valor_total: 0,
    data_vencimento: '',
    codigo_receita: '',
    periodo_apuracao: '',
    observacoes: ''
  });

  // Handle movimentacao creation
  const handleAddMovimentacao = async () => {
    setMovimentacaoError('');
    
    if (!newMovimentacao.credito_id || !newMovimentacao.valor || !newMovimentacao.descricao) {
      const errorMsg = 'Preencha todos os campos obrigatórios: crédito, valor e descrição';
      setMovimentacaoError(errorMsg);
      message.error(errorMsg);
      return;
    }

    if (!editedProjeto?.id) {
      const errorMsg = 'Projeto não encontrado';
      setMovimentacaoError(errorMsg);
      message.error(errorMsg);
      return;
    }

    try {
      const movimentacaoData = {
        credito_id: newMovimentacao.credito_id,
        valor: newMovimentacao.valor,
        descricao: newMovimentacao.descricao,
        referencia_externa: newMovimentacao.referencia_externa,
        tipo: 'COMPENSACAO' as const,
        projeto_id: editedProjeto.id
      };
      
      console.log('Creating movimentação with data:', movimentacaoData);
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);
      
      const createdMovimentacao = await createMovimentacao(movimentacaoData, token || undefined);
      console.log('Movimentação created successfully:', createdMovimentacao);
      
      // Associate with guia if selected
      if (newMovimentacao.guia_id) {
        try {
          await associarMovimentacaoAGuia(createdMovimentacao.id, newMovimentacao.guia_id, token || undefined);
        } catch (error: unknown) {
          console.error('Erro ao associar movimentação à guia:', error);
          const errorMsg = getErrorMessage(error);
          setMovimentacaoError(errorMsg);
          message.warning('Movimentação criada, mas houve erro ao associar à guia: ' + errorMsg);
        }
      }
      
      setMovimentacoes(prev => [...prev, createdMovimentacao]);
      
      // Reset form
      setNewMovimentacao({
        valor: 0,
        descricao: '',
        referencia_externa: ''
      });
      setIsAddingMovimentacao(false);
      setMovimentacaoError('');
      
      message.success('Movimentação criada com sucesso!');
    } catch (error: unknown) {
      console.error('Erro ao criar movimentação:', error);
      const errorMsg = getErrorMessage(error);
      setMovimentacaoError(errorMsg);
      message.error('Erro ao criar movimentação: ' + errorMsg);
    }
  };

  // Handle guia creation
  const handleAddGuia = async () => {
    if (!newGuia.tipo_guia || !newGuia.valor_total) {
      message.error('Preencha todos os campos obrigatórios da guia');
      return;
    }

    try {
      const guiaData = {
        tipo_guia: newGuia.tipo_guia,
        valor_principal: newGuia.valor_principal,
        valor_total: newGuia.valor_total,
        data_vencimento: newGuia.data_vencimento,
        codigo_receita: newGuia.codigo_receita,
        periodo_apuracao: newGuia.periodo_apuracao,
        observacoes: newGuia.observacoes,
        status: 'PENDENTE' as StatusGuiaEnum
      };
      
      const token = localStorage.getItem('token');
      const createdGuia = await createGuia(guiaData, token || undefined);
      // Ensure we always work with arrays and valid data
      if (createdGuia && typeof createdGuia === 'object') {
        setGuias(prev => Array.isArray(prev) ? [...prev, createdGuia] : [createdGuia]);
        
        // Auto-select the newly created guia for the movimentação
        setNewMovimentacao(prev => ({...prev, guia_id: createdGuia.id}));
      }
      
      // Reset form
      setNewGuia({
        tipo_guia: '',
        valor_principal: 0,
        valor_total: 0,
        data_vencimento: '',
        codigo_receita: '',
        periodo_apuracao: '',
        observacoes: ''
      });
      setIsAddingGuia(false);
      
      message.success('Guia criada com sucesso e selecionada para a movimentação!');
    } catch (error) {
      console.error('Erro ao criar guia:', error);
      message.error('Erro ao criar guia');
    }
  };

  // Handle guia editing
  const handleEditGuia = async () => {
    if (!editingGuiaId || !editedGuia) return;
    
    try {
      const token = localStorage.getItem('token');
      const updatedGuia = await updateGuia(editingGuiaId, editedGuia, token || undefined);
      
      // Update the guia in the list
      setGuias(prev => prev.map(g => g.id === editingGuiaId ? updatedGuia : g));
      
      setEditingGuiaId(undefined);
      setEditedGuia({});
      message.success('Guia atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao editar guia:', error);
      const errorMsg = getErrorMessage(error);
      message.error('Erro ao editar guia: ' + errorMsg);
    }
  };

  // Handle movimentacao editing
  const handleEditMovimentacao = async () => {
    if (!editingMovimentacaoId) return;
    
    const movToEdit = movimentacoes.find(m => m.id === editingMovimentacaoId);
    if (!movToEdit) {
      message.error('Movimentação não encontrada');
      return;
    }

    // Use the newMovimentacao state which has the edited values
    if (!newMovimentacao.credito_id || !newMovimentacao.valor || !newMovimentacao.descricao) {
      message.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const updateData = {
        credito_id: newMovimentacao.credito_id,
        valor: newMovimentacao.valor,
        descricao: newMovimentacao.descricao,
        referencia_externa: newMovimentacao.referencia_externa
      };
      
      const updatedMov = await updateMovimentacao(editingMovimentacaoId, updateData, token || undefined);
      
      // Update the movimentacao in the list
      setMovimentacoes(prev => prev.map(m => m.id === editingMovimentacaoId ? updatedMov : m));
      
      // Reset form
      setEditingMovimentacaoId(undefined);
      setNewMovimentacao({
        valor: 0,
        descricao: '',
        referencia_externa: ''
      });
      setIsAddingMovimentacao(false);
      message.success('Movimentação atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao editar movimentação:', error);
      const errorMsg = getErrorMessage(error);
      message.error('Erro ao editar movimentação: ' + errorMsg);
    }
  };

  // Handle movimentacao deletion
  const handleDeleteMovimentacao = async (movimentacaoId: number) => {
    try {
      const token = localStorage.getItem('token');
      await deleteMovimentacao(movimentacaoId, token || undefined);
      
      // Remove from the list
      setMovimentacoes(prev => prev.filter(m => m.id !== movimentacaoId));
      
      message.success('Movimentação excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir movimentação:', error);
      const errorMsg = getErrorMessage(error);
      message.error('Erro ao excluir movimentação: ' + errorMsg);
    }
  };

  // Consolidated state for new etapa form
  const [newEtapa, setNewEtapa] = useState<Partial<Etapa>>({ nome: '', status: 'NI', descricao: '', data_inicio: '', data_prazo: '', data_fim: '', usuario_id: undefined });

  // Consolidated state for the project being edited
  const [editedProjeto, setEditedProjeto] = useState<Projeto | null>(null);
  
  // Consolidated state for the etapa being edited
  const [editedEtapa, setEditedEtapa] = useState<Partial<Etapa> & { id: number } | null>(null);

  useEffect(() => {
    if (projeto) {
      const projectWithNormalizedUsers = { ...projeto } as Projeto;
      if (projectWithNormalizedUsers.anexados && !projectWithNormalizedUsers.usuarios_anexados) {
        projectWithNormalizedUsers.usuarios_anexados = (projectWithNormalizedUsers.anexados as Usuario[])
          .filter(item => item && typeof item.id !== 'undefined')
          .map(user => user.id);
      }
      setEditedProjeto(projectWithNormalizedUsers);
    }
    setIsEditingProjeto(false);
    setIsAddingEtapa(false);
    setEditingEtapaId(null);
  }, [projeto, open]);

  // Fetch clientes when modal opens
  useEffect(() => {
    if (open) {
      setLoadingClientes(true);
      getClientes()
        .then(async (clientesList) => {
          setClientes(clientesList);
          
          // Auto-select the projeto's cliente for CP projects
          if (projeto?.categoria === 'CP' && projeto.cliente_id) {
            const projetoCliente = clientesList.find(c => c.id === projeto.cliente_id);
            if (projetoCliente && projetoCliente.id !== undefined) {
              setSelectedCliente(projetoCliente);
              setSelectedCredito(undefined);
              
              // Fetch creditos for this cliente
              setLoadingCreditos(true);
              try {
                const creditos = await getCreditosCliente(projetoCliente.id);
                setAvailableCreditos(creditos || []);
              } catch (error) {
                console.error('Error loading creditos:', error);
                message.error('Erro ao carregar créditos do cliente');
                setAvailableCreditos([]);
              } finally {
                setLoadingCreditos(false);
              }
            }
          }
        })
        .catch(error => {
          console.error('Error fetching clientes:', error);
        })
        .finally(() => {
          setLoadingClientes(false);
        });
    } else {
      // Reset when modal closes
      setSelectedCliente(null);
      setAvailableCreditos([]);
      setSelectedCredito(undefined);
    }
  }, [open, projeto]);

  // Load movimentacoes for CP projects
  useEffect(() => {
    if (open && editedProjeto?.categoria === 'CP' && editedProjeto.id) {
      const token = localStorage.getItem('token');
      console.log('Loading CP project data for project:', editedProjeto.id);
      console.log('Token available for loading:', !!token);
      
      // Load movimentacoes for this project
      getMovimentacoesByProjeto(editedProjeto.id, token || undefined)
        .then(movimentacoesList => {
          console.log('Raw movimentações response:', movimentacoesList);
          console.log('Type of movimentações response:', typeof movimentacoesList);
          console.log('Is array:', Array.isArray(movimentacoesList));
          
          // Handle different possible response structures
          let processedMovimentacoes: MovimentacaoCredito[] = [];
          
          if (Array.isArray(movimentacoesList)) {
            processedMovimentacoes = movimentacoesList;
          } else if (movimentacoesList && typeof movimentacoesList === 'object') {
            // Check if it's wrapped in a data property
            const responseObj = movimentacoesList as Record<string, unknown>;
            if ('movimentacoes' in responseObj && Array.isArray(responseObj.movimentacoes)) {
              processedMovimentacoes = responseObj.movimentacoes as MovimentacaoCredito[];
            } else if ('data' in responseObj && Array.isArray(responseObj.data)) {
              processedMovimentacoes = responseObj.data as MovimentacaoCredito[];
            } else {
              console.log('Unexpected movimentações response structure:', movimentacoesList);
              processedMovimentacoes = [];
            }
          }
          
          console.log('Processed movimentações for display:', processedMovimentacoes);
          setMovimentacoes(processedMovimentacoes);
        })
        .catch(error => {
          console.error('Error loading movimentacoes for project:', error);
          // Initialize empty array on error
          setMovimentacoes([]);
        });
      
      // Load guias for selection - filtered by client if available
      if (editedProjeto.cliente_id) {
        console.log('Loading guias for cliente_id:', editedProjeto.cliente_id);
        // Use client-specific guia route
        getGuiasByCliente(editedProjeto.cliente_id, token || undefined)
          .then(guiasList => {
            console.log('Raw guias response:', guiasList);
            console.log('Type of guias response:', typeof guiasList);
            console.log('Is array:', Array.isArray(guiasList));
            
            // Handle different possible response structures
            let processedGuias: Guia[] = [];
            
            if (Array.isArray(guiasList)) {
              processedGuias = guiasList;
            } else if (guiasList && typeof guiasList === 'object') {
              // Check if it's wrapped in a data property
              const responseObj = guiasList as Record<string, unknown>;
              if ('guias' in responseObj && Array.isArray(responseObj.guias)) {
                processedGuias = responseObj.guias as Guia[];
              } else if ('data' in responseObj && Array.isArray(responseObj.data)) {
                processedGuias = responseObj.data as Guia[];
              } else {
                console.log('Unexpected guias response structure:', guiasList);
                processedGuias = [];
              }
            }
            
            console.log('Processed guias for display:', processedGuias);
            setGuias(processedGuias);
          })
          .catch(error => {
            console.error('Error loading guias for client:', error);
            // Fallback to all guias if client-specific fails
            return getGuias(token || undefined);
          })
          .then(fallbackGuias => {
            if (fallbackGuias) {
              setGuias(Array.isArray(fallbackGuias) ? fallbackGuias : []);
            }
          })
          .catch(error => {
            console.error('Error loading fallback guias:', error);
            setGuias([]);
          });
      } else {
        // No client, so no guias available for this CP project
        setGuias([]);
      }
    }
  }, [open, editedProjeto]);

  // Debug useEffect for movimentacoes state changes
  useEffect(() => {
    console.log('Movimentacoes state changed:', movimentacoes);
    console.log('Movimentacoes count:', movimentacoes.length);
  }, [movimentacoes]);

  // Debug useEffect for guias state changes
  useEffect(() => {
    console.log('Guias state changed:', guias);
    console.log('Guias count:', guias.length);
  }, [guias]);

  const handleUpdateProjeto = () => {
    if (editedProjeto) {
      onUpdateProjeto(editedProjeto);
      setIsEditingProjeto(false);
    }
  };

  const handleCancelEditProjeto = () => {
    setEditedProjeto(projeto); // Revert changes
    setIsEditingProjeto(false);
  }

  const handleAddEtapa = () => {
    const payload = { ...newEtapa };
    
    const formattedPayload: Partial<Etapa> = {
      ...payload,
      projeto_id: projeto?.id,
      data_inicio: payload.data_inicio ? new Date(`${payload.data_inicio}T00:00:00`).toISOString() : undefined,
      data_prazo: payload.data_prazo ? new Date(`${payload.data_prazo}T00:00:00`).toISOString() : undefined,
      data_fim: payload.data_fim ? new Date(`${payload.data_fim}T00:00:00`).toISOString() : undefined,
    };
    
    Object.keys(formattedPayload).forEach(key => {
        if (formattedPayload[key as keyof Etapa] === undefined) {
            delete formattedPayload[key as keyof Etapa];
        }
    });

    onAddEtapa(formattedPayload);
    setNewEtapa({ nome: '', status: 'NI', descricao: '', data_inicio: '', data_prazo: '', data_fim: '', usuario_id: undefined });
    setIsAddingEtapa(false);
  }

  const handleStartEditEtapa = (etapa: Etapa) => {
    setEditingEtapaId(etapa.id);
    setEditedEtapa({ ...etapa });
  };

  const handleCancelEditEtapa = () => {
    setEditingEtapaId(null);
    setEditedEtapa(null);
  };
  
  const handleUpdateEtapa = () => {
    if (editedEtapa) {
      const payload = { ...editedEtapa };

      const formattedPayload = {
        ...payload,
        data_inicio: payload.data_inicio ? new Date(`${payload.data_inicio.split('T')[0]}T00:00:00`).toISOString() : undefined,
        data_prazo: payload.data_prazo ? new Date(`${payload.data_prazo.split('T')[0]}T00:00:00`).toISOString() : undefined,
        data_fim: payload.data_fim ? new Date(`${payload.data_fim.split('T')[0]}T00:00:00`).toISOString() : undefined,
      };

      Object.keys(formattedPayload).forEach(key => {
        if (formattedPayload[key as keyof typeof formattedPayload] === undefined) {
            delete formattedPayload[key as keyof typeof formattedPayload];
        }
      });
      
      onUpdateEtapa(formattedPayload as Partial<Etapa> & { id: number });
      handleCancelEditEtapa();
    }
  };

  const handleAssociateCredito = async () => {
    if (!projeto?.id || !selectedCredito) return;
    
    setAssociatingCredito(true);
    try {
      await associateCreditoToProjeto(projeto.id, selectedCredito);
      message.success('Crédito associado com sucesso!');
      
      // Update the projeto creditos list in the local state
      if (editedProjeto) {
        const associatedCredito = availableCreditos.find(c => c.id === selectedCredito);
        if (associatedCredito) {
          const updatedCreditos = [...(editedProjeto.creditos || []), associatedCredito];
          setEditedProjeto({ ...editedProjeto, creditos: updatedCreditos });
        }
      }
      
      // Reset only credito selection, keep client selected for more associations
      setSelectedCredito(undefined);
    } catch (error) {
      console.error('Error associating credito:', error);
      message.error('Erro ao associar crédito');
    } finally {
      setAssociatingCredito(false);
    }
  };

  const handleDisassociateCredito = async (creditoId: number) => {
    if (!projeto?.id) return;
    
    try {
      await disassociateCreditoFromProjeto(projeto.id, creditoId);
      message.success('Crédito desassociado com sucesso!');
      
      // Update the projeto creditos list in the local state
      if (editedProjeto) {
        const updatedCreditos = (editedProjeto.creditos || []).filter(c => c.id !== creditoId);
        setEditedProjeto({ ...editedProjeto, creditos: updatedCreditos });
      }
    } catch (error) {
      console.error('Error disassociating credito:', error);
      message.error('Erro ao desassociar crédito');
    }
  };

  if (!projeto || !editedProjeto) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      title={
        <Space align="center" size="middle">
            <FolderOpenOutlined style={{ color: '#1890ff' }} />
            <Title level={4} style={{ margin: 0 }}>{editedProjeto.nome}</Title>
        </Space>
      }
    >
      <div className="space-y-4 pt-4">
        <div className="flex justify-end gap-2">
            {/* --- CONDITIONAL RENDERING APPLIED --- */}
            {!isEditingProjeto ? (
                canEditProjeto && <Button icon={<EditOutlined />} onClick={() => setIsEditingProjeto(true)}>Editar Projeto</Button>
            ) : (
                <>
                    <Button icon={<CloseCircleOutlined />} onClick={handleCancelEditProjeto}>Cancelar</Button>
                    <Button type="primary" icon={<SaveOutlined />} onClick={handleUpdateProjeto}>Salvar Projeto</Button>
                </>
            )}
        </div>

        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Nome do Projeto">
            {isEditingProjeto ? <Input value={editedProjeto.nome} onChange={e => setEditedProjeto(p => p ? { ...p, nome: e.target.value } : null)} /> : <strong>{editedProjeto.nome}</strong>}
          </Descriptions.Item>
          <Descriptions.Item label="Responsável">
            {isEditingProjeto ? <Select value={editedProjeto.responsavel_id} onChange={val => setEditedProjeto(p => p ? { ...p, responsavel_id: val } : null)} options={usuarios.map(u => ({ value: u.id, label: u.nome }))} style={{ width: '100%' }} /> : (usuarios.find(u => u.id === editedProjeto.responsavel_id)?.nome || 'N/A')}
          </Descriptions.Item>
          
          <Descriptions.Item label="Cliente">
            {isEditingProjeto ? (
              <ClienteSelector
                onClientSelect={(cliente) => setEditedProjeto(p => p ? { ...p, cliente_id: cliente?.id || null } : null)}
                selectedClient={editedProjeto.cliente_id ? clientes.find(c => c.id === editedProjeto.cliente_id) || null : null}
                placeholder="Selecione um cliente"
              />
            ) : (
              editedProjeto.cliente_id ? (
                loadingClientes ? (
                  `Cliente ID: ${editedProjeto.cliente_id} (carregando...)`
                ) : (
                  (() => {
                    // Handle both string and number ID comparisons
                    const foundCliente = clientes.find(c => c.id == editedProjeto.cliente_id); // Using == instead of === fo
                    return foundCliente?.razao_social || `Cliente ID: ${editedProjeto.cliente_id} (não encontrado)`;
                  })()
                )
              ) : 'Nenhum cliente associado'
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Status">
            {isEditingProjeto ? <Select value={editedProjeto.status} onChange={val => setEditedProjeto(p => p ? { ...p, status: val } : null)} options={statusOptions.map(s=> ({value: s.value, label: s.label}))} style={{ width: '100%' }} /> : getStatusTag(editedProjeto.status)}
          </Descriptions.Item>
           <Descriptions.Item label="Prioridade">
            {isEditingProjeto ? <Select value={editedProjeto.prioridade} onChange={val => setEditedProjeto(p => p ? { ...p, prioridade: val } : null)} options={priorityOptions} style={{ width: '100%' }} /> : editedProjeto.prioridade}
          </Descriptions.Item>

          <Descriptions.Item label="Categoria">
            {isEditingProjeto ? <Select value={editedProjeto.categoria} onChange={val => setEditedProjeto(p => p ? { ...p, categoria: val } : null)} options={categoryOptions} style={{ width: '100%' }} /> : categoryOptions.find(c=>c.value === editedProjeto.categoria)?.label}
          </Descriptions.Item>
          <Descriptions.Item label="Anexos">
            {Array.isArray(editedProjeto.anexados) ? editedProjeto.anexados.length : 0}
          </Descriptions.Item>

          <Descriptions.Item label="Data de Início" span={1}>
             {isEditingProjeto ? <Input type="date" value={formatDateForInput(editedProjeto.data_inicio)} onChange={e => setEditedProjeto(p => p ? { ...p, data_inicio: e.target.value } : null)} /> : (formatDateForInput(editedProjeto.data_inicio) || '-')}
          </Descriptions.Item>
          <Descriptions.Item label="Prazo Final" span={1}>
             {isEditingProjeto ? <Input type="date" value={formatDateForInput(editedProjeto.data_prazo)} onChange={e => setEditedProjeto(p => p ? { ...p, data_prazo: e.target.value } : null)} /> : (formatDateForInput(editedProjeto.data_prazo) || '-')}
          </Descriptions.Item>

          <Descriptions.Item label="Descrição" span={2}>
            {isEditingProjeto ? <Input.TextArea value={editedProjeto.descricao || ''} onChange={e => setEditedProjeto(p => p ? { ...p, descricao: e.target.value } : null)} rows={3}/> : (editedProjeto.descricao || '-')}
          </Descriptions.Item>
           <Descriptions.Item label="Usuários Anexados" span={2}>
            {isEditingProjeto ? (
              <Select mode="multiple" value={editedProjeto.usuarios_anexados} onChange={val => setEditedProjeto(p => p ? { ...p, usuarios_anexados: val } : null)} options={usuarios.map(u => ({ value: u.id, label: u.nome }))} style={{ width: '100%' }} placeholder="Selecione usuários"/>
            ) : (
                (editedProjeto.usuarios_anexados && editedProjeto.usuarios_anexados.length > 0)
                ? editedProjeto.usuarios_anexados.map(id => usuarios.find(u => u.id === id)?.nome || id).join(', ')
                : '-'
            )}
          </Descriptions.Item>
        </Descriptions>

        {editedProjeto.categoria === 'CP' && (
          <>
            <Divider />
            <div>
              <div className="flex justify-between items-center mb-4">
                <Title level={5}>
                  <CreditCardOutlined style={{ marginRight: 8 }} />
                  Créditos Associados ({(editedProjeto.creditos || []).length})
                </Title>
              </div>

              {/* Add Credito Section */}
              {canAddCredito !== false && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4 border">
                  <Title level={5}>Associar Novo Crédito</Title>
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {editedProjeto.cliente_id ? (
                      <>
                        {selectedCliente && (
                          <div style={{ 
                            background: '#e6f7ff', 
                            border: '1px solid #91d5ff', 
                            borderRadius: '4px', 
                            padding: '8px 12px',
                            fontSize: '12px',
                            color: '#0050b3'
                          }}>
                            ℹ️ Mostrando créditos do cliente: {selectedCliente.razao_social}
                          </div>
                        )}
                        
                        <Select
                          placeholder="Selecione um crédito"
                          value={selectedCredito}
                          onChange={setSelectedCredito}
                          loading={loadingCreditos}
                          style={{ width: '100%' }}
                          disabled={loadingCreditos || availableCreditos.length === 0}
                          notFoundContent={loadingCreditos ? 'Carregando...' : 'Nenhum crédito disponível para associação'}
                        >
                          {availableCreditos.map(credito => (
                            <Select.Option key={credito.id} value={credito.id}>
                              {credito.nome} - {new Intl.NumberFormat('pt-BR', { 
                                style: 'currency', 
                                currency: 'BRL' 
                              }).format(credito.saldo_atual)}
                              {editedProjeto.creditos?.some(pc => pc.id === credito.id) && (
                                <span style={{ color: '#1890ff', marginLeft: 8 }}>
                                  (já associado)
                                </span>
                              )}
                            </Select.Option>
                          ))}
                        </Select>
                        
                        {selectedCredito && (
                          <Button 
                            type="primary" 
                            onClick={handleAssociateCredito}
                            loading={associatingCredito}
                            icon={<PlusOutlined />}
                          >
                            Associar Crédito
                          </Button>
                        )}
                      </>
                    ) : (
                      <div style={{ 
                        background: '#fff2e8', 
                        border: '1px solid #ffcc99', 
                        borderRadius: '4px', 
                        padding: '12px',
                        textAlign: 'center',
                        color: '#ad4e00'
                      }}>
                        ⚠️ Este projeto não possui um cliente associado.<br/>
                        Para associar créditos, primeiro defina um cliente para o projeto.
                      </div>
                    )}
                  </Space>
                </div>
              )}
              

              {/* Associated Creditos List */}
              {(editedProjeto.creditos || []).length > 0 ? (
                <List
                  dataSource={editedProjeto.creditos || []}
                  renderItem={(credito) => (
                    <List.Item
                      actions={canAddCredito ? [
                        <Popconfirm
                          key="disassociate"
                          title="Desassociar Crédito"
                          description="Tem certeza que deseja desassociar este crédito do projeto?"
                          onConfirm={() => handleDisassociateCredito(credito.id)}
                          okText="Sim"
                          cancelText="Não"
                        >
                          <Button type="text" danger icon={<DeleteOutlined />}>
                            Desassociar
                          </Button>
                        </Popconfirm>
                      ] : []}
                    >
                      <List.Item.Meta
                        avatar={<CreditCardOutlined style={{ fontSize: 20, color: '#1890ff' }} />}
                        title={credito.nome}
                        description={
                          <div>
                            <div>Saldo: {new Intl.NumberFormat('pt-BR', { 
                              style: 'currency', 
                              currency: 'BRL' 
                            }).format(credito.saldo_atual)}</div>
                            <div>Status: {credito.status}</div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <CreditCardOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                  <p>Nenhum crédito associado</p>
                  <p>Projetos de categoria compensação podem ter créditos associados</p>
                </div>
              )}
            </div>
          </>
        )}

        <Divider />

        {editedProjeto.categoria === 'CP' ? (
          // Movimentacoes section for CP (Compensação) projects
          <div>
            <div className="flex justify-between items-center mb-2">
              <Title level={5}>Movimentações ({movimentacoes.length})</Title>
              <Button 
                type="primary" 
                ghost 
                icon={<PlusOutlined />} 
                onClick={() => setIsAddingMovimentacao(!isAddingMovimentacao)}
              >
                {isAddingMovimentacao ? 'Cancelar' : 'Adicionar Movimentação'}
              </Button>
            </div>

            {isAddingMovimentacao && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-dashed">
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div>
                    <b>Crédito</b>
                    <Select
                      showSearch
                      placeholder="Selecione o crédito a movimentar"
                      value={newMovimentacao.credito_id}
                      onChange={(val) => setNewMovimentacao(s => ({...s, credito_id: val}))}
                      options={(editedProjeto.creditos || []).map(c => ({ 
                        value: c.id, 
                        label: `${c.nome} - Saldo: ${new Intl.NumberFormat('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        }).format(c.saldo_atual)}` 
                      }))}
                      style={{ width: '100%' }}
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                    />
                  </div>
                  <div>
                    <b>Valor</b>
                    <InputNumber
                      placeholder="Valor da movimentação (ex: 1000)"
                      value={newMovimentacao.valor}
                      onChange={(val: string | number | null) => setNewMovimentacao(s => ({...s, valor: typeof val === 'number' ? val : 0}))}
                      style={{ width: '100%' }}
                      formatter={(value: string | number | undefined) => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value: string | undefined) => value!.replace(/R\$\s?|(,*)/g, '')}
                    />
                  </div>
                  <div>
                    <b>Descrição</b>
                    <Input 
                      placeholder="Descreva a movimentação (ex: Pagamento de guia)"
                      value={newMovimentacao.descricao}
                      onChange={(e) => setNewMovimentacao(s => ({...s, descricao: e.target.value}))}
                    />
                  </div>
                  <div>
                    <b>Referência externa</b>
                    <Input 
                      placeholder="Referência externa (opcional)"
                      value={newMovimentacao.referencia_externa}
                      onChange={(e) => setNewMovimentacao(s => ({...s, referencia_externa: e.target.value}))}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">Guia (Opcional)</label>
                      <Button 
                        type="link" 
                        size="small"
                        onClick={() => setIsAddingGuia(!isAddingGuia)}
                      >
                        {isAddingGuia ? 'Cancelar Nova Guia' : 'Criar Nova Guia'}
                      </Button>
                      {newMovimentacao.guia_id && (
                        <Button 
                          type="link" 
                          size="small" 
                          onClick={() => {
                            const guia = guias.find(g => g.id === newMovimentacao.guia_id);
                            if (guia) {
                              setEditedGuia({
                                tipo_guia: guia.tipo_guia,
                                valor_principal: guia.valor_principal,
                                valor_total: guia.valor_total,
                                data_vencimento: guia.data_vencimento,
                                codigo_receita: guia.codigo_receita,
                                periodo_apuracao: guia.periodo_apuracao,
                                observacoes: guia.observacoes
                              });
                              setEditingGuiaId(newMovimentacao.guia_id);
                            }
                          }}
                        >
                          Editar Guia Selecionada
                        </Button>
                      )}
                    </div>
                    {!isAddingGuia ? (
                      <Select
                        placeholder="Selecione uma guia existente (opcional)"
                        value={newMovimentacao.guia_id}
                        onChange={(val) => setNewMovimentacao(s => ({...s, guia_id: val}))}
                        allowClear
                        style={{ width: '100%' }}
                        options={Array.isArray(guias) ? guias.map(g => ({ 
                          value: g.id, 
                          label: `${g.tipo_guia} - ${new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          }).format(g.valor_total)}` 
                        })) : []}
                      />
                    ) : (
                      <div className="bg-blue-50 p-3 rounded border">
                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                          <div className="flex gap-2">
                            <Input 
                              placeholder="Tipo da guia"
                              value={newGuia.tipo_guia}
                              onChange={(e) => setNewGuia(s => ({...s, tipo_guia: e.target.value}))}
                              style={{ flex: 1 }}
                            />
                          </div>
                          <div className="flex gap-2">
                            <InputNumber
                              placeholder="Valor principal"
                              value={newGuia.valor_principal}
                              onChange={(val: string | number | null) => setNewGuia(s => ({...s, valor_principal: typeof val === 'number' ? val : 0}))}
                              style={{ flex: 1 }}
                              formatter={(value: string | number | undefined) => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={(value: string | undefined) => value!.replace(/R\$\s?|(,*)/g, '')}
                            />
                            <InputNumber
                              placeholder="Valor total"
                              value={newGuia.valor_total}
                              onChange={(val: string | number | null) => setNewGuia(s => ({...s, valor_total: typeof val === 'number' ? val : 0}))}
                              style={{ flex: 1 }}
                              formatter={(value: string | number | undefined) => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={(value: string | undefined) => value!.replace(/R\$\s?|(,*)/g, '')}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Input 
                              placeholder="Código da receita"
                              value={newGuia.codigo_receita}
                              onChange={(e) => setNewGuia(s => ({...s, codigo_receita: e.target.value}))}
                              style={{ flex: 1 }}
                            />
                            <Input 
                              type="date"
                              placeholder="Data de vencimento"
                              value={newGuia.data_vencimento}
                              onChange={(e) => setNewGuia(s => ({...s, data_vencimento: e.target.value}))}
                              style={{ flex: 1 }}
                            />
                          </div>
                          <Input 
                            placeholder="Período de apuração"
                            value={newGuia.periodo_apuracao}
                            onChange={(e) => setNewGuia(s => ({...s, periodo_apuracao: e.target.value}))}
                          />
                          <Input.TextArea 
                            placeholder="Observações (opcional)"
                            value={newGuia.observacoes}
                            onChange={(e) => setNewGuia(s => ({...s, observacoes: e.target.value}))}
                            rows={2}
                          />
                          <Button 
                            type="primary" 
                            size="small"
                            onClick={handleAddGuia}
                            icon={<SaveOutlined />}
                          >
                            Criar Guia
                          </Button>
                        </Space>
                      </div>
                    )}
                  </div>
                  {/* Guia Edit Modal */}
                  {editingGuiaId && (
                    <Modal
                      open={!!editingGuiaId}
                      title="Editar Guia"
                      onCancel={() => {
                        setEditingGuiaId(undefined);
                        setEditedGuia({});
                      }}
                      onOk={handleEditGuia}
                      okText="Salvar"
                      cancelText="Cancelar"
                    >
                      <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        <div>
                          <label>Tipo da guia</label>
                          <Input 
                            placeholder="Tipo da guia"
                            value={editedGuia.tipo_guia}
                            onChange={(e) => setEditedGuia(s => ({...s, tipo_guia: e.target.value}))}
                          />
                        </div>
                        <div className="flex gap-2">
                          <div style={{ flex: 1 }}>
                            <label>Valor principal</label>
                            <InputNumber
                              placeholder="Valor principal"
                              value={editedGuia.valor_principal}
                              onChange={(val: string | number | null) => setEditedGuia(s => ({...s, valor_principal: typeof val === 'number' ? val : 0}))}
                              style={{ width: '100%' }}
                              formatter={(value: string | number | undefined) => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={(value: string | undefined) => value!.replace(/R\$\s?|(,*)/g, '')}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label>Valor total</label>
                            <InputNumber
                              placeholder="Valor total"
                              value={editedGuia.valor_total}
                              onChange={(val: string | number | null) => setEditedGuia(s => ({...s, valor_total: typeof val === 'number' ? val : 0}))}
                              style={{ width: '100%' }}
                              formatter={(value: string | number | undefined) => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={(value: string | undefined) => value!.replace(/R\$\s?|(,*)/g, '')}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div style={{ flex: 1 }}>
                            <label>Código da receita</label>
                            <Input 
                              placeholder="Código da receita"
                              value={editedGuia.codigo_receita || ''}
                              onChange={(e) => setEditedGuia(s => ({...s, codigo_receita: e.target.value}))}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label>Data de vencimento</label>
                            <Input 
                              type="date"
                              placeholder="Data de vencimento"
                              value={editedGuia.data_vencimento || ''}
                              onChange={(e) => setEditedGuia(s => ({...s, data_vencimento: e.target.value}))}
                            />
                          </div>
                        </div>
                        <div>
                          <label>Período de apuração</label>
                          <Input 
                            placeholder="Período de apuração"
                            value={editedGuia.periodo_apuracao || ''}
                            onChange={(e) => setEditedGuia(s => ({...s, periodo_apuracao: e.target.value}))}
                          />
                        </div>
                        <div>
                          <label>Observações</label>
                          <Input.TextArea 
                            placeholder="Observações (opcional)"
                            value={editedGuia.observacoes || ''}
                            onChange={(e) => setEditedGuia(s => ({...s, observacoes: e.target.value}))}
                            rows={2}
                          />
                        </div>
                      </Space>
                    </Modal>
                  )}
                  {movimentacaoError && (
                    <div className="text-red-600 text-sm mt-2">{movimentacaoError}</div>
                  )}
                  <Button 
                    type="primary" 
                    loading={loading} 
                    onClick={editingMovimentacaoId ? handleEditMovimentacao : handleAddMovimentacao}
                    icon={<SaveOutlined />}
                  >
                    {editingMovimentacaoId ? 'Atualizar Movimentação' : 'Salvar Movimentação'}
                  </Button>
                  {editingMovimentacaoId && (
                    <Button 
                      onClick={() => {
                        setEditingMovimentacaoId(undefined);
                        setNewMovimentacao({
                          valor: 0,
                          descricao: '',
                          referencia_externa: ''
                        });
                        setIsAddingMovimentacao(false);
                      }}
                    >
                      Cancelar Edição
                    </Button>
                  )}
                </Space>
              </div>
            )}

            <List
              size="large"
              dataSource={movimentacoes}
              locale={{ emptyText: 'Nenhuma movimentação cadastrada para este projeto.' }}
              renderItem={(movimentacao) => {
                console.log('Rendering movimentação:', movimentacao);
                const credito = (editedProjeto.creditos || []).find(c => c.id === movimentacao.credito_id);
                // For now, we'll assume no guias are associated until backend provides this info
                // In the future, we can load the actual associations from the backend
                const hasGuia = false; // TODO: Implement proper guia association lookup from movimentacao data
                return (
                  <List.Item
                    actions={[
                      <Button 
                        type="link" 
                        key="edit"
                        icon={<EditOutlined />}
                        onClick={() => {
                          setEditingMovimentacaoId(movimentacao.id);
                          // Get the associated guia ID if exists
                          const guiaId = Array.isArray(movimentacao.guias) && movimentacao.guias.length > 0 
                            ? (movimentacao.guias[0] as { id?: number })?.id 
                            : undefined;
                          setNewMovimentacao({
                            credito_id: movimentacao.credito_id,
                            valor: movimentacao.valor,
                            descricao: movimentacao.descricao,
                            referencia_externa: movimentacao.referencia_externa || '',
                            guia_id: guiaId
                          });
                          setIsAddingMovimentacao(true);
                        }}
                      >
                        Editar
                      </Button>,
                      <Popconfirm
                        key="delete"
                        title="Excluir Movimentação"
                        description="Tem certeza que deseja excluir esta movimentação?"
                        onConfirm={() => handleDeleteMovimentacao(movimentacao.id)}
                        okText="Sim"
                        cancelText="Não"
                      >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                          Excluir
                        </Button>
                      </Popconfirm>,
                      <Button type="link" key="guias">Guias ({hasGuia ? '1' : '0'})</Button>
                    ]}
                    className="hover:bg-gray-50 rounded-md"
                  >
                    <List.Item.Meta
                      avatar={<DollarOutlined style={{ fontSize: 20, color: '#52c41a' }} />}
                      title={
                        <div className="flex items-center gap-2">
                          <Text strong>{movimentacao.descricao}</Text>
                          <Tag color="blue">COMPENSAÇÃO</Tag>
                          {hasGuia && <Tag color="green">Com Guia</Tag>}
                        </div>
                      }
                      description={
                        <div>
                          <div>Crédito: {credito?.nome || 'N/A'}</div>
                          <div>Referência: {movimentacao.referencia_externa}</div>
                        </div>
                      }
                    />
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">
                        {new Intl.NumberFormat('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        }).format(movimentacao.valor)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(movimentacao.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </List.Item>
                );
              }}
            />
          </div>
        ) : (
          // Regular etapas section for non-CP projects
          <div>
            <div className="flex justify-between items-center mb-2">
                <Title level={5}>Etapas ({Array.isArray(editedProjeto.etapas) ? editedProjeto.etapas.length : 0})</Title>
                {canAddEtapa && (
                    <Button type="primary" ghost icon={<PlusOutlined />} onClick={() => setIsAddingEtapa(v => !v)}>
                        {isAddingEtapa ? 'Cancelar' : 'Adicionar Etapa'}
                    </Button>
                )}
            </div>

            {isAddingEtapa && canAddEtapa && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-dashed">
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <Input value={newEtapa.nome} onChange={e => setNewEtapa(s => ({...s, nome: e.target.value}))} placeholder="Nome da nova etapa" />
                    <Input.TextArea value={newEtapa.descricao || ''} onChange={e => setNewEtapa(s => ({...s, descricao: e.target.value}))} placeholder="Descrição da etapa" rows={2}/>
                    <Select
                      showSearch
                      placeholder="Selecione o responsável pela etapa"
                      value={newEtapa.usuario_id}
                      onChange={val => setNewEtapa(e => ({...e, usuario_id: val}))}
                      options={usuarios.map(u => ({ value: u.id, label: u.nome }))}
                      style={{ width: '100%' }}
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                    />
                    <Space wrap>
                        <Select value={newEtapa.status} onChange={val => setNewEtapa(s => ({...s, status: val as StatusEtapaEnum}))} options={statusOptions.map(s => ({value: s.value, label: s.label}))} style={{ width: 150 }} placeholder="Status" />
                        <Input addonBefore="Início" value={newEtapa.data_inicio || ''} onChange={e => setNewEtapa(s => ({...s, data_inicio: e.target.value}))} type="date" style={{ width: 200 }} />
                        <Input addonBefore="Prazo" value={newEtapa.data_prazo || ''} onChange={e => setNewEtapa(s => ({...s, data_prazo: e.target.value}))} type="date" style={{ width: 200 }} />
                        <Input addonBefore="Fim" value={newEtapa.data_fim || ''} onChange={e => setNewEtapa(s => ({...s, data_fim: e.target.value}))} type="date" style={{ width: 200 }} />
                    </Space>
                    <Button type="primary" loading={loading} onClick={handleAddEtapa} icon={<SaveOutlined />}>Salvar Etapa</Button>
                </Space>
              </div>
            )}

            <List
              size="large"
              dataSource={Array.isArray(editedProjeto.etapas) ? editedProjeto.etapas : []}
              locale={{ emptyText: 'Nenhuma etapa cadastrada para este projeto.' }}
              renderItem={etapa => {
                  const isEditingThisEtapa = editingEtapaId === etapa.id && editedEtapa;
                  if (isEditingThisEtapa) {
                      return (
                          <List.Item className="bg-blue-50 p-4 rounded-md">
                             <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                  <Input value={editedEtapa.nome} onChange={e => setEditedEtapa(et => et ? {...et, nome: e.target.value} : null)} placeholder="Nome da etapa" />
                                  <Input.TextArea value={editedEtapa.descricao || ''} onChange={e => setEditedEtapa(et => et ? {...et, descricao: e.target.value} : null)} placeholder="Descrição" rows={2}/>
                                  <Select
                                    showSearch
                                    placeholder="Selecione o responsável pela etapa"
                                    value={editedEtapa.usuario_id}
                                    onChange={val => setEditedEtapa(et => et ? {...et, usuario_id: val} : null)}
                                    options={usuarios.map(u => ({ value: u.id, label: u.nome }))}
                                    style={{ width: '100%' }}
                                    filterOption={(input, option) =>
                                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                  />
                                  <Space wrap>
                                      <Select value={editedEtapa.status} onChange={val => setEditedEtapa(et => et ? {...et, status: val as StatusEtapaEnum} : null)} options={statusOptions.map(s=> ({value: s.value, label: s.label}))} style={{ width: 150 }}/>
                                      <Input addonBefore="Início" value={formatDateForInput(editedEtapa.data_inicio)} onChange={e => setEditedEtapa(et => et ? {...et, data_inicio: e.target.value} : null)} type="date" style={{ width: 200 }} />
                                      <Input addonBefore="Prazo" value={formatDateForInput(editedEtapa.data_prazo)} onChange={e => setEditedEtapa(et => et ? {...et, data_prazo: e.target.value} : null)} type="date" style={{ width: 200 }} />
                                      <Input addonBefore="Fim" value={formatDateForInput(editedEtapa.data_fim)} onChange={e => setEditedEtapa(et => et ? {...et, data_fim: e.target.value} : null)} type="date" style={{ width: 200 }} />
                                  </Space>
                                  <Space>
                                      <Button type="primary" onClick={handleUpdateEtapa} icon={<SaveOutlined />}>Salvar</Button>
                                      <Button onClick={handleCancelEditEtapa}>Cancelar</Button>
                                       <Popconfirm title="Tem certeza que deseja deletar?" onConfirm={() => onDeleteEtapa(etapa.id)} okText="Sim" cancelText="Não">
                                           <Button danger icon={<DeleteOutlined />}>Deletar</Button>
                                       </Popconfirm>
                                  </Space>
                             </Space>
                          </List.Item>
                      );
                  }

                  const responsavel = usuarios.find(u => u.id === etapa.usuario_id);

                  return (
                      <List.Item
                          actions={canEditEtapa ? [
                              <Button type="link" onClick={(e) => { e.stopPropagation(); handleStartEditEtapa(etapa); }}>Editar</Button>
                          ] : []}
                          className="hover:bg-gray-50 rounded-md cursor-pointer"
                          onClick={() => onSelectEtapa(etapa)}
                      >
                          <List.Item.Meta
                              title={<Text strong>{etapa.nome}</Text>}
                              description={etapa.descricao || '-'}
                          />
                          <div className="flex items-center gap-4">
                              {responsavel && (
                                <Tag icon={<UserOutlined />}>
                                  {responsavel.nome}
                                </Tag>
                              )}
                              {getStatusTag(etapa.status)}
                          </div>
                      </List.Item>
                  );
              }}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ProjetoDetailModal;