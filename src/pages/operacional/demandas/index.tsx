import React, { useState, useEffect, useCallback } from 'react';
import { getEtapas, updateEtapa } from '../../../services/etapas';
import { getProjetos } from '../../../services/projetos';
import type { Etapa, StatusEtapaEnum } from '../../../types/etapa';
import EtapaDetailModal from '../../../components/projetos/EtapaDetailModal';
import KanbanView from '../../../components/operacional/demandas/KanbanView';
import CalendarView from '../../../components/operacional/demandas/CalendarView';

// Constants for the slider labels
const layoutModes = ['Kanban', 'Kanban/Calendário', 'Calendário'];

// Define the extended etapa type that includes the project name
type EtapaWithProjeto = Etapa & { projetoNome?: string };

export const DemandasPage: React.FC = () => {
  const [etapas, setEtapas] = useState<EtapaWithProjeto[]>([]);
  const [selectedEtapa, setSelectedEtapa] = useState<EtapaWithProjeto | null>(null);
  const [sliderValue, setSliderValue] = useState(1); // 0: Kanban, 1: Split, 2: Calendar

  const fetchData = useCallback(async () => {
    // Fetch etapas and projetos concurrently for efficiency
    const [etapasData, projetosResponse] = await Promise.all([getEtapas(), getProjetos()]);

    // Create a map of project IDs to names for easy lookup
    const projetosMap = new Map(projetosResponse.projetos.map(p => [p.id, p.nome]));

    // Combine etapa data with project names
    const etapasWithProjectName = etapasData.map(e => ({
      ...e,
      projetoNome: projetosMap.get(e.projeto_id) || 'Projeto Desconhecido'
    }));
    
    setEtapas(etapasWithProjectName);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Updates the status of an etapa when it's dragged and dropped in the Kanban view.
   */

  const handleUpdateEtapaStatus = async (etapaId: number, newStatus: StatusEtapaEnum) => {
    const etapa = etapas.find(e => e.id === etapaId);
    if (etapa) {
      try {
        const updatedEtapa = await updateEtapa(etapaId, { status: newStatus });
        // Update the state with the server's response
        setEtapas(prevEtapas => prevEtapas.map(e => (e.id === etapaId ? { ...e, ...updatedEtapa } : e)));
      } catch (error) {
        console.error("Falha ao atualizar o status da etapa", error);
        // Optionally, add a user-facing error message here
      }
    }
  };

  /**
   * Saves all changes made to an etapa from the detail modal.
   */
  const handleSaveEtapa = async (updatedEtapa: Partial<Etapa> & { id: number }) => {
     try {
        const savedEtapa = await updateEtapa(updatedEtapa.id, updatedEtapa);
        setEtapas(etapas.map(e => e.id === savedEtapa.id ? {...e, ...savedEtapa} : e));
        setSelectedEtapa(null);
     } catch (error) {
        console.error("Falha ao salvar a etapa", error);
     }
  };

  // Dynamically calculate container classes based on the slider's position
  const kanbanContainerClass = `flex flex-col h-full transition-all duration-500 ease-in-out ${
    sliderValue == 2 ? 'w-0 opacity-0 p-0' : sliderValue == 1 ? 'w-1/2' : 'w-full'
  }`;
  const calendarContainerClass = `flex flex-col h-full transition-all duration-500 ease-in-out ${
    sliderValue == 0 ? 'w-0 opacity-0 p-0' : sliderValue == 1 ? 'w-1/2' : 'w-full'
  }`;

  return (
    <div className="w-full h-full flex flex-col ">
      {/* Page Content */}
      <div className="flex-1 flex flex-col p-4 space-y-4">
        {/* Self-contained styles for slider thumb, avoiding a separate CSS file */}
        <style>{`
          .slider-thumb::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            background: #1f2937; /* bg-gray-800 */
            cursor: pointer;
            border-radius: 9999px;
          }
          .slider-thumb::-moz-range-thumb {
            width: 20px;
            height: 20px;
            background: #1f2937;
            cursor: pointer;
            border-radius: 9999px;
          }
        `}</style>

        {/* Page Title and Layout Controls */}
        <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-800">Demandas</h1>
          <div className="w-full md:w-1/3">
            <label htmlFor="layout-slider" className="block mb-2 text-sm font-medium text-gray-900 text-center">
              {layoutModes[sliderValue]}
            </label>
            <input
              id="layout-slider"
              type="range"
              min="0"
              max="2"
              value={sliderValue}
              onChange={(e) => setSliderValue(Number(e.target.value))}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Kanban</span>
              <span>Kanban/Calendário</span>
              <span>Calendário</span>
            </div>
          </div>
        </div>

        <main className="flex-grow flex space-x-4 overflow-hidden">
          <div className={kanbanContainerClass}>
              <KanbanView
                etapas={etapas}
                onEtapaClick={setSelectedEtapa}
                onUpdateEtapaStatus={handleUpdateEtapaStatus}
              />
          </div>
          <div className={calendarContainerClass}>
              <CalendarView
                etapas={etapas}
                onEtapaClick={setSelectedEtapa}
              />
          </div>
        </main>

        <EtapaDetailModal
          etapa={selectedEtapa}
          open={!!selectedEtapa}
          onClose={() => setSelectedEtapa(null)}
          onSave={handleSaveEtapa}
        />
      </div>
    </div>
  );
};

