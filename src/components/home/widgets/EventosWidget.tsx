import React from 'react';

const EventosWidget: React.FC = () => {
  // Real events should be supplied through props or fetched from an API/service
  return (
    <div className="w-full h-full flex flex-col">
      <div className="responsive-padding-sm border-b border-gray-200">
        <div className="widget-content font-medium flex items-center text-gray-800 gap-2">
          <span>📅</span>
          Próximos Eventos
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar responsive-padding-sm flex items-center justify-center">
        <div className="text-center text-sm text-gray-700">Nenhum evento encontrado.</div>
      </div>
    </div>
  );
};

export default EventosWidget;