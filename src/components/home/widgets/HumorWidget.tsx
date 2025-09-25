import React from 'react';

const HumorWidget: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col responsive-padding">
      <div className="text-center mb-3">
        <div className="widget-content font-medium text-white">Como está seu humor?</div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-sm text-white">Registro de humor indisponível.</div>
      </div>
    </div>
  );
};

export default HumorWidget;