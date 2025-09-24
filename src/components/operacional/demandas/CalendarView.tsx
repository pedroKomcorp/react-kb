import React, { useState } from 'react';
import type { Etapa } from '../../../types/etapa';

// Constants for month names and days of the week
const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// --- PROPS DEFINITION ---
interface CalendarViewProps {
  etapas: Etapa[];
  onEtapaClick: (etapa: Etapa) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ etapas, onEtapaClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // --- DATE CALCULATIONS ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const blankDays = Array.from({ length: firstDayOfMonth });
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

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

  /**
   * Filters and returns the etapas that fall on a specific calendar date.
   * @param day - The day of the month.
   */
  const getEventsForDate = (day: number) => {
    return etapas.filter(etapa => {
      if (!etapa.data_inicio) return false;
      // Use UTC methods to avoid timezone-related date shifts
      const eventDate = new Date(etapa.data_inicio);
      return eventDate.getUTCFullYear() === year &&
             eventDate.getUTCMonth() === month &&
             eventDate.getUTCDate() === day;
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

      {/* Days of the Week */}
      <div className="grid grid-cols-7">
        {DAYS.map(day => (
          <div key={day} className="px-2 py-2 text-gray-600 text-sm uppercase tracking-wide font-bold text-center">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 grid-rows-5 flex-grow gap-px bg-gray-200">
        {/* Blank days for layout */}
        {blankDays.map((_, index) => (
          <div key={`blank-${index}`} className="bg-white"></div>
        ))}

        {/* Calendar days */}
        {calendarDays.map(day => (
          <div key={day} className="p-2 bg-white relative flex flex-col">
            <div
              className={`inline-flex w-7 h-7 items-center justify-center text-center leading-none rounded-full transition ease-in-out duration-100 text-sm ${
                isToday(day) ? 'bg-blue-500 text-white' : 'text-gray-700'
              }`}
            >
              {day}
            </div>
            <div className="flex-grow overflow-y-auto mt-1 space-y-1">
              {getEventsForDate(day).map(event => (
                <div
                  key={event.id}
                  onClick={() => onEtapaClick(event)}
                  className="px-2 py-1 rounded-lg text-xs cursor-pointer bg-blue-100 text-blue-800 border border-blue-200"
                >
                  <p className="font-semibold truncate">{event.nome}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;
