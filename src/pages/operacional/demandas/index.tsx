import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getEtapas, updateEtapa } from '../../../services/etapas';
import { getProjetos } from '../../../services/projetos';
import type { Etapa, StatusEtapaEnum } from '../../../types/etapa';
import EtapaDetailModal from '../../../components/projetos/EtapaDetailModal';
import KanbanView from '../../../components/operacional/demandas/KanbanView';
import CalendarView, { type CalendarViewRef } from '../../../components/operacional/demandas/CalendarView';

// Define the extended etapa type that matches EtapaDetailModal's EtapaWithProjeto
type EtapaWithProjeto = Etapa & { projetoNome: string; projetoId: number };

export const DemandasPage: React.FC = () => {
  const [etapas, setEtapas] = useState<EtapaWithProjeto[]>([]);
  const [selectedEtapa, setSelectedEtapa] = useState<EtapaWithProjeto | null>(null);
  const [leftWidth, setLeftWidth] = useState(50); // Percentage width for left panel (Kanban)
  const [isDragging, setIsDragging] = useState(false);
  const calendarRef = useRef<CalendarViewRef>(null);
  
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
    const [etapasData, projetosResponse] = await Promise.all([getEtapas(), getProjetos()]);

    const projetosMap = new Map(projetosResponse.projetos.map(p => [p.id, p.nome]));

    const etapasWithProjectName = etapasData.map(e => ({
      ...e,
      projetoNome: projetosMap.get(e.projeto_id) || 'Projeto Desconhecido',
      projetoId: e.projeto_id
    }));
    
    setEtapas(etapasWithProjectName);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateEtapaStatus = async (etapaId: number, newStatus: StatusEtapaEnum) => {
    const etapa = etapas.find(e => e.id === etapaId);
    if (etapa) {
      try {
        const updatedEtapa = await updateEtapa(etapaId, { status: newStatus });
        // Update the state with the server's response
        setEtapas(prevEtapas => prevEtapas.map(e => (e.id === etapaId ? { ...e, ...updatedEtapa } : e)));
      } catch (error) {
        console.error("Falha ao atualizar o status da etapa", error);
      }
    }
  };

  const handleSaveEtapa = async (updatedEtapa: Partial<Etapa> & { id: number }) => {
     try {
        const savedEtapa = await updateEtapa(updatedEtapa.id, updatedEtapa);
        setEtapas(etapas.map(e => e.id === savedEtapa.id ? {...e, ...savedEtapa} : e));
        setSelectedEtapa(null);
     } catch (error) {
        console.error("Falha ao salvar a etapa", error);
     }
  };

  const filteredEtapas = etapas.filter(etapa => {
    if (!etapa.data_inicio && !etapa.data_prazo) return true; 
    const etapaDate = etapa.data_inicio || etapa.data_prazo;
    if (!etapaDate) return true;
    
    const etapaDateOnly = etapaDate.split('T')[0];
    return etapaDateOnly >= dateFilter.start && etapaDateOnly <= dateFilter.end;
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
          <h1 className="text-2xl font-bold text-white">QUADRO DE DEMANDAS</h1>
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
              <KanbanView
                etapas={filteredEtapas}
                onEtapaClick={(etapa) => {
                  const found = etapas.find(e => e.id === etapa.id);
                  if (found) setSelectedEtapa(found);
                }}
                onUpdateEtapaStatus={handleUpdateEtapaStatus}
              />
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
              <CalendarView
                ref={calendarRef}
                etapas={filteredEtapas}
                onEtapaClick={(etapa) => {
                  const found = etapas.find(e => e.id === etapa.id);
                  if (found) setSelectedEtapa(found);
                }}
              />
            </div>
          )}
        </main>

        <EtapaDetailModal
          etapa={selectedEtapa}
          open={!!selectedEtapa}
          onClose={() => setSelectedEtapa(null)}
          onUpdateEtapa={handleSaveEtapa}
        />
      </div>
    </div>
  );
};

