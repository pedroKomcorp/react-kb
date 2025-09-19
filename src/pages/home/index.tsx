import React from "react";
import WidgetGrid from "../../components/home/WidgetGrid";
import Header from "../../components/Header";

const allWidgets = [
  { key: 'projetos', title: 'Projetos', type: 'projetos' },
  { key: 'calendario', title: 'Calendário', type: 'calendario' },
  { key: 'bloco', title: 'Bloco de Notas', type: 'bloco' },
  { key: 'linha', title: 'Linha do Tempo', type: 'linha' },
  { key: 'log', title: 'Log de atividades', type: 'log' },
  { key: 'eventos', title: 'Quadro de eventos', type: 'eventos' },
  { key: 'humor', title: 'Humor', type: 'humor' },
];


const HomePage: React.FC = () => {
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>(() => {
    const saved = localStorage.getItem('widget-selected-keys');
    if (saved) return JSON.parse(saved);
    return allWidgets.map(w => w.key);
  });

  React.useEffect(() => {
    localStorage.setItem('widget-selected-keys', JSON.stringify(selectedKeys));
  }, [selectedKeys]);

  const handleReset = () => {
    localStorage.removeItem('widget-positions');
    localStorage.removeItem('widget-selected-keys');
    setSelectedKeys(allWidgets.map(w => w.key));
    // Optionally, force WidgetGrid to re-mount by using a key
    setResetKey(prev => prev + 1);
  };

  const [resetKey, setResetKey] = React.useState(0);

  return (
    <div>
  <Header userName="Teste" allWidgets={allWidgets} selectedKeys={selectedKeys} setSelectedKeys={setSelectedKeys} onReset={handleReset} />
      <div className="mt-16 ml-12">
        <WidgetGrid key={resetKey} selectedKeys={selectedKeys} allWidgets={allWidgets} />
      </div>
    </div>
  );
}

export default HomePage