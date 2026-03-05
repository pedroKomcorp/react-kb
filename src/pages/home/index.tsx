import React from 'react';
import WidgetGrid from '../../components/home/WidgetGrid';
import type { HomeWidgetKey } from '../../context/HomeWidgetsContext';
import { useHomeWidgets } from '../../context/HomeWidgetsContext';

interface HomeWidgetConfig {
  key: HomeWidgetKey;
  title: string;
  type: HomeWidgetKey;
}

const allWidgets: HomeWidgetConfig[] = [
  { key: 'projetos', title: 'Projetos', type: 'projetos' },
  { key: 'servicos_recorrentes', title: 'Serviços Recorrentes', type: 'servicos_recorrentes' },
  { key: 'listas_tarefas', title: 'Listas de Tarefas', type: 'listas_tarefas' },
  { key: 'calendario', title: 'Calendário', type: 'calendario' },
];

const defaultLayout = {
  lg: [
    { i: 'projetos', x: 0, y: 0, w: 6, h: 7, minW: 3, minH: 3 },
    { i: 'servicos_recorrentes', x: 6, y: 0, w: 6, h: 7, minW: 3, minH: 3 },
    { i: 'listas_tarefas', x: 0, y: 7, w: 6, h: 7, minW: 3, minH: 3 },
    { i: 'calendario', x: 6, y: 7, w: 6, h: 8, minW: 3, minH: 3 },
  ],
  md: [
    { i: 'projetos', x: 0, y: 0, w: 5, h: 6, minW: 3, minH: 3 },
    { i: 'servicos_recorrentes', x: 5, y: 0, w: 5, h: 6, minW: 3, minH: 3 },
    { i: 'listas_tarefas', x: 0, y: 6, w: 5, h: 6, minW: 3, minH: 3 },
    { i: 'calendario', x: 5, y: 6, w: 5, h: 8, minW: 3, minH: 3 },
  ],
  sm: [
    { i: 'projetos', x: 0, y: 0, w: 3, h: 6, minW: 3, minH: 3 },
    { i: 'servicos_recorrentes', x: 3, y: 0, w: 3, h: 6, minW: 3, minH: 3 },
    { i: 'listas_tarefas', x: 0, y: 6, w: 3, h: 6, minW: 3, minH: 3 },
    { i: 'calendario', x: 3, y: 6, w: 3, h: 8, minW: 3, minH: 3 },
  ],
  xs: [
    { i: 'projetos', x: 0, y: 0, w: 2, h: 6, minW: 2, minH: 3 },
    { i: 'servicos_recorrentes', x: 2, y: 0, w: 2, h: 6, minW: 2, minH: 3 },
    { i: 'listas_tarefas', x: 0, y: 6, w: 2, h: 6, minW: 2, minH: 3 },
    { i: 'calendario', x: 2, y: 6, w: 2, h: 8, minW: 2, minH: 3 },
  ],
  xxs: [
    { i: 'projetos', x: 0, y: 0, w: 2, h: 4, minW: 2, minH: 3 },
    { i: 'servicos_recorrentes', x: 0, y: 4, w: 2, h: 4, minW: 2, minH: 3 },
    { i: 'listas_tarefas', x: 0, y: 8, w: 2, h: 5, minW: 2, minH: 3 },
    { i: 'calendario', x: 0, y: 13, w: 2, h: 8, minW: 2, minH: 3 },
  ],
};

const HomePage: React.FC = () => {
  const { selectedKeys } = useHomeWidgets();

  return (
    <div className="flex flex-col h-full min-h-0 relative">
      <div className="flex-1 min-h-0 sm:pl-20 lg:pl-20 pr-5 pt-3 pb-6">
        <WidgetGrid
          selectedKeys={selectedKeys}
          allWidgets={allWidgets}
          defaultLayout={defaultLayout}
        />
      </div>
    </div>
  );
};

export default HomePage;
