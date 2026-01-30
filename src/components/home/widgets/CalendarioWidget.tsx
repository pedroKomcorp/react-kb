import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Spin, Select } from 'antd';
import { getProjetos } from '../../../services/projetos';
import { getEtapas } from '../../../services/etapas';
import type { Etapa } from '../../../types/etapa';
import type { Projeto } from '../../../types/projeto';
import { getUsuarios } from '../../../services/usuarios';
import { updateProjeto } from '../../../services/projetos';
import { createEtapa, updateEtapa, deleteEtapa } from '../../../services/etapas';
import type { Usuario } from '../../../types/usuario';

const ProjetoCalendarView = lazy(() => import('../../operacional/demandas/ProjetoCalendarView'));
const ProjetoDetailModal = lazy(() => import('../../projetos/ProjetoDetailModal'));

const calendarFallback = (
  <div className="w-full h-full flex items-center justify-center">
    <Spin size="large" />
  </div>
);

const CalendarioWidget: React.FC = () => {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [filteredProjetos, setFilteredProjetos] = useState<Projeto[]>([]);
  const [selectedProjeto, setSelectedProjeto] = useState<Projeto | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [projetoFilter, setProjetoFilter] = useState<string>('');

  // Status options for filter
  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'NI', label: 'Não Iniciado' },
    { value: 'EA', label: 'Em Andamento' },
    { value: 'C', label: 'Concluído' },
    { value: 'P', label: 'Pausado' },
  ];

  // Fetch user projects
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [{ projetos: projetosData }, usuariosData, etapasData] = await Promise.all([
          getProjetos(),
          getUsuarios(),
          getEtapas()
        ]);

        // Get current user ID
        const userId = Number(localStorage.getItem('user_id'));

        // Associate etapas with their projetos
        const projetosWithEtapas = projetosData.map(projeto => ({
          ...projeto,
          etapas: etapasData.filter(etapa => etapa.projeto_id === projeto.id)
        }));

        // Filter projetos for current user (either responsible or annexed)
        const userProjetos = projetosWithEtapas.filter(projeto => {
          if (projeto.responsavel_id === userId) {
            return true;
          }
          if (projeto.anexados?.some(anexado => anexado.id === userId)) {
            return true;
          }
          return false;
        });

        setProjetos(userProjetos);
        setFilteredProjetos(userProjetos);
        setUsuarios(usuariosData);
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
    let filtered = projetos;

    if (statusFilter) {
      filtered = filtered.filter(projeto => projeto.status === statusFilter);
    }

    if (projetoFilter) {
      filtered = filtered.filter(projeto => projeto.id.toString() === projetoFilter);
    }

    setFilteredProjetos(filtered);
  }, [projetos, statusFilter, projetoFilter]);

  // Project options for filter
  const projetoOptions = [
    { value: '', label: 'Todos os Projetos' },
    ...projetos.map(projeto => ({
      value: projeto.id.toString(),
      label: projeto.nome
    }))
  ];

  const handleProjetoClick = (projeto: Projeto) => {
    setSelectedProjeto(projeto);
  };

  const handleUpdateProjeto = async (updatedProjeto: Partial<Projeto>) => {
    if (!selectedProjeto) return;
    try {
      const updated = await updateProjeto(selectedProjeto.id, updatedProjeto);
      setProjetos(prev => prev.map(p => p.id === updated.id ? updated : p));
      setSelectedProjeto(updated);
    } catch (error) {
      console.error('Error updating projeto:', error);
    }
  };

  const handleAddEtapa = async (etapa: Partial<Etapa>) => {
    try {
      const newEtapa = await createEtapa(etapa as Omit<Etapa, 'id'>);
      const projetoId = etapa.projeto_id;
      setProjetos(prev => prev.map(p => 
        p.id === projetoId 
          ? { ...p, etapas: [...(p.etapas || []), newEtapa] }
          : p
      ));
      if (selectedProjeto?.id === projetoId) {
        setSelectedProjeto(prev => prev ? { ...prev, etapas: [...(prev.etapas || []), newEtapa] } : null);
      }
    } catch (error) {
      console.error('Error adding etapa:', error);
    }
  };

  const handleUpdateEtapa = async (etapa: Partial<Etapa> & { id: number }) => {
    try {
      const { id, ...updatedData } = etapa;
      const updated = await updateEtapa(id, updatedData);
      setProjetos(prev => prev.map(p => ({
        ...p,
        etapas: (p.etapas || []).map(e => e.id === id ? updated : e)
      })));
      if (selectedProjeto) {
        setSelectedProjeto(prev => prev ? {
          ...prev,
          etapas: (prev.etapas || []).map(e => e.id === id ? updated : e)
        } : null);
      }
    } catch (error) {
      console.error('Error updating etapa:', error);
    }
  };

  const handleDeleteEtapa = async (id: number) => {
    try {
      await deleteEtapa(id);
      setProjetos(prev => prev.map(p => ({
        ...p,
        etapas: (p.etapas || []).filter(e => e.id !== id)
      })));
      if (selectedProjeto) {
        setSelectedProjeto(prev => prev ? {
          ...prev,
          etapas: (prev.etapas || []).filter(e => e.id !== id)
        } : null);
      }
    } catch (error) {
      console.error('Error deleting etapa:', error);
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
        {filteredProjetos.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-2xl mb-2">📅</div>
              <div>Nenhum projeto encontrado</div>
              <div className="text-sm mt-1 opacity-70">
                Ajuste os filtros ou verifique se há projetos atribuídos a você
              </div>
            </div>
          </div>
        ) : (
          <Suspense fallback={calendarFallback}>
            <ProjetoCalendarView
              projetos={filteredProjetos}
              onProjetoClick={handleProjetoClick}
            />
          </Suspense>
        )}
      </div>

      {/* Projeto Detail Modal */}
      <Suspense fallback={null}>
        <ProjetoDetailModal
          projeto={selectedProjeto}
          usuarios={usuarios}
          open={!!selectedProjeto}
          onClose={() => setSelectedProjeto(null)}
          onAddEtapa={handleAddEtapa}
          onSelectEtapa={() => {}}
          onUpdateProjeto={handleUpdateProjeto}
          onUpdateEtapa={handleUpdateEtapa}
          onDeleteEtapa={handleDeleteEtapa}
        />
      </Suspense>
    </div>
  );
};

export default CalendarioWidget;
