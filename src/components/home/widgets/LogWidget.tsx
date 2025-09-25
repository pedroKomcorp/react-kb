import React from 'react';

const LogWidget: React.FC = () => {
  // Real log data should be provided via props or fetched from services/api
  // Empty state shown when there is no data available
  return (
    <div className="w-full h-full flex flex-col">
      <div className="responsive-padding-sm border-b border-gray-200">
        <div className="widget-content font-medium text-white flex items-center gap-2">
          <span>📊</span>
          Log de Atividades
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar responsive-padding-sm flex items-center justify-center">
        <div className="text-center text-sm text-white">Nenhuma atividade para exibir.</div>
      </div>
    </div>
  );
};

export default LogWidget;