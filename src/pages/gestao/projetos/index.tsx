
import EtapaDetailModal from '../../../components/projetos/EtapaDetailModal';
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import { createProjeto } from '../../../services/projetos';
import { getUsuarios } from '../../../services/usuarios';
import { getClientes } from '../../../services/clientes';
import { Modal, Input, message, Select } from 'antd';
import { PlusOutlined, FolderOpenOutlined, UnorderedListOutlined } from '@ant-design/icons';

import type { Usuario } from '../../../types/usuario'
import type { Projeto } from '../../../types/projeto'
import type { Etapa } from '../../../types/etapa'
import type { Cliente } from '../../../types/cliente'
import { getEtapas } from '../../../services/etapas';
import { StatusEtapaEnum } from '../../../types/etapa';
import EtapasList from '../../../components/etapas/EtapasList';
import ProjetoDetailModal from '../../../components/projetos/ProjetoDetailModal';
import ProjetosList from '../../../components/projetos/ProjetosList';
import ClienteSelector from '../../../components/cliente/ClienteSelector';


const ProjetosPage: React.FC = () => {
  // Delete handlers
  const handleDeleteProjeto = async (projetoId: number) => {
    try {
      setLoading(true);
      await import('../../../services/projetos').then(m => m.deleteProjeto(projetoId));
      message.success('Projeto deletado com sucesso!');
      fetchData();
    } catch {
      message.error('Erro ao deletar projeto');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEtapa = async (etapaId: number) => {
    try {
      setLoading(true);
      await import('../../../services/etapas').then(m => m.deleteEtapa(etapaId));
      message.success('Etapa deletada com sucesso!');
      fetchData();
    } catch {
      message.error('Erro ao deletar etapa');
    } finally {
      setLoading(false);
    }
  };
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  // Fetch projetos from API
  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get('/projetos/', { params: { offset, limit } }),
      getUsuarios(),
      getEtapas(),
      getClientes()
    ])
      .then(([projetosRes, usuarios, etapas, clientes]) => {
        setProjetos(projetosRes.data.projetos || []);
        setTotal(projetosRes.data.total || projetosRes.data.projetos?.length || 0);
        setUsuarios(usuarios || []);
        setEtapas(etapas || []);
        setClientes(clientes || []);
      })
      .catch(() => {
        message.error('Erro ao carregar projetos, etapas ou usuários');
      })
      .finally(() => setLoading(false));
  }, [offset, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const [showProjetoModal, setShowProjetoModal] = useState(false);
  const [novoProjetoNome, setNovoProjetoNome] = useState('');
  const [novoProjetoPrioridade, setNovoProjetoPrioridade] = useState<'UT' | 'AL' | 'MD' | 'BA'>('MD');
  const [novoProjetoStatus, setNovoProjetoStatus] = useState<'NI' | 'EA' | 'C' | 'P'>('NI');
  const [novoProjetoCategoria, setNovoProjetoCategoria] = useState<'DV' | 'MK' | 'OT' | 'CP'>('OT');
  const [novoProjetoResponsavel, setNovoProjetoResponsavel] = useState<number | undefined>(usuarios[0]?.id);
  const [novoProjetoClienteId, setNovoProjetoClienteId] = useState<number | undefined>(undefined);
  const [novoProjetoUsuariosAnexados, setNovoProjetoUsuariosAnexados] = useState<number[]>([]);
  const [novoProjetoDescricao, setNovoProjetoDescricao] = useState('');
  const [novoProjetoDataInicio, setNovoProjetoDataInicio] = useState<string | null>(null);
  const [novoProjetoDataPrazo, setNovoProjetoDataPrazo] = useState<string | null>(null);
  const [novoProjetoDataFim, setNovoProjetoDataFim] = useState<string | null>(null);
  const [novoEtapaNome, setNovoEtapaNome] = useState('');
  const [viewMode, setViewMode] = useState<'projetos' | 'etapas'>('projetos');
  const [detailModalProjeto, setDetailModalProjeto] = useState<Projeto | null>(null);
  const [detailModalEtapa, setDetailModalEtapa] = useState<EtapaWithProjeto | null>(null);
  // Projeto Filters
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [filterCategoria, setFilterCategoria] = useState<string | undefined>();
  const [filterNome, setFilterNome] = useState<string>('');
  const [filterResponsavel, setFilterResponsavel] = useState<number | undefined>();
  const [filterClienteId, setFilterClienteId] = useState<number | undefined>();
  // Etapa Filters
  const [filterEtapaStatus, setFilterEtapaStatus] = useState<string | undefined>();
  const [filterEtapaNome, setFilterEtapaNome] = useState<string>('');
  const [filterEtapaProjetoId, setFilterEtapaProjetoId] = useState<number | undefined>();

  const handleClienteSelect = (cliente: Cliente | null) => {
    setNovoProjetoClienteId(cliente?.id || undefined);
  };

  const handleAddProjeto = async () => {
    if (novoProjetoNome.trim()) {
      setLoading(true);
      try {
        await createProjeto({
          nome: novoProjetoNome,
          prioridade: novoProjetoPrioridade,
          status: novoProjetoStatus,
          categoria: novoProjetoCategoria,
          responsavel_id: novoProjetoResponsavel || 1,
          cliente_id: novoProjetoClienteId,
          usuarios_anexados: novoProjetoUsuariosAnexados,
          descricao: novoProjetoDescricao,
          data_inicio: novoProjetoDataInicio,
          data_prazo: novoProjetoDataPrazo,
          data_fim: novoProjetoDataFim,
          anexados: [],
          etapas: [],
        });
        setNovoProjetoNome('');
        setNovoProjetoPrioridade('MD');
        setNovoProjetoStatus('NI');
        setNovoProjetoCategoria('OT');
        setNovoProjetoResponsavel(usuarios[0]?.id);
        setNovoProjetoClienteId(undefined);
        setNovoProjetoUsuariosAnexados([]);
        setNovoProjetoDescricao('');
        setNovoProjetoDataInicio(null);
        setNovoProjetoDataPrazo(null);
        setNovoProjetoDataFim(null);
        setShowProjetoModal(false);
        message.success('Projeto criado com sucesso!');
        fetchData();
      } catch {
        message.error('Erro ao criar projeto.');
      } finally {
        setLoading(false);
      }
    } else {
      message.warning('Digite o nome do projeto.');
    }
  };

  const [addEtapaProjetoId, setAddEtapaProjetoId] = useState<number | null>(null);
  const [novoEtapaStatus, setNovoEtapaStatus] = useState<StatusEtapaEnum>(StatusEtapaEnum.EA);
  const [novoEtapaDescricao, setNovoEtapaDescricao] = useState('');
  const [novoEtapaDataInicio, setNovoEtapaDataInicio] = useState<string>('');
  const [novoEtapaDataPrazo, setNovoEtapaDataPrazo] = useState<string>('');
  const [novoEtapaDataFim, setNovoEtapaDataFim] = useState<string>('');
  const handleAddEtapa = () => {
    if (novoEtapaNome.trim() && addEtapaProjetoId) {
      setProjetos(prev => prev.map(p =>
        p.id === addEtapaProjetoId
          ? {
              ...p,
              etapas: [
                ...(Array.isArray(p.etapas) ? p.etapas : []),
                {
                  id: Date.now(),
                  nome: novoEtapaNome,
                  status: novoEtapaStatus,
                  projeto_id: addEtapaProjetoId,
                  usuario_id: 1,
                  descricao: novoEtapaDescricao,
                  data_inicio: novoEtapaDataInicio || null,
                  data_prazo: novoEtapaDataPrazo || null,
                  data_fim: novoEtapaDataFim || null,
                  created_at: new Date().toISOString(),
                }
              ]
            }
          : p
      ));
      setNovoEtapaNome('');
      setNovoEtapaDescricao('');
      setNovoEtapaDataInicio('');
      setNovoEtapaDataPrazo('');
      setNovoEtapaDataFim('');
      setAddEtapaProjetoId(null);
      message.success('Etapa adicionada!');
    } else {
      message.warning('Digite o nome da etapa.');
    }
  };

  // Filtered data
  const filteredProjetos = projetos.filter(p =>
    (!filterStatus || p.status === filterStatus) &&
    (!filterCategoria || p.categoria === filterCategoria) &&
    (!filterNome || p.nome.toLowerCase().includes(filterNome.toLowerCase())) &&
    (!filterResponsavel || p.responsavel_id === filterResponsavel) &&
    (!filterClienteId || p.cliente_id === filterClienteId)
  );
  // Etapa filtering: join etapas with projeto info
  const allEtapas = etapas.map(etapa => {
    const projeto = projetos.find(p => p.id === etapa.projeto_id);
    return {
      ...etapa,
      projetoNome: projeto ? projeto.nome : 'Projeto não encontrado',
      projetoId: etapa.projeto_id,
    };
  });
  const filteredEtapas = allEtapas.filter(e =>
    (!filterEtapaStatus || e.status === filterEtapaStatus) &&
    (!filterEtapaNome || e.nome.toLowerCase().includes(filterEtapaNome.toLowerCase())) &&
    (!filterEtapaProjetoId || e.projetoId === filterEtapaProjetoId)
  );

  return (
    <div className="w-full h-full flex flex-col">
      {/* Page Content */}
      <div className="flex-1 flex flex-col pl-20 p-4 space-y-4">
        {/* Page Title and Controls */}
        <div className="bg-transparent rounded-lg flex items-center justify-between flex-shrink-0">
          <h1 className="text-2xl font-bold text-white">PROJETOS</h1>
          <div className="flex items-center space-x-6">
            <button
              className="px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors duration-200 font-semibold flex items-center space-x-2"
              onClick={() => setShowProjetoModal(true)}
            >
              <PlusOutlined />
              <span>Novo Projeto</span>
            </button>
            <button
              onClick={() => setViewMode('projetos')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'projetos' 
                  ? 'bg-[#775343] text-white' 
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              <FolderOpenOutlined className="mr-2" />
              Projetos
            </button>
            <button
              onClick={() => setViewMode('etapas')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'etapas' 
                  ? 'bg-[#775343] text-white' 
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              <UnorderedListOutlined className="mr-2" />
              Etapas
            </button>
            </div>
        </div>

      {/* Modal for creating Projeto */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <FolderOpenOutlined style={{ color: '#1890ff' }} />
            <span className="text-lg font-semibold">Criar Novo Projeto</span>
          </div>
        }
        open={showProjetoModal}
        onCancel={() => {
          setShowProjetoModal(false);
          // Reset form on cancel
          setNovoProjetoNome('');
          setNovoProjetoPrioridade('MD');
          setNovoProjetoStatus('NI');
          setNovoProjetoCategoria('OT');
          setNovoProjetoResponsavel(usuarios[0]?.id);
          setNovoProjetoClienteId(undefined);
          setNovoProjetoUsuariosAnexados([]);
          setNovoProjetoDescricao('');
          setNovoProjetoDataInicio(null);
          setNovoProjetoDataPrazo(null);
          setNovoProjetoDataFim(null);
        }}
        onOk={handleAddProjeto}
        okText="Criar Projeto"
        cancelText="Cancelar"
        width={800}
        style={{ top: 20 }}
        okButtonProps={{ 
          size: 'large',
          disabled: !novoProjetoNome.trim() || !novoProjetoResponsavel
        }}
        cancelButtonProps={{ size: 'large' }}
      >
        <div className="space-y-6 py-4">
          {/* Basic Information Section */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-gray-800 border-b pb-2">
              Informações Básicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Projeto <span className="text-red-500">*</span>
                </label>
                <Input
                  value={novoProjetoNome}
                  onChange={e => setNovoProjetoNome(e.target.value)}
                  placeholder="Digite o nome do projeto..."
                  size="large"
                  onPressEnter={handleAddProjeto}
                  status={!novoProjetoNome.trim() ? 'error' : ''}
                />
                {!novoProjetoNome.trim() && (
                  <span className="text-xs text-red-500 mt-1">O nome do projeto é obrigatório</span>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <Select
                  value={novoProjetoCategoria}
                  onChange={setNovoProjetoCategoria}
                  size="large"
                  style={{ width: '100%' }}
                  options={[
                    { value: 'DV', label: '💻 Desenvolvimento' },
                    { value: 'MK', label: '📈 Marketing' },
                    { value: 'CP', label: '💰 Compensação' },
                    { value: 'OT', label: '📋 Outros' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridade
                </label>
                <Select
                  value={novoProjetoPrioridade}
                  onChange={setNovoProjetoPrioridade}
                  size="large"
                  style={{ width: '100%' }}
                  options={[
                    { value: 'UT', label: '🔴 Urgente' },
                    { value: 'AL', label: '🟠 Alta' },
                    { value: 'MD', label: '🟡 Média' },
                    { value: 'BA', label: '🟢 Baixa' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Inicial
                </label>
                <Select
                  value={novoProjetoStatus}
                  onChange={setNovoProjetoStatus}
                  size="large"
                  style={{ width: '100%' }}
                  options={[
                    { value: 'NI', label: '⏸️ Não Iniciado' },
                    { value: 'EA', label: '▶️ Em Andamento' },
                    { value: 'C', label: '✅ Concluído' },
                    { value: 'P', label: '⏸️ Pausado' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsável <span className="text-red-500">*</span>
                </label>
                <Select
                  value={novoProjetoResponsavel}
                  onChange={setNovoProjetoResponsavel}
                  size="large"
                  style={{ width: '100%' }}
                  placeholder="Selecione o responsável"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={usuarios.map(u => ({ 
                    value: u.id, 
                    label: `👤 ${u.nome}` 
                  }))}
                  status={!novoProjetoResponsavel ? 'error' : ''}
                />
                {!novoProjetoResponsavel && (
                  <span className="text-xs text-red-500 mt-1">Selecione um responsável</span>
                )}
              </div>
            </div>
          </div>

          {/* Client and Team Section */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-gray-800 border-b pb-2">
              Cliente e Equipe
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cliente (opcional)
                </label>
                <ClienteSelector
                  onClientSelect={handleClienteSelect}
                  selectedClient={novoProjetoClienteId ? { id: novoProjetoClienteId } as Cliente : null}
                  placeholder="Selecione um cliente..."
                />
                <span className="text-xs text-gray-500 mt-1">
                  Necessário para projetos de compensação
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuários da Equipe
                </label>
                <Select
                  mode="multiple"
                  value={novoProjetoUsuariosAnexados}
                  onChange={setNovoProjetoUsuariosAnexados}
                  size="large"
                  style={{ width: '100%' }}
                  placeholder="Adicione membros da equipe..."
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={usuarios.map(u => ({ 
                    value: u.id, 
                    label: u.nome 
                  }))}
                  maxTagCount={3}
                  maxTagTextLength={15}
                />
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-gray-800 border-b pb-2">
              Cronograma
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📅 Data de Início
                </label>
                <Input
                  type="date"
                  value={novoProjetoDataInicio || ''}
                  onChange={e => setNovoProjetoDataInicio(e.target.value || null)}
                  size="large"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ⏰ Prazo Final
                </label>
                <Input
                  type="date"
                  value={novoProjetoDataPrazo || ''}
                  onChange={e => setNovoProjetoDataPrazo(e.target.value || null)}
                  size="large"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🏁 Data de Conclusão
                </label>
                <Input
                  type="date"
                  value={novoProjetoDataFim || ''}
                  onChange={e => setNovoProjetoDataFim(e.target.value || null)}
                  size="large"
                />
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-gray-800 border-b pb-2">
              Descrição
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição do Projeto
              </label>
              <Input.TextArea
                value={novoProjetoDescricao}
                onChange={e => setNovoProjetoDescricao(e.target.value)}
                placeholder="Descreva os objetivos, escopo e detalhes importantes do projeto..."
                rows={4}
                showCount
                maxLength={500}
              />
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="text-blue-500 text-xl">💡</div>
              <div>
                <h4 className="text-sm font-semibold text-blue-800 mb-2">Dicas Rápidas:</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Projetos de <strong>Compensação</strong> requerem um cliente associado</li>
                  <li>• Use nomes descritivos para facilitar a identificação</li>
                  <li>• A equipe pode ser modificada posteriormente no detalhamento do projeto</li>
                  <li>• Defina prazos realistas considerando a complexidade do projeto</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Modal>

        {/* Filters */}
        {viewMode === 'projetos' ? (
          <div className="bg-transparent rounded-lg flex flex-wrap items-center space-x-4">
            <input
              type="text"
              placeholder="Filtrar por nome"
              value={filterNome}
              onChange={e => setFilterNome(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              value={filterStatus || ''}
              onChange={e => setFilterStatus(e.target.value || undefined)}
              className="px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Status</option>
              <option value="NI">Não Iniciado</option>
              <option value="EA">Em Andamento</option>
              <option value="C">Concluído</option>
              <option value="P">Pausado</option>
            </select>
            <select
              value={filterCategoria || ''}
              onChange={e => setFilterCategoria(e.target.value || undefined)}
              className="px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Categoria</option>
              <option value="OT">Outros</option>
              <option value="CP">Compensação</option>
            </select>
            <select
              value={filterResponsavel || ''}
              onChange={e => setFilterResponsavel(e.target.value ? Number(e.target.value) : undefined)}
              className="px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Responsável</option>
              {usuarios.map(u => (
                <option key={u.id} value={u.id}>{u.nome}</option>
              ))}
            </select>
            <select
              value={filterClienteId || ''}
              onChange={e => setFilterClienteId(e.target.value ? Number(e.target.value) : undefined)}
              className="px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Cliente</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.razao_social}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="bg-transparent rounded-lg flex flex-wrap items-center space-x-4">
            <input
              type="text"
              placeholder="Filtrar por nome da etapa"
              value={filterEtapaNome}
              onChange={e => setFilterEtapaNome(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              value={filterEtapaStatus || ''}
              onChange={e => setFilterEtapaStatus(e.target.value || undefined)}
              className="px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Status da Etapa</option>
              <option value="NI">Não Iniciada</option>
              <option value="EA">Em Andamento</option>
              <option value="C">Concluída</option>
              <option value="P">Pausada</option>
            </select>
            <select
              value={filterEtapaProjetoId || ''}
              onChange={e => setFilterEtapaProjetoId(e.target.value ? Number(e.target.value) : undefined)}
              className="px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Projeto relacionado</option>
              {projetos.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>
        )}

        <main className="flex-grow flex overflow-hidden w-full">{viewMode === 'projetos' ? (
          <div className="w-full">
            <ProjetosList
            projetos={filteredProjetos.map(p => ({
              ...p,
              etapas: etapas.filter(e => e.projeto_id === p.id)
            }))}
            usuarios={usuarios}
            loading={loading}
            offset={offset}
            limit={limit}
            total={total}
            onPageChange={(page, pageSize) => {
              setOffset((page - 1) * pageSize);
              setLimit(pageSize);
            }}
            onShowProjetoModal={() => setShowProjetoModal(true)}
            onAddEtapa={setAddEtapaProjetoId}
            addEtapaProjetoId={addEtapaProjetoId}
            novoEtapaNome={novoEtapaNome}
            setNovoEtapaNome={setNovoEtapaNome}
            handleAddEtapa={handleAddEtapa}
            setNovoEtapaStatus={setNovoEtapaStatus}
            novoEtapaStatus={novoEtapaStatus}
            novoEtapaDescricao={novoEtapaDescricao}
            setNovoEtapaDescricao={setNovoEtapaDescricao}
            novoEtapaDataInicio={novoEtapaDataInicio}
            setNovoEtapaDataInicio={setNovoEtapaDataInicio}
            novoEtapaDataPrazo={novoEtapaDataPrazo}
            setNovoEtapaDataPrazo={setNovoEtapaDataPrazo}
            novoEtapaDataFim={novoEtapaDataFim}
            setNovoEtapaDataFim={setNovoEtapaDataFim}
            setAddEtapaProjetoId={setAddEtapaProjetoId}
            setDetailModalProjeto={setDetailModalProjeto}
            onDeleteProjeto={handleDeleteProjeto}
          />
          </div>
        ) : (
          <div className="w-full">
            <EtapasList
              etapas={filteredEtapas}
              loading={loading}
              onSelectEtapa={setDetailModalEtapa}
              onDeleteEtapa={handleDeleteEtapa}
            />
          </div>
        )}
        </main>

      <ProjetoDetailModal
        onDeleteEtapa={handleDeleteEtapa}
        projeto={detailModalProjeto ? {
          ...detailModalProjeto,
          etapas: etapas.filter(e => detailModalProjeto && e.projeto_id === detailModalProjeto.id)
        } : null}
        usuarios={usuarios}
        open={!!detailModalProjeto}
        onClose={() => setDetailModalProjeto(null)}
        loading={loading}
        canAddCredito={true}
        onAddEtapa={async (newEtapa: Partial<Etapa>) => {
          if (!newEtapa.nome || !newEtapa.projeto_id) {
            message.error('O nome e o projeto são obrigatórios!');
            return;
          }
          try {
            setLoading(true);
            await import('../../../services/etapas').then(m => 
              m.createEtapa(newEtapa as Omit<Etapa, "id" | "created_at">)
            );
            message.success('Etapa adicionada com sucesso!');
            fetchData();
          } catch {
            message.error('Erro ao adicionar etapa');
          } finally {
            setLoading(false);
          }
        }}
        onSelectEtapa={etapa => {
          const projeto = projetos.find(p => p.id === etapa.projeto_id);
          setDetailModalEtapa({ ...etapa, projetoNome: projeto ? projeto.nome : '', projetoId: etapa.projeto_id });
        }}
        onUpdateProjeto={async update => {
          if (!update.id) return;
          try {
            setLoading(true);
            await import('../../../services/projetos').then(m => m.updateProjeto(update.id as number, update));
            message.success('Projeto atualizado com sucesso!');
            fetchData();
          } catch {
            message.error('Erro ao atualizar projeto');
          } finally {
            setLoading(false);
          }
        }}
        onUpdateEtapa={async update => {
          if (!update.id) return;
          try {
            setLoading(true);
            await import('../../../services/etapas').then(m => m.updateEtapa(update.id as number, update));
            message.success('Etapa atualizada com sucesso!');
            fetchData();
          } catch {
            message.error('Erro ao atualizar etapa');
          } finally {
            setLoading(false);
          }
        }}
      />

      {/* Etapa Detail Modal (lazy load details) */}
      <EtapaDetailModal
        etapa={detailModalEtapa}
        open={!!detailModalEtapa}
        onClose={() => setDetailModalEtapa(null)}
        width={600}
      />
      </div>
    </div>
  );
};

export default ProjetosPage;

type EtapaWithProjeto = Etapa & { projetoNome: string; projetoId: number };