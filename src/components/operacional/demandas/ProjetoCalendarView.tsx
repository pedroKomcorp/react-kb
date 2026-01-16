import { useState, useImperativeHandle, forwardRef } from 'react';
import type { Projeto } from '../../../types/projeto';
import type { Etapa } from '../../../types/etapa';
import { Tooltip } from 'antd';

// Constants for month names and days of the week
const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// --- PROPS DEFINITION ---
interface ProjetoCalendarViewProps {
  projetos: Projeto[];
  onProjetoClick: (projeto: Projeto) => void;
  onEtapaClick?: (etapa: Etapa, projeto: Projeto) => void;
}

export interface ProjetoCalendarViewRef {
  changeMonth: (direction: number) => void;
  goToCurrentMonth: () => void;
}

// Color mapping for project status
const statusColors: Record<string, { bg: string; border: string; text: string }> = {
  'NI': { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-800' },
  'EA': { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800' },
  'P': { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-800' },
  'C': { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800' },
};

// Mapping for priority
const priorities: Record<string, { label: string; color: string }> = {
  'UT': { label: 'Urgente', color: 'red' },
  'AL': { label: 'Alta', color: 'orange' },
  'MD': { label: 'Média', color: 'blue' },
  'BA': { label: 'Baixa', color: 'green' },
};

const ProjetoCalendarView = forwardRef<ProjetoCalendarViewRef, ProjetoCalendarViewProps>(({ projetos, onProjetoClick, onEtapaClick }, ref) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showProjetos, setShowProjetos] = useState(true);
  const [showEtapas, setShowEtapas] = useState(true);

  // --- DATE CALCULATIONS ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const blankDays = Array.from({ length: firstDayOfMonth });
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Calculate number of weeks (rows) needed
  const totalCells = firstDayOfMonth + daysInMonth;
  const numberOfWeeks = Math.ceil(totalCells / 7);

  // Extract all etapas from projetos with their parent projeto reference
  const allEtapas = projetos.flatMap(projeto => 
    (projeto.etapas || []).map(etapa => ({ etapa, projeto }))
  );

  // --- EVENT HANDLERS ---

  /**
   * Navigates to the previous or next month.
   * @param direction - A number, -1 for previous, 1 for next.
   */
  const changeMonth = (direction: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    changeMonth,
    goToCurrentMonth
  }));

  /**
   * Filters and returns the projetos that have their prazo on a specific calendar date.
   * @param day - The day of the month.
   */
  const getProjetosForDate = (day: number) => {
    if (!showProjetos) return [];
    return projetos.filter(projeto => {
      if (!projeto.data_prazo) return false;
      // Parse date string directly to avoid timezone issues
      // Handle both ISO format (2026-01-16T00:00:00) and date-only (2026-01-16)
      const dateStr = projeto.data_prazo.split('T')[0];
      const [prazoYear, prazoMonth, prazoDay] = dateStr.split('-').map(Number);
      return prazoYear === year &&
             (prazoMonth - 1) === month && // months are 0-indexed
             prazoDay === day;
    });
  };

  /**
   * Gets projetos that START on a specific date
   */
  const getProjetosStartingOnDate = (day: number) => {
    if (!showProjetos) return [];
    return projetos.filter(projeto => {
      if (!projeto.data_inicio) return false;
      // Parse date string directly to avoid timezone issues
      const dateStr = projeto.data_inicio.split('T')[0];
      const [startYear, startMonth, startDay] = dateStr.split('-').map(Number);
      return startYear === year &&
             (startMonth - 1) === month && // months are 0-indexed
             startDay === day;
    });
  };

  /**
   * Gets etapas that have their prazo on a specific date
   */
  const getEtapasForDate = (day: number) => {
    if (!showEtapas) return [];
    return allEtapas.filter(({ etapa }) => {
      if (!etapa.data_prazo) return false;
      const dateStr = etapa.data_prazo.split('T')[0];
      const [prazoYear, prazoMonth, prazoDay] = dateStr.split('-').map(Number);
      return prazoYear === year &&
             (prazoMonth - 1) === month &&
             prazoDay === day;
    });
  };

  /**
   * Checks if a given calendar date is today.
   * @param day - The day of the month.
   */
  const isToday = (day: number) => {
    const today = new Date();
    return today.getFullYear() === year &&
           today.getMonth() === month &&
           today.getDate() === day;
  };

  // --- RENDER ---
  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between py-2 px-6 border-b">
        <div>
          <span className="text-lg font-bold text-gray-800">{MONTH_NAMES[month]}</span>
          <span className="ml-1 text-lg text-gray-600 font-normal">{year}</span>
        </div>
        <div className="border rounded-lg px-1 flex items-center">
          <button
            type="button"
            className="leading-none rounded-lg transition ease-in-out duration-100 inline-flex cursor-pointer hover:bg-gray-200 p-1 items-center"
            onClick={() => changeMonth(-1)}
          >
            <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div className="border-r inline-flex h-6"></div>
          <button
            type="button"
            className="leading-none rounded-lg transition ease-in-out duration-100 inline-flex items-center cursor-pointer hover:bg-gray-200 p-1"
            onClick={() => changeMonth(1)}
          >
            <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Legend and Filters */}
      <div className="flex items-center justify-between py-2 px-4 border-b bg-gray-50 text-xs">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-500"></span> Início Projeto
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-500"></span> Prazo Projeto
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-purple-500"></span> Prazo Etapa
          </span>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showProjetos}
              onChange={(e) => {
                // Don't allow unchecking if it's the only one checked
                if (!e.target.checked && !showEtapas) return;
                setShowProjetos(e.target.checked);
              }}
              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="font-medium">Projetos</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showEtapas}
              onChange={(e) => {
                // Don't allow unchecking if it's the only one checked
                if (!e.target.checked && !showProjetos) return;
                setShowEtapas(e.target.checked);
              }}
              className="w-3.5 h-3.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="font-medium">Etapas</span>
          </label>
        </div>
      </div>

      {/* Days of the Week */}
      <div className="grid grid-cols-7">
        {DAYS.map(day => (
          <div key={day} className="px-2 py-2 text-gray-600 text-sm uppercase tracking-wide font-bold text-center">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div 
        className="grid grid-cols-7 flex-grow gap-px bg-gray-200"
        style={{ gridTemplateRows: `repeat(${numberOfWeeks}, minmax(0, 1fr))` }}
      >
        {/* Blank days for layout */}
        {blankDays.map((_, index) => (
          <div key={`blank-${index}`} className="bg-white"></div>
        ))}

        {/* Calendar days */}
        {calendarDays.map(day => {
          const projetosWithPrazo = getProjetosForDate(day);
          const projetosStarting = getProjetosStartingOnDate(day);
          const etapasWithPrazo = getEtapasForDate(day);
          
          // Combine all items for the day
          type CalendarItem = 
            | { type: 'start'; projeto: typeof projetosStarting[0] }
            | { type: 'prazo'; projeto: typeof projetosWithPrazo[0] }
            | { type: 'etapa'; etapa: typeof etapasWithPrazo[0]['etapa']; projeto: typeof etapasWithPrazo[0]['projeto'] };
          
          const allItems: CalendarItem[] = [
            ...projetosStarting.map(projeto => ({ type: 'start' as const, projeto })),
            ...projetosWithPrazo
              .filter(projeto => !projetosStarting.some(p => p.id === projeto.id))
              .map(projeto => ({ type: 'prazo' as const, projeto })),
            ...etapasWithPrazo.map(({ etapa, projeto }) => ({ type: 'etapa' as const, etapa, projeto }))
          ];
          
          const maxVisible = 3;
          const visibleItems = allItems.slice(0, maxVisible);
          const hiddenCount = allItems.length - maxVisible;
          
          return (
            <div key={day} className="p-1 bg-white relative flex flex-col min-h-0 overflow-hidden">
              <div
                className={`inline-flex w-6 h-6 items-center justify-center text-center leading-none rounded-full transition ease-in-out duration-100 text-xs flex-shrink-0 ${
                  isToday(day) ? 'bg-blue-500 text-white' : 'text-gray-700'
                }`}
              >
                {day}
              </div>
              <div className="flex-grow mt-1 space-y-0.5 min-h-0 overflow-hidden">
                {visibleItems.map((item) => {
                  if (item.type === 'start') {
                    const projeto = item.projeto;
                    const colors = statusColors[projeto.status] || statusColors['NI'];
                    return (
                      <Tooltip 
                        key={`start-${projeto.id}`} 
                        title={
                          <div>
                            <div className="font-semibold">{projeto.nome}</div>
                            <div className="text-xs">Início do projeto</div>
                            {priorities[projeto.prioridade] && (
                              <div className="text-xs">Prioridade: {priorities[projeto.prioridade].label}</div>
                            )}
                          </div>
                        }
                      >
                        <div
                          onClick={() => onProjetoClick(projeto)}
                          className={`px-1.5 py-0.5 rounded text-xs cursor-pointer ${colors.bg} ${colors.text} border ${colors.border} border-l-2 border-l-green-500`}
                        >
                          <p className="font-medium truncate text-[10px]">{projeto.nome}</p>
                        </div>
                      </Tooltip>
                    );
                  } else if (item.type === 'prazo') {
                    const projeto = item.projeto;
                    const colors = statusColors[projeto.status] || statusColors['NI'];
                    return (
                      <Tooltip 
                        key={`prazo-${projeto.id}`} 
                        title={
                          <div>
                            <div className="font-semibold">{projeto.nome}</div>
                            <div className="text-xs">Prazo do projeto</div>
                            {priorities[projeto.prioridade] && (
                              <div className="text-xs">Prioridade: {priorities[projeto.prioridade].label}</div>
                            )}
                          </div>
                        }
                      >
                        <div
                          onClick={() => onProjetoClick(projeto)}
                          className={`px-1.5 py-0.5 rounded text-xs cursor-pointer ${colors.bg} ${colors.text} border ${colors.border} border-l-2 border-l-red-500`}
                        >
                          <p className="font-medium truncate text-[10px]">{projeto.nome}</p>
                        </div>
                      </Tooltip>
                    );
                  } else {
                    const { etapa, projeto } = item;
                    return (
                      <Tooltip 
                        key={`etapa-${etapa.id}`} 
                        title={
                          <div>
                            <div className="font-semibold">{etapa.nome}</div>
                            <div className="text-xs text-gray-300">Projeto: {projeto.nome}</div>
                            <div className="text-xs">Prazo da etapa</div>
                          </div>
                        }
                      >
                        <div
                          onClick={() => onEtapaClick ? onEtapaClick(etapa, projeto) : onProjetoClick(projeto)}
                          className="px-1.5 py-0.5 rounded text-xs cursor-pointer bg-purple-100 text-purple-800 border border-purple-300 border-l-2 border-l-purple-500"
                        >
                          <p className="font-medium truncate text-[10px]">{etapa.nome}</p>
                        </div>
                      </Tooltip>
                    );
                  }
                })}
                
                {/* Show "+X more" indicator */}
                {hiddenCount > 0 && (
                  <Tooltip
                    title={
                      <div className="max-h-48 overflow-y-auto">
                        <div className="font-semibold mb-1">Mais {hiddenCount} item(s):</div>
                        {allItems.slice(maxVisible).map((item, index) => (
                          <div key={index} className="text-xs py-0.5 border-b border-gray-600 last:border-0">
                            {item.type === 'start' && (
                              <span>🟢 Início: {item.projeto.nome}</span>
                            )}
                            {item.type === 'prazo' && (
                              <span>🔴 Prazo: {item.projeto.nome}</span>
                            )}
                            {item.type === 'etapa' && (
                              <span>🟣 Etapa: {item.etapa.nome}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    }
                  >
                    <div className="px-1.5 py-0.5 rounded text-[10px] cursor-pointer bg-gray-200 text-gray-600 font-medium text-center hover:bg-gray-300 transition-colors">
                      +{hiddenCount} mais
                    </div>
                  </Tooltip>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

ProjetoCalendarView.displayName = 'ProjetoCalendarView';

export default ProjetoCalendarView;
