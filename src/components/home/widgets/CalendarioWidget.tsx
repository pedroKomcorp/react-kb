import React from 'react';

const CalendarioWidget: React.FC = () => (
  <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
    <div className="text-center responsive-padding">
      <div className="text-lg font-medium mb-2">📅</div>
      <div className="widget-content">Calendário Widget</div>
      <div className="text-xs mt-2 opacity-70">
        Em desenvolvimento
      </div>
    </div>
  </div>
);

export default CalendarioWidget;