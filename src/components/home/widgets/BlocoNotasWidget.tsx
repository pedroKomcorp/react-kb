import React from 'react';

const BlocoNotasWidget: React.FC = () => (
  <div className="w-full h-full flex flex-col responsive-padding">
    <div className="flex items-center gap-2 mb-3">
      <span className="text-lg">📝</span>
      <span className="widget-content text-gray-800 font-medium">Notas Rápidas</span>
    </div>
    <div className="flex-1 min-h-0">
      <textarea 
        className="w-full h-full p-2 border border-gray-200 rounded resize-none text-sm"
        style={{ fontSize: 'clamp(11px, 2cqw, 14px)' }}
      />
    </div>
  </div>
);

export default BlocoNotasWidget;