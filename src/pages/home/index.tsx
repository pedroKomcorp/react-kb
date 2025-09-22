import Header from "../../components/Header";
import React from "react";
import WidgetGrid from "../../components/home/WidgetGrid";


const allWidgets = [
  { key: 'projetos', title: 'Projetos', type: 'projetos' },
  { key: 'calendario', title: 'Calendário', type: 'calendario' },
  { key: 'bloco', title: 'Bloco de Notas', type: 'bloco' },
  { key: 'linha', title: 'Linha do Tempo', type: 'linha' },
  { key: 'log', title: 'Log de atividades', type: 'log' },
  { key: 'eventos', title: 'Quadro de eventos', type: 'eventos' },
  { key: 'humor', title: 'Humor', type: 'humor' },
];

const defaultPositions = {
  projetos: { x: 10, y: 10, width: 865, height: 130 },
  humor: { x: 885, y: 10, width: 310, height: 120 },
  calendario: { x: 10, y: 150, width: 865, height: 370 },
  bloco: { x: 885, y: 140, width: 310, height: 380 },
  linha: { x: 10, y: 530, width: 1185, height: 120 },
  log: { x: 1205, y: 10, width: 235, height: 340 },
  eventos: { x: 1205, y: 360, width: 235, height: 290 },
};
const defaultKeys = ["linha","log","eventos","humor","projetos","bloco","calendario"];

const HomePage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Header userName="Teste" />
      <div className="pl-12 pr-6 pt-3 flex-1 min-h-0 flex flex-col">
        <WidgetGrid selectedKeys={defaultKeys} allWidgets={allWidgets} defaultPositions={defaultPositions} />
      </div>
    </div>
  );
}

export default HomePage;