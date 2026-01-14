import React from 'react';

const LinhaTempoWidget: React.FC = () => {
  // Timeline data should be provided by services/props
  return (
    <div className="w-full h-full flex items-center responsive-padding overflow-x-auto custom-scrollbar">
      <div className="w-full flex items-center justify-center">
        <div className="text-sm text-gray-700">Nenhuma atividade de linha do tempo disponível.</div>
      </div>
    </div>
  );
};

export default LinhaTempoWidget;