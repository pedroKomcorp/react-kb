import React, { useRef, useState } from 'react';
import { Rnd } from 'react-rnd';
import Widget from './Widget';
import ProjetosWidget from './widgets/ProjetosWidget';
import CalendarioWidget from './widgets/CalendarioWidget';
import BlocoNotasWidget from './widgets/BlocoNotasWidget';
import LinhaTempoWidget from './widgets/LinhaTempoWidget';
import LogWidget from './widgets/LogWidget';
import EventosWidget from './widgets/EventosWidget';
import HumorWidget from './widgets/HumorWidget';


interface WidgetType {
  key: string;
  title: string;
  type: string;
}

interface WidgetGridProps {
  selectedKeys: string[];
  allWidgets: WidgetType[];
}

const WidgetGrid: React.FC<WidgetGridProps> = ({ selectedKeys, allWidgets }) => {
  // Only show up to 3 widgets at a time, scroll for more
  const widgets: WidgetType[] = allWidgets.filter((w: WidgetType) => selectedKeys.includes(w.key));
  
  

  // Header is 60px, so offset grid container
  // Minimal drag/resize: absolute positioning, initial positions, and sizes
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number; width: number; height: number }>>(() => {
    const saved = localStorage.getItem('widget-positions');
    if (saved) return JSON.parse(saved);
    return widgets.reduce((acc, w, i) => {
      acc[w.key] = {
        x: 40 + (i % 3) * 340,
        y: 40 + Math.floor(i / 3) * 340,
        width: 320,
        height: 260,
      };
      return acc;
    }, {} as Record<string, { x: number; y: number; width: number; height: number }>);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragStop = (key: string, _e: any, d: { x: number; y: number }) => {
    setPositions(pos => {
      const updated = { ...pos, [key]: { ...pos[key], x: d.x, y: d.y } };
      localStorage.setItem('widget-positions', JSON.stringify(updated));
      return updated;
    });
  };
  const handleResizeStop = (
    key: string,
    _e: unknown,
    _dir: unknown,
    ref: HTMLElement,
    _delta: { width: number; height: number },
    pos: { x: number; y: number }
  ) => {
    setPositions(p => {
      const updated = {
        ...p,
        [key]: {
          ...p[key],
          width: parseInt(ref.style.width, 10),
          height: parseInt(ref.style.height, 10),
          x: pos.x,
          y: pos.y
        }
      };
      localStorage.setItem('widget-positions', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div ref={containerRef} className="flex-1 h-[calc(100vh-60px)] mt-[60px] overflow-auto relative px-6" style={{ position: 'relative' }}>
      {widgets.map((widget: WidgetType) => (
        <Rnd
          key={widget.key}
          size={{ width: positions[widget.key]?.width || 320, height: positions[widget.key]?.height || 260 }}
          position={{ x: positions[widget.key]?.x || 40, y: positions[widget.key]?.y || 40 }}
          minWidth={220}
          minHeight={120}
          bounds="parent"
          dragHandleClassName="widget-drag-handle"
          onDragStop={(e, d) => handleDragStop(widget.key, e, d)}
          onResizeStop={(e, dir, ref, delta, pos) => handleResizeStop(widget.key, e, dir, ref, delta, pos)}
          enableResizing={{
            bottomRight: true,
            bottom: false,
            right: false,
            top: false,
            left: false,
            topLeft: false,
            topRight: false,
            bottomLeft: false
          }}
          style={{ zIndex: 1 }}
        >
          <Widget title={widget.title}>
            {widget.type === 'projetos' && <ProjetosWidget />}
            {widget.type === 'calendario' && <CalendarioWidget />}
            {widget.type === 'bloco' && <BlocoNotasWidget />}
            {widget.type === 'linha' && <LinhaTempoWidget />}
            {widget.type === 'log' && <LogWidget />}
            {widget.type === 'eventos' && <EventosWidget />}
            {widget.type === 'humor' && <HumorWidget />}
          </Widget>
        </Rnd>
      ))}
    </div>
  );
};

export default WidgetGrid;
