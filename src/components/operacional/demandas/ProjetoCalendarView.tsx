import { useState, useImperativeHandle, forwardRef } from 'react';
import type { Projeto } from '../../../types/projeto';
import { Tooltip } from 'antd';

// Constants for month names and days of the week
const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// --- PROPS DEFINITION ---
interface ProjetoCalendarViewProps {
  projetos: Projeto[];
  onProjetoClick: (projeto: Projeto) => void;
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

const ProjetoCalendarView = forwardRef<ProjetoCalendarViewRef, ProjetoCalendarViewProps>(({ projetos, onProjetoClick }, ref) => {
  const [currentDate, setCurrentDate] = useState(new Date());

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
    return projetos.filter(projeto => {
      if (!projeto.data_prazo) return false;
      // Use UTC methods to avoid timezone-related date shifts
      const prazoDate = new Date(projeto.data_prazo);
      return prazoDate.getUTCFullYear() === year &&
             prazoDate.getUTCMonth() === month &&
             prazoDate.getUTCDate() === day;
    });
  };

  /**
   * Gets projetos that START on a specific date
   */
  const getProjetosStartingOnDate = (day: number) => {
    return projetos.filter(projeto => {
      if (!projeto.data_inicio) return false;
      const startDate = new Date(projeto.data_inicio);
      return startDate.getUTCFullYear() === year &&
             startDate.getUTCMonth() === month &&
             startDate.getUTCDate() === day;
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

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 py-2 px-4 border-b bg-gray-50 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-500"></span> Início
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-500"></span> Prazo
        </span>
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
          
          return (
            <div key={day} className="p-1 bg-white relative flex flex-col min-h-0 overflow-hidden">
              <div
                className={`inline-flex w-6 h-6 items-center justify-center text-center leading-none rounded-full transition ease-in-out duration-100 text-xs flex-shrink-0 ${
                  isToday(day) ? 'bg-blue-500 text-white' : 'text-gray-700'
                }`}
              >
                {day}
              </div>
              <div className="flex-grow overflow-y-auto mt-1 space-y-0.5 min-h-0">
                {/* Projects starting on this day */}
                {projetosStarting.map(projeto => {
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
                })}
                
                {/* Projects with deadline on this day */}
                {projetosWithPrazo.map(projeto => {
                  const colors = statusColors[projeto.status] || statusColors['NI'];
                  // Check if this project also starts on this day to avoid duplicate
                  const alsoStarts = projetosStarting.some(p => p.id === projeto.id);
                  if (alsoStarts) return null;
                  
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
                })}
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
