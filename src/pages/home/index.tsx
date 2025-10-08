import React, { useState } from "react";
import WidgetGrid from "../../components/home/WidgetGrid";
import { UndoOutlined } from '@ant-design/icons';

const allWidgets = [
  { key: 'projetos', title: 'Projetos', type: 'projetos' },
  { key: 'calendario', title: 'Calendário', type: 'calendario' },
  { key: 'bloco', title: 'Bloco de Notas', type: 'bloco' },
  { key: 'linha', title: 'Linha do Tempo', type: 'linha' },
  { key: 'log', title: 'Log de atividades', type: 'log' },
  { key: 'eventos', title: 'Quadro de eventos', type: 'eventos' },
  { key: 'humor', title: 'Humor', type: 'humor' },
];

// Updated default layout based on your preferred configuration
const defaultLayout = {
  lg: [
    { i: "linha", x: 0, y: 26, w: 9, h: 5, minW: 3, minH: 3 },
    { i: "log", x: 9, y: 4, w: 3, h: 9, minW: 3, minH: 3 },
    { i: "eventos", x: 9, y: 13, w: 3, h: 7, minW: 3, minH: 3 },
    { i: "humor", x: 7, y: 4, w: 3, h: 3, minW: 3, minH: 3 },
    { i: "projetos", x: 0, y: 4, w: 7, h: 3, minW: 3, minH: 3 },
    { i: "bloco", x: 7, y: 8, w: 3, h: 10, minW: 3, minH: 3 },
    { i: "calendario", x: 0, y: 8, w: 7, h: 9, minW: 3, minH: 3 }
  ],
  md: [
    { i: "linha", x: 0, y: 29, w: 10, h: 3, minW: 3, minH: 3 },
    { i: "log", x: 7, y: 4, w: 3, h: 9, minW: 3, minH: 3 },
    { i: "eventos", x: 7, y: 13, w: 3, h: 7, minW: 3, minH: 3 },
    { i: "humor", x: 5, y: 4, w: 2, h: 3, minW: 3, minH: 3 },
    { i: "projetos", x: 0, y: 4, w: 5, h: 3, minW: 3, minH: 3 },
    { i: "bloco", x: 5, y: 8, w: 2, h: 10, minW: 3, minH: 3 },
    { i: "calendario", x: 0, y: 8, w: 5, h: 9, minW: 3, minH: 3 }
  ],
  sm: [
    { i: "linha", x: 0, y: 17, w: 6, h: 3, minW: 3, minH: 3 },
    { i: "log", x: 3, y: 4, w: 3, h: 6, minW: 3, minH: 3 },
    { i: "eventos", x: 3, y: 10, w: 3, h: 4, minW: 3, minH: 3 },
    { i: "humor", x: 0, y: 14, w: 3, h: 3, minW: 3, minH: 3 },
    { i: "projetos", x: 0, y: 4, w: 3, h: 3, minW: 3, minH: 3 },
    { i: "bloco", x: 3, y: 14, w: 3, h: 3, minW: 3, minH: 3 },
    { i: "calendario", x: 0, y: 7, w: 3, h: 7, minW: 3, minH: 3 }
  ],
  xs: [
    { i: "linha", x: 0, y: 17, w: 4, h: 3, minW: 3, minH: 3 },
    { i: "log", x: 2, y: 4, w: 2, h: 6, minW: 3, minH: 3 },
    { i: "eventos", x: 2, y: 10, w: 2, h: 4, minW: 3, minH: 3 },
    { i: "humor", x: 0, y: 14, w: 2, h: 3, minW: 3, minH: 3 },
    { i: "projetos", x: 0, y: 4, w: 2, h: 3, minW: 3, minH: 3 },
    { i: "bloco", x: 2, y: 14, w: 2, h: 3, minW: 3, minH: 3 },
    { i: "calendario", x: 0, y: 7, w: 2, h: 7, minW: 3, minH: 3 }
  ],
  xxs: [
    { i: "linha", x: 0, y: 17, w: 2, h: 3, minW: 3, minH: 3 },
    { i: "log", x: 0, y: 20, w: 2, h: 6, minW: 3, minH: 3 },
    { i: "eventos", x: 0, y: 26, w: 2, h: 4, minW: 3, minH: 3 },
    { i: "humor", x: 0, y: 14, w: 2, h: 3, minW: 3, minH: 3 },
    { i: "projetos", x: 0, y: 4, w: 2, h: 3, minW: 3, minH: 3 },
    { i: "bloco", x: 0, y: 11, w: 2, h: 3, minW: 3, minH: 3 },
    { i: "calendario", x: 0, y: 7, w: 2, h: 4, minW: 3, minH: 3 }
  ]
};

const defaultKeys = ["linha","log","eventos","humor","projetos","bloco","calendario"];

const HomePage: React.FC = () => {
  const [selectedKeys] = useState<string[]>(defaultKeys);

  return (
    <div className="flex flex-col h-full min-h-0 relative">
      <div className="flex-1 min-h-0 sm:pl-20 lg:pl-20 pr-5 pt-3 pb-6">
        <WidgetGrid 
          selectedKeys={selectedKeys} 
          allWidgets={allWidgets} 
          defaultLayout={defaultLayout}
        />
      </div>
      
      {/* Floating Undo Button */}
      <button 
        className="fixed bottom-8 right-8 w-14 h-14 bg-white/20 hover:bg-white/60 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out shadow-lg backdrop-blur-sm z-50"
        title="Undo Last Action"
        onClick={() => {}}
      >
        <UndoOutlined 
          style={{ fontSize: '24px', color: 'white' }} 
        />
      </button>
    </div>
  );
}

export default HomePage;