import React, { useState, useCallback, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import Widget from './Widget';

// Import widget components
import ProjetosWidget from './widgets/ProjetosWidget';
import CalendarioWidget from './widgets/CalendarioWidget';
import BlocoNotasWidget from './widgets/BlocoNotasWidget';
import LinhaTempoWidget from './widgets/LinhaTempoWidget';
import LogWidget from './widgets/LogWidget';
import EventosWidget from './widgets/EventosWidget';
import HumorWidget from './widgets/HumorWidget';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './responsive-widgets.css';
import './widget-grid.css';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

// Constants for localStorage
const LAYOUT_STORAGE_KEY = 'widgetGrid_layouts';

// Helper functions for localStorage
const saveLayoutToStorage = (layouts: { [key: string]: Layout[] }) => {
  try {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layouts));
  } catch (error) {
    console.warn('Failed to save layout to localStorage:', error);
  }
};

const loadLayoutFromStorage = (): { [key: string]: Layout[] } | null => {
  try {
    const stored = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (stored) {
      const layouts = JSON.parse(stored);
      return layouts;
    }
    return null;
  } catch (error) {
    console.warn('Failed to load layout from localStorage:', error);
    return null;
  }
};

const clearLayoutFromStorage = () => {
  try {
    localStorage.removeItem(LAYOUT_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear layout from localStorage:', error);
  }
};

// Make functions available globally for debugging
(globalThis as typeof globalThis & { 
  clearWidgetLayout: () => void;
  debugWidgetLayout: () => void;
}).clearWidgetLayout = clearLayoutFromStorage;

interface WidgetConfig {
  key: string;
  title: string;
  type: string;
}

interface WidgetGridProps {
  selectedKeys: string[];
  allWidgets: WidgetConfig[];
  defaultLayout?: { [key: string]: Layout[] };
}

// Generate a basic layout for given widget keys
const generateDefaultLayoutForKeys = (keys: string[]): Layout[] => {
  return keys.map((key, index) => ({
    i: key,
    x: (index % 4) * 3, // 4 columns, each taking 3 grid units
    y: Math.floor(index / 4) * 4 + 4, // Start at row 4 (below header), 4 rows apart
    w: 3,
    h: 4,
    minW: 3,
    minH: 3,
  }));
};

const renderWidget = (widgetType: string, title: string) => {
  const widgetContent = () => {
    switch (widgetType) {
      case 'projetos':
        return <ProjetosWidget />;
      case 'calendario':
        return <CalendarioWidget />;
      case 'bloco':
        return <BlocoNotasWidget />;
      case 'linha':
        return <LinhaTempoWidget />;
      case 'log':
        return <LogWidget />;
      case 'eventos':
        return <EventosWidget />;
      case 'humor':
        return <HumorWidget />;
      default:
        return <div>Widget não encontrado</div>;
    }
  };

  return (
    <Widget title={title}>
      {widgetContent()}
    </Widget>
  );
};

const WidgetGrid: React.FC<WidgetGridProps> = ({ selectedKeys, allWidgets, defaultLayout: providedDefaultLayout }) => {
  const [layouts, setLayouts] = useState<{ [key: string]: Layout[] }>({});
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Load saved layouts on component mount
  useEffect(() => {
    const savedLayouts = loadLayoutFromStorage();
    if (savedLayouts && Object.keys(savedLayouts).length > 0) {
      setLayouts(savedLayouts);
    } else {
      // Use provided defaultLayout or generate from basic grid
      const initialLayouts = providedDefaultLayout || {
        lg: generateDefaultLayoutForKeys(selectedKeys),
        md: generateDefaultLayoutForKeys(selectedKeys),
        sm: generateDefaultLayoutForKeys(selectedKeys),
        xs: generateDefaultLayoutForKeys(selectedKeys),
        xxs: generateDefaultLayoutForKeys(selectedKeys)
      };
      setLayouts(initialLayouts);
    }
    setIsInitialized(true);
  }, [selectedKeys, providedDefaultLayout]); // Re-run when selectedKeys or defaultLayout changes
  
  // Create default layout for fallback
  const fallbackLayout = generateDefaultLayoutForKeys(selectedKeys);
  
  // Use saved layout if available, otherwise use default layout
  const getLayout = (breakpoint: string): Layout[] => {
    if (!isInitialized) return fallbackLayout;
    return layouts[breakpoint] || fallbackLayout;
  };
  
  const onLayoutChange = useCallback((_currentLayout: Layout[], allLayouts: { [key: string]: Layout[] }) => {
    setLayouts(allLayouts);
    saveLayoutToStorage(allLayouts);
  }, []);

  // Responsive breakpoints
  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
  const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

  return (
    <div className="widget-grid-container">
      {!isInitialized ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading layout...</div>
      ) : (
        <ResponsiveReactGridLayout
          className="layout"
          layouts={{
            lg: getLayout('lg'),
            md: getLayout('md'),
            sm: getLayout('sm'),
            xs: getLayout('xs'),
            xxs: getLayout('xxs')
          }}
          breakpoints={breakpoints}
          cols={cols}
          rowHeight={40}
          onLayoutChange={onLayoutChange}
          isDraggable={true}
          isResizable={true}
          compactType="vertical"
          preventCollision={false}
          margin={[16, 16]}
          containerPadding={[0, 0]}
          useCSSTransforms={true}
          draggableHandle=".widget-title"
          allowOverlap={false}
          isBounded={true}
          verticalCompact={true}
          onDrag={(_layout, _oldItem, newItem, placeholder) => {
            if (newItem.y < 4) {
              newItem.y = 4;
              placeholder.y = 4;
            }
          }}
          onResize={(_layout, _oldItem, newItem, placeholder) => {
            if (newItem.y < 4) {
              newItem.y = 4;
              placeholder.y = 4;
            }
          }}
        >
          {selectedKeys.map((key) => {
            const widget = allWidgets.find(w => w.key === key);
            if (!widget) return null;
            
            return (
              <div key={key} className="widget-item">
                {renderWidget(widget.type, widget.title)}
              </div>
            );
          })}
        </ResponsiveReactGridLayout>
      )}
    </div>
  );
};

export default WidgetGrid;
