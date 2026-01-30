import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import { getProjetos, updateProjeto } from '../../../services/projetos';
import { getEtapas } from '../../../services/etapas';
import { getUsuarios } from '../../../services/usuarios';
import type { Projeto } from '../../../types/projeto';
import type { Usuario } from '../../../types/usuario';
import type { Etapa } from '../../../types/etapa';
import { createEtapa, updateEtapa, deleteEtapa } from '../../../services/etapas';
import type { ProjetoCalendarViewRef } from '../../../components/operacional/demandas/ProjetoCalendarView';

const ProjetoDetailModal = lazy(() => import('../../../components/projetos/ProjetoDetailModal'));
const ProjetoKanbanView = lazy(() => import('../../../components/operacional/demandas/ProjetoKanbanView'));
const ProjetoCalendarView = lazy(() => import('../../../components/operacional/demandas/ProjetoCalendarView'));

const viewFallback = (
  <div className="w-full h-full flex items-center justify-center text-gray-500">
    Carregando...
  </div>
);

export const DemandasPage: React.FC = () => {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [selectedProjeto, setSelectedProjeto] = useState<Projeto | null>(null);
  const [leftWidth, setLeftWidth] = useState(50); // Percentage width for left panel (Kanban)
  const [isDragging, setIsDragging] = useState(false);
  const calendarRef = useRef<ProjetoCalendarViewRef>(null);
  
  // Get current month start and end dates
  const getCurrentMonthRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  };
  
  const [dateFilter, setDateFilter] = useState(getCurrentMonthRange());
  const [showKanban, setShowKanban] = useState(true);
  const [showCalendar, setShowCalendar] = useState(true);

  const goToPreviousMonth = () => {
    const currentStart = new Date(dateFilter.start);
    const prevMonthStart = new Date(currentStart.getFullYear(), currentStart.getMonth() , 1);
    const prevMonthEnd = new Date(prevMonthStart.getFullYear(), prevMonthStart.getMonth() + 1, 0);
    
    setDateFilter({
      start: prevMonthStart.toISOString().split('T')[0],
      end: prevMonthEnd.toISOString().split('T')[0]
    });

    // Also change the calendar month
    calendarRef.current?.changeMonth(-1);
  };

  const goToNextMonth = () => {
    const currentStart = new Date(dateFilter.start);
    const nextMonthStart = new Date(currentStart.getFullYear(), currentStart.getMonth() + 2, 1);
    const nextMonthEnd = new Date(nextMonthStart.getFullYear(), nextMonthStart.getMonth() + 1, 0);

    setDateFilter({
      start: nextMonthStart.toISOString().split('T')[0],
      end: nextMonthEnd.toISOString().split('T')[0]
    });

    // Also change the calendar month
    calendarRef.current?.changeMonth(1);
  };

  const goToCurrentMonth = () => {
    setDateFilter(getCurrentMonthRange());
    // Also reset the calendar to current month
    calendarRef.current?.goToCurrentMonth();
  };

  const fetchData = useCallback(async () => {
    const [projetosResponse, usuariosData, etapasData] = await Promise.all([
      getProjetos(),
      getUsuarios(),
      getEtapas()
    ]);
    
    // Associate etapas with their projetos
    const projetosWithEtapas = projetosResponse.projetos.map(projeto => ({
      ...projeto,
      etapas: etapasData.filter(etapa => etapa.projeto_id === projeto.id)
    }));
    
    setProjetos(projetosWithEtapas);
    setUsuarios(usuariosData);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateProjetoStatus = async (projetoId: number, newStatus: 'NI' | 'EA' | 'C' | 'P') => {
    const projeto = projetos.find(p => p.id === projetoId);
    if (projeto) {
      try {
        const updatedProjeto = await updateProjeto(projetoId, { status: newStatus });
        setProjetos(prevProjetos => prevProjetos.map(p => (p.id === projetoId ? { ...p, ...updatedProjeto } : p)));
      } catch (error) {
        console.error("Falha ao atualizar o status do projeto", error);
      }
    }
  };

  const handleUpdateProjeto = async (updatedProjeto: Partial<Projeto>) => {
    if (!selectedProjeto) return;
    try {
      const savedProjeto = await updateProjeto(selectedProjeto.id, updatedProjeto);
      setProjetos(projetos.map(p => p.id === savedProjeto.id ? { ...p, ...savedProjeto } : p));
      setSelectedProjeto(prev => prev ? { ...prev, ...savedProjeto } : null);
    } catch (error) {
      console.error("Falha ao salvar o projeto", error);
    }
  };

  const handleAddEtapa = async (etapa: Partial<Etapa>) => {
    if (!selectedProjeto) return;
    try {
      const newEtapa = await createEtapa({ ...etapa, projeto_id: selectedProjeto.id } as Omit<Etapa, 'id'>);
      const updatedEtapas = [...(selectedProjeto.etapas || []), newEtapa];
      setSelectedProjeto(prev => prev ? { ...prev, etapas: updatedEtapas } : null);
      setProjetos(projetos.map(p => p.id === selectedProjeto.id ? { ...p, etapas: updatedEtapas } : p));
    } catch (error) {
      console.error("Falha ao criar etapa", error);
    }
  };

  const handleUpdateEtapa = async (etapa: Partial<Etapa> & { id: number }) => {
    try {
      const savedEtapa = await updateEtapa(etapa.id, etapa);
      if (selectedProjeto) {
        const updatedEtapas = (selectedProjeto.etapas || []).map(e => 
          e.id === savedEtapa.id ? { ...e, ...savedEtapa } : e
        );
        setSelectedProjeto(prev => prev ? { ...prev, etapas: updatedEtapas } : null);
        setProjetos(projetos.map(p => p.id === selectedProjeto.id ? { ...p, etapas: updatedEtapas } : p));
      }
    } catch (error) {
      console.error("Falha ao atualizar etapa", error);
    }
  };

  const handleDeleteEtapa = async (etapaId: number) => {
    try {
      await deleteEtapa(etapaId);
      if (selectedProjeto) {
        const updatedEtapas = (selectedProjeto.etapas || []).filter(e => e.id !== etapaId);
        setSelectedProjeto(prev => prev ? { ...prev, etapas: updatedEtapas } : null);
        setProjetos(projetos.map(p => p.id === selectedProjeto.id ? { ...p, etapas: updatedEtapas } : p));
      }
    } catch (error) {
      console.error("Falha ao deletar etapa", error);
    }
  };

  const filteredProjetos = projetos.filter(projeto => {
    // Projects without any dates should appear on all months in kanban
    if (!projeto.data_inicio && !projeto.data_prazo) return true;
    
    // Check if project falls within the date range
    const startDate = projeto.data_inicio ? projeto.data_inicio.split('T')[0] : null;
    const endDate = projeto.data_prazo ? projeto.data_prazo.split('T')[0] : null;
    
    // If project has a start date, check if it's within range or before the filter end
    // If project has an end date, check if it's within range or after the filter start
    if (startDate && endDate) {
      // Project with both dates: show if date range overlaps with filter range
      return startDate <= dateFilter.end && endDate >= dateFilter.start;
    } else if (startDate) {
      // Only start date: show if start is before or within the filter range
      return startDate <= dateFilter.end;
    } else if (endDate) {
      // Only end date: show if end is after or within the filter range
      return endDate >= dateFilter.start;
    }
    
    return true;
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const container = document.querySelector('.resize-container');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    const constrainedWidth = Math.min(Math.max(newLeftWidth, 20), 80);
    setLeftWidth(constrainedWidth);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="w-full h-full flex flex-col ">
      {/* Page Content */}
      <div className="flex-1 flex flex-col pl-20 p-4 space-y-4">

        {/* Page Title and Filter Controls */}
        <div className="bg-transparent rounded-lg  flex items-center justify-between flex-shrink-0">
          <h1 className="text-2xl font-bold text-white">QUADRO DE PROJETOS</h1>
          <div className="flex items-center space-x-6">
            {/* Date Filter */}
            <div className="flex items-center space-x-4">
              {/* Month Navigation */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPreviousMonth}
                  className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors duration-200 font-semibold"
                  title="Mês anterior"
                >
                  ←
                </button>
                <button
                  onClick={goToCurrentMonth}
                  className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors duration-200 text-sm"
                  title="Mês atual"
                >
                  Hoje
                </button>
                <button
                  onClick={goToNextMonth}
                  className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors duration-200 font-semibold"
                  title="Próximo mês"
                >
                  →
                </button>
              </div>
              
              <label className="text-sm font-medium text-white">
                Data início:
              </label>
              <input
                type="date"
                value={dateFilter.start}
                onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                className="px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <label className="text-sm font-medium text-white">
                Data fim:
              </label>
              <input
                type="date"
                value={dateFilter.end}
                onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                className="px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* View Toggles */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-white">
                Visualização:
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    if (showKanban && !showCalendar) return; 
                    setShowKanban(!showKanban);
                  }}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    showKanban 
                      ? 'bg-[#775343] text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Kanban
                </button>
                <button
                  onClick={() => {
                    // Always allow turning ON, only prevent turning OFF if it's the last view  
                    if (!showKanban && showCalendar) return; // Don't turn off the last view
                    setShowCalendar(!showCalendar);
                  }}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    showCalendar 
                      ? 'bg-[#775343] text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Calendário
                </button>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-grow flex overflow-hidden resize-container">
          {/* Left Panel - Kanban */}
          {showKanban && (
            <div 
              className="flex flex-col h-full overflow-hidden mr-2"
              style={{ width: showCalendar ? `${leftWidth}%` : '100%' }}
            >
              <Suspense fallback={viewFallback}>
                <ProjetoKanbanView
                  projetos={filteredProjetos}
                  onProjetoClick={(projeto) => {
                    const found = projetos.find(p => p.id === projeto.id);
                    if (found) setSelectedProjeto(found);
                  }}
                  onUpdateProjetoStatus={handleUpdateProjetoStatus}
                />
              </Suspense>
            </div>
          )}
          
          {/* Draggable Divider - Only show if both panels are visible */}
          {showKanban && showCalendar && (
            <div
              className={`w-1 h-[50%] bg-gray-300 hover:bg-gray-400 cursor-col-resize flex-shrink-0 self-center transition-colors duration-150 ${
                isDragging ? 'bg-blue-500' : ''
              }`}
              onMouseDown={handleMouseDown}
            />
          )}
          
          {/* Right Panel - Calendar */}
          {showCalendar && (
            <div 
              className="flex flex-col h-full overflow-hidden ml-2"
              style={{ width: showKanban ? `${100 - leftWidth}%` : '100%' }}
            >
              <Suspense fallback={viewFallback}>
                <ProjetoCalendarView
                  ref={calendarRef}
                  projetos={filteredProjetos}
                  onProjetoClick={(projeto) => {
                    const found = projetos.find(p => p.id === projeto.id);
                    if (found) setSelectedProjeto(found);
                  }}
                />
              </Suspense>
            </div>
          )}
        </main>

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
    </div>
  );
};
