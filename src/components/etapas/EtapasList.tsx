import React from 'react';
import { List, Card } from 'antd';
import type { Etapa } from '../../types/etapa';

interface EtapasListProps {
  etapas: (Etapa & { projetoNome: string; projetoId: number })[];
  loading: boolean;
  onSelectEtapa: (etapa: Etapa & { projetoNome: string; projetoId: number }) => void;
  onDeleteEtapa: (etapaId: number) => void;
}

import EtapaCard from './EtapaCard';

const EtapasList: React.FC<EtapasListProps> = ({ etapas, loading, onSelectEtapa, onDeleteEtapa }) => (
  <Card title="Etapas" className="w-full rounded-lg shadow bg-white" style={{ width: '100%' }}>
    <List
      className="w-full"
      style={{ width: '100%' }}
      split={false}
      dataSource={etapas}
      loading={loading}
      locale={{ emptyText: 'Nenhuma etapa cadastrada.' }}
      renderItem={(etapa, index) => (
        <div key={etapa.id} className={index > 0 ? 'mt-6' : ''}>
          <EtapaCard etapa={etapa} onClick={() => onSelectEtapa(etapa)} onDeleteEtapa={onDeleteEtapa} />
        </div>
      )}
    />
  </Card>
);

export default EtapasList;
