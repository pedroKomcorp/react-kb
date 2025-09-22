import React, { useRef, useState, useEffect } from 'react';

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
  defaultPositions?: Record<string, { x: number; y: number; width: number; height: number }>;
}

const WidgetGrid: React.FC<WidgetGridProps> = ({ selectedKeys, allWidgets, defaultPositions }) => {
  const widgets: WidgetType[] = allWidgets.filter((w: WidgetType) => selectedKeys.includes(w.key));
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions] = useState<Record<string, { x: number; y: number; width: number; height: number }>>(() => {
    return defaultPositions || {};
  });

  const [containerSize, setContainerSize] = useState<{width: number, height: number}>({width: 0, height: 0});
  const base = Object.values(positions).reduce((acc, pos) => ({
    maxX: Math.max(acc.maxX, pos.x + pos.width),
    maxY: Math.max(acc.maxY, pos.y + pos.height)
  }), { maxX: 0, maxY: 0 });
  useEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight || window.innerHeight - (containerRef.current.getBoundingClientRect().top)
        });
      }
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Customization disabled: no drag/resize handlers

  // Responsive breakpoints
  let layoutType: 'desktop' | 'tablet' | 'mobile' = 'desktop';
  if (containerSize.width < 800) layoutType = 'mobile';
  else if (containerSize.width < 1200) layoutType = 'tablet';

  // Layout arrangements for each breakpoint
  let arrangedWidgets: React.ReactNode = null;
  if (layoutType === 'desktop') {
    // Original absolute layout, scaled
  arrangedWidgets = widgets.map((widget: WidgetType) => {
      const pos = positions[widget.key] || { x: 40, y: 40, width: 320, height: 260 };
      const scaleX = base.maxX > 0 && containerSize.width > 0 ? containerSize.width / base.maxX : 1;
      const scaleY = base.maxY > 0 && containerSize.height > 0 ? containerSize.height / base.maxY : 1;
      const scale = Math.min(scaleX, scaleY);
      const width = Math.round(pos.width * scale);
      const height = Math.round(pos.height * scale);
      const x = Math.round(pos.x * scale);
      const y = Math.round(pos.y * scale);
      return (
        <div
          key={widget.key}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width,
            height,
            zIndex: 1,
          }}
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
        </div>
      );
    });
  } else if (layoutType === 'tablet') {
    // 2-column grid
    arrangedWidgets = (
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 16,
        position: 'relative',
        width: '100%',
        height: '100%',
        padding: 8,
      }}>
        {widgets.map((widget: WidgetType) => (
          <div key={widget.key} style={{ minWidth: 0, minHeight: 0 }}>
            <Widget title={widget.title}>
              {widget.type === 'projetos' && <ProjetosWidget />}
              {widget.type === 'calendario' && <CalendarioWidget />}
              {widget.type === 'bloco' && <BlocoNotasWidget />}
              {widget.type === 'linha' && <LinhaTempoWidget />}
              {widget.type === 'log' && <LogWidget />}
              {widget.type === 'eventos' && <EventosWidget />}
              {widget.type === 'humor' && <HumorWidget />}
            </Widget>
          </div>
        ))}
      </div>
    );
  } else {
    // Mobile: single column, stacked
    arrangedWidgets = (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: '100%',
        height: '100%',
        padding: 4,
      }}>
        {widgets.map((widget: WidgetType) => (
          <div key={widget.key} style={{ minWidth: 0, minHeight: 0 }}>
            <Widget title={widget.title}>
              {widget.type === 'projetos' && <ProjetosWidget />}
              {widget.type === 'calendario' && <CalendarioWidget />}
              {widget.type === 'bloco' && <BlocoNotasWidget />}
              {widget.type === 'linha' && <LinhaTempoWidget />}
              {widget.type === 'log' && <LogWidget />}
              {widget.type === 'eventos' && <EventosWidget />}
              {widget.type === 'humor' && <HumorWidget />}
            </Widget>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-[calc(100vh-60px)] mt-[60px] overflow-hidden relative p-0 m-0"
      style={{ minHeight: 0 }}
    >
      {arrangedWidgets}
    </div>
  );
};

export default WidgetGrid;
