import React, { useState } from 'react';
import { Card, Empty } from 'antd';
import { RadarChartOutlined } from '@ant-design/icons';
import ClienteSelector from '../../../components/ClienteSelector';
import type { Cliente } from '../../../types/cliente';

const RadarPage: React.FC = () => {
  const [selectedCliente, setSelectedCliente] = useState<Cliente | undefined>(undefined);

  const handleClienteSelect = (cliente: Cliente | undefined) => {
    setSelectedCliente(cliente);
  };

  const renderRadarData = () => {
    if (!selectedCliente) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <Empty 
            description="Selecione um cliente para visualizar os dados do radar"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-auto space-y-4">
        <Card 
          title={
            <div className="flex items-center space-x-2">
              <RadarChartOutlined />
              <span>Dados do Radar</span>
            </div>
          }
        >
          <Empty 
            description="Dados do radar serão implementados em breve"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Page Content */}
      <div className="flex-1 flex flex-col pl-20 p-4 space-y-4">
        {/* Page Title and Controls */}
        <div className="bg-transparent rounded-lg flex items-center justify-between flex-shrink-0">
          <h1 className="text-2xl font-bold text-white">RADAR</h1>
          <div className="flex items-center space-x-4">
            <RadarChartOutlined className="text-white text-xl" />
          </div>
        </div>

        {/* Client Selector - Always visible at top */}
        <div className="flex-shrink-0">
          <ClienteSelector
            selectedCliente={selectedCliente}
            onClienteSelect={handleClienteSelect}
            title="Selecione um Cliente"
            description="Escolha um cliente para visualizar os dados do radar"
            icon={<RadarChartOutlined className="text-2xl mb-2" />}
          />
        </div>

        {/* Radar Data Content */}
        {renderRadarData()}
      </div>
    </div>
  );
};

export default RadarPage;