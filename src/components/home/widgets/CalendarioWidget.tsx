import React, { useState, useEffect } from 'react';
import { Spin, Select } from 'antd';
import { getEtapas } from '../../../services/etapas';
import { getProjetos } from '../../../services/projetos';
import CalendarView from '../../operacional/demandas/CalendarView';
import EtapaDetailModal from '../../projetos/EtapaDetailModal';
import type { Etapa } from '../../../types/etapa';
import type { Projeto } from '../../../types/projeto';

// Extended etapa type that includes project info
type EtapaWithProjeto = Etapa & { projetoNome: string; projetoId: number };

const CalendarioWidget: React.FC = () => {
  const [etapas, setEtapas] = useState<EtapaWithProjeto[]>([]);
  const [filteredEtapas, setFilteredEtapas] = useState<EtapaWithProjeto[]>([]);
  const [selectedEtapa, setSelectedEtapa] = useState<EtapaWithProjeto | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [projetoFilter, setProjetoFilter] = useState<string>('');
  const [projetos, setProjetos] = useState<Projeto[]>([]);

  // Status options for filter
  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'NI', label: 'Não Iniciado' },
    { value: 'EA', label: 'Em Andamento' },
    { value: 'C', label: 'Concluído' },
    { value: 'P', label: 'Pausado' },
  ];

  // Fetch user etapas and projects
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [etapasData, { projetos: projetosData }] = await Promise.all([
          getEtapas(),
          getProjetos()
        ]);

        // Create a map of projects for quick lookup
        const projetosMap = new Map(projetosData.map(p => [p.id, p.nome]));
        setProjetos(projetosData);

        // Get current user ID
        const userId = Number(localStorage.getItem('user_id'));

        // Filter etapas for current user (either responsible or annexed)
        const userEtapas = etapasData.filter(etapa => {
          // Check if user is responsible for the project
          const projeto = projetosData.find(p => p.id === etapa.projeto_id);
          if (projeto && projeto.responsavel_id === userId) {
            return true;
          }
          // Check if user is annexed to the project
          if (projeto && projeto.anexados?.some(anexado => anexado.id === userId)) {
            return true;
          }
          return false;
        });

        // Add project information to etapas
        const etapasWithProject = userEtapas.map(etapa => ({
          ...etapa,
          projetoNome: projetosMap.get(etapa.projeto_id) || 'Projeto Desconhecido',
          projetoId: etapa.projeto_id
        }));

        setEtapas(etapasWithProject);
        setFilteredEtapas(etapasWithProject);
      } catch (error) {
        console.error('Error fetching calendar data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = etapas;

    if (statusFilter) {
      filtered = filtered.filter(etapa => etapa.status === statusFilter);
    }

    if (projetoFilter) {
      filtered = filtered.filter(etapa => etapa.projeto_id.toString() === projetoFilter);
    }

    setFilteredEtapas(filtered);
  }, [etapas, statusFilter, projetoFilter]);

  // Project options for filter
  const projetoOptions = [
    { value: '', label: 'Todos os Projetos' },
    ...projetos.map(projeto => ({
      value: projeto.id.toString(),
      label: projeto.nome
    }))
  ];

  const handleEtapaClick = (etapa: Etapa) => {
    const found = etapas.find(e => e.id === etapa.id);
    if (found) {
      setSelectedEtapa(found);
    }
  };

  const handleSaveEtapa = async (updatedEtapa: Partial<Etapa> & { id: number }) => {
    try {
      // Update etapa in the list
      setEtapas(prevEtapas => 
        prevEtapas.map(e => 
          e.id === updatedEtapa.id ? { ...e, ...updatedEtapa } : e
        )
      );
      setSelectedEtapa(null);
    } catch (error) {
      console.error('Error saving etapa:', error);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Filters */}
      <div className="flex gap-2 mb-3 items-center flex-shrink-0 px-2">
        <Select
          size="small"
          placeholder="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
          className="min-w-[120px]"
        />
        <Select
          size="small"
          placeholder="Projeto"
          value={projetoFilter}
          onChange={setProjetoFilter}
          options={projetoOptions}
          className="min-w-[150px] flex-1"
        />
      </div>

      {/* Calendar */}
      <div className="flex-1 overflow-hidden">
        {filteredEtapas.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-2xl mb-2">📅</div>
              <div>Nenhuma etapa encontrada</div>
              <div className="text-sm mt-1 opacity-70">
                Ajuste os filtros ou verifique se há etapas nos seus projetos
              </div>
            </div>
          </div>
        ) : (
          <CalendarView
            etapas={filteredEtapas}
            onEtapaClick={handleEtapaClick}
          />
        )}
      </div>

      {/* Etapa Detail Modal */}
      <EtapaDetailModal
        etapa={selectedEtapa}
        open={!!selectedEtapa}
        onClose={() => setSelectedEtapa(null)}
        onUpdateEtapa={handleSaveEtapa}
      />
    </div>
  );
};

export default CalendarioWidget;