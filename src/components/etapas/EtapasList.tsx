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
      dataSource={etapas}
      loading={loading}
      locale={{ emptyText: 'Nenhuma etapa cadastrada.' }}
      renderItem={etapa => (
        <EtapaCard etapa={etapa} onClick={() => onSelectEtapa(etapa)} onDeleteEtapa={onDeleteEtapa} />
      )}
    />
  </Card>
);

export default EtapasList;
