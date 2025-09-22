
import EtapaDetailModal from '../../../components/projetos/EtapaDetailModal';
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import { createProjeto } from '../../../services/projetos';
import { getUsuarios } from '../../../services/usuarios';
import { Button, Modal, Input, Typography, Space, message, Select } from 'antd';
import { PlusOutlined, FolderOpenOutlined, FilterOutlined, UnorderedListOutlined } from '@ant-design/icons';

import type { Usuario } from '../../../types/usuario'
import type { Projeto } from '../../../types/projeto'
import type { Etapa } from '../../../types/etapa'
import { getEtapas } from '../../../services/etapas';
import { StatusEtapaEnum } from '../../../types/etapa';
import EtapasList from '../../../components/etapas/EtapasList';
import ProjetoDetailModal from '../../../components/projetos/ProjetoDetailModal';
import ProjetosList from '../../../components/projetos/ProjetosList';

const { Title } = Typography;


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
      getEtapas()
    ])
      .then(([projetosRes, usuarios, etapas]) => {
        setProjetos(projetosRes.data.projetos || []);
        setTotal(projetosRes.data.total || projetosRes.data.projetos?.length || 0);
        setUsuarios(usuarios || []);
        setEtapas(etapas || []);
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
  const [novoProjetoCategoria, setNovoProjetoCategoria] = useState<'DV' | 'MK' | 'OT'>('OT');
  const [novoProjetoResponsavel, setNovoProjetoResponsavel] = useState<number | undefined>(usuarios[0]?.id);
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
  // Etapa Filters
  const [filterEtapaStatus, setFilterEtapaStatus] = useState<string | undefined>();
  const [filterEtapaNome, setFilterEtapaNome] = useState<string>('');
  const [filterEtapaProjetoId, setFilterEtapaProjetoId] = useState<number | undefined>();

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
  // Get unique responsáveis for filter dropdown
  const responsaveisOptions = usuarios.map(u => ({ value: u.id, label: `${u.nome} (${u.email})` }));

  const filteredProjetos = projetos.filter(p =>
    (!filterStatus || p.status === filterStatus) &&
    (!filterCategoria || p.categoria === filterCategoria) &&
    (!filterNome || p.nome.toLowerCase().includes(filterNome.toLowerCase())) &&
    (!filterResponsavel || p.responsavel_id === filterResponsavel)
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
    <div className="h-screen w-screen pl-6 flex flex-col">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-gray-100 pl-20 p-6 flex flex-col md:flex-row md:items-center md:justify-between shadow-sm">
        <Title level={2} className="mb-2 md:mb-0">Projetos</Title>
        <Space wrap>
          <Button
            type="primary"
            shape="round"
            icon={<PlusOutlined />}
            onClick={() => setShowProjetoModal(true)}
          >
            Novo Projeto
          </Button>
          <Button
            type="default"
            shape="round"
            icon={<FolderOpenOutlined/>}
            onClick={() => setViewMode('projetos')}
            className={viewMode === 'projetos' ? 'border-blue-500 text-blue-600 font-bold shadow' : 'border-gray-300 text-gray-700'}
            style={viewMode === 'projetos' ? { background: '#e6f0ff', borderColor: '#1677ff' } : {}}
          >
            Projetos
          </Button>
          <Button
            type="default"
            shape="round"
            icon={<UnorderedListOutlined />}
            onClick={() => setViewMode('etapas')}
            className={viewMode === 'etapas' ? 'border-blue-500 text-blue-600 font-bold shadow' : 'border-gray-300 text-gray-700'}
            style={viewMode === 'etapas' ? { background: '#e6f0ff', borderColor: '#1677ff' } : {}}
          >
            Etapas
          </Button>
        </Space>
      </div>

      {/* Modal for creating Projeto */}
      <Modal
        title="Novo Projeto"
        open={showProjetoModal}
        onCancel={() => setShowProjetoModal(false)}
        onOk={handleAddProjeto}
        okText="Criar"
        cancelText="Cancelar"
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Input
            value={novoProjetoNome}
            onChange={e => setNovoProjetoNome(e.target.value)}
            placeholder="Nome do projeto"
            onPressEnter={handleAddProjeto}
          />
          <Select
            value={novoProjetoPrioridade}
            onChange={setNovoProjetoPrioridade}
            options={[
              { value: 'UT', label: 'Urgente' },
              { value: 'AL', label: 'Alta' },
              { value: 'MD', label: 'Média' },
              { value: 'BA', label: 'Baixa' },
            ]}
            style={{ width: '100%' }}
            placeholder="Prioridade"
          />
          <Select
            value={novoProjetoStatus}
            onChange={setNovoProjetoStatus}
            options={[
              { value: 'NI', label: 'Não Iniciado' },
              { value: 'EA', label: 'Em Andamento' },
              { value: 'C', label: 'Concluído' },
              { value: 'P', label: 'Pausado' },
            ]}
            style={{ width: '100%' }}
            placeholder="Status"
          />
          <Select
            value={novoProjetoCategoria}
            onChange={setNovoProjetoCategoria}
            options={[
              { value: 'DV', label: 'Desenvolvimento' },
              { value: 'MK', label: 'Marketing' },
              { value: 'OT', label: 'Outros' },
            ]}
            style={{ width: '100%' }}
            placeholder="Categoria"
          />
          <Select
            value={novoProjetoResponsavel}
            onChange={setNovoProjetoResponsavel}
            options={usuarios.map(u => ({ value: u.id, label: u.nome }))}
            style={{ width: '100%' }}
            placeholder="Responsável"
            allowClear
          />
          <Select
            mode="multiple"
            value={novoProjetoUsuariosAnexados}
            onChange={setNovoProjetoUsuariosAnexados}
            options={usuarios.map(u => ({ value: u.id, label: u.nome }))}
            style={{ width: '100%' }}
            placeholder="Usuários Anexados"
            allowClear
          />
          <Input.TextArea
            value={novoProjetoDescricao}
            onChange={e => setNovoProjetoDescricao(e.target.value)}
            placeholder="Descrição"
            rows={2}
          />
          <Space>
            <Input
              value={novoProjetoDataInicio || ''}
              onChange={e => setNovoProjetoDataInicio(e.target.value || null)}
              type="date"
              style={{ width: 150 }}
              placeholder="Data início"
            />
            <Input
              value={novoProjetoDataPrazo || ''}
              onChange={e => setNovoProjetoDataPrazo(e.target.value || null)}
              type="date"
              style={{ width: 150 }}
              placeholder="Prazo"
            />
            <Input
              value={novoProjetoDataFim || ''}
              onChange={e => setNovoProjetoDataFim(e.target.value || null)}
              type="date"
              style={{ width: 150 }}
              placeholder="Data fim"
            />
          </Space>
        </Space>
      </Modal>

      {/* Filters */}
      {viewMode === 'projetos' ? (
        <div className="flex flex-wrap gap-4 px-6 pt-4 pb-2 bg-gray-50 border-b border-gray-200 items-center">
          <Input
            prefix={<FilterOutlined />}
            placeholder="Filtrar por nome"
            value={filterNome}
            onChange={e => setFilterNome(e.target.value)}
            className="w-48"
          />
          <Select
            allowClear
            placeholder="Status"
            value={filterStatus}
            onChange={setFilterStatus}
            className="w-32"
            options={[
              { value: 'NI', label: 'Não Iniciado' },
              { value: 'EA', label: 'Em Andamento' },
              { value: 'C', label: 'Concluído' },
              { value: 'P', label: 'Pausado' },
            ]}
          />
          <Select
            allowClear
            placeholder="Categoria"
            value={filterCategoria}
            onChange={setFilterCategoria}
            className="w-32"
            options={[
              { value: 'DV', label: 'Desenvolvimento' },
              { value: 'MK', label: 'Marketing' },
              { value: 'OT', label: 'Outros' },
            ]}
          />
          <Select
            allowClear
            placeholder="Responsável"
            value={filterResponsavel}
            onChange={setFilterResponsavel}
            className="w-40"
            options={responsaveisOptions}
          />
        </div>
      ) : (
        <div className="flex flex-wrap gap-4 px-6 pt-4 pb-2 bg-gray-50 border-b border-gray-200 items-center">
          <Input
            prefix={<FilterOutlined />}
            placeholder="Filtrar por nome da etapa"
            value={filterEtapaNome}
            onChange={e => setFilterEtapaNome(e.target.value)}
            className="w-48"
          />
          <Select
            allowClear
            placeholder="Status da Etapa"
            value={filterEtapaStatus}
            onChange={setFilterEtapaStatus}
            className="w-32"
            options={[
              { value: 'NI', label: 'Não Iniciada' },
              { value: 'EA', label: 'Em Andamento' },
              { value: 'C', label: 'Concluída' },
              { value: 'P', label: 'Pausada' },
            ]}
          />
          <Select
            allowClear
            placeholder="Projeto relacionado"
            value={filterEtapaProjetoId}
            onChange={setFilterEtapaProjetoId}
            className="w-40"
            options={projetos.map(p => ({ value: p.id, label: p.nome }))}
          />
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {viewMode === 'projetos' ? (
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
        ) : (
          <EtapasList
            etapas={filteredEtapas}
            loading={loading}
            onSelectEtapa={setDetailModalEtapa}
            onDeleteEtapa={handleDeleteEtapa}
          />
        )}
      </div>

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
  );
};

export default ProjetosPage;

type EtapaWithProjeto = Etapa & { projetoNome: string; projetoId: number };