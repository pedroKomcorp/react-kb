import React, { useState, useCallback, useEffect, Suspense, lazy, useMemo } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import Widget from './Widget';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './responsive-widgets.css';
import './widget-grid.css';

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const BREAKPOINTS = ['lg', 'md', 'sm', 'xs', 'xxs'] as const;
type Breakpoint = typeof BREAKPOINTS[number];
type LayoutMap = Record<Breakpoint, Layout[]>;
type DynamicLayoutMap = { [key: string]: Layout[] };

const widgetComponents: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  projetos: lazy(() => import('./widgets/ProjetosWidget')),
  servicos_recorrentes: lazy(() => import('./widgets/ServicosRecorrentesWidget')),
  calendario: lazy(() => import('./widgets/CalendarioWidget')),
  listas_tarefas: lazy(() => import('./widgets/ListasTarefasWidget')),
  bloco: lazy(() => import('./widgets/BlocoNotasWidget')),
  linha: lazy(() => import('./widgets/LinhaTempoWidget')),
  log: lazy(() => import('./widgets/LogWidget')),
  eventos: lazy(() => import('./widgets/EventosWidget')),
  humor: lazy(() => import('./widgets/HumorWidget')),
};

const widgetFallback = (
  <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
    Carregando...
  </div>
);

// Constants for localStorage
const LAYOUT_STORAGE_KEY = 'widgetGrid_layouts_v3';

// Helper functions for localStorage
const saveLayoutToStorage = (layouts: DynamicLayoutMap) => {
  try {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layouts));
  } catch (error) {
    console.warn('Failed to save layout to localStorage:', error);
  }
};

const loadLayoutFromStorage = (): DynamicLayoutMap | null => {
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
  defaultLayout?: DynamicLayoutMap;
}

// Generate a basic layout for given widget keys
const generateDefaultLayoutForKeys = (keys: string[]): Layout[] => {
  return keys.map((key, index) => ({
    i: key,
    x: (index % 4) * 3, // 4 columns, each taking 3 grid units
    y: Math.floor(index / 4) * 4,
    w: 3,
    h: 4,
    minW: 3,
    minH: 3,
  }));
};

// Default layouts for all breakpoints
const DEFAULT_LAYOUTS: { [key: string]: Layout[] } = {
  lg: [
    { i: 'projetos', x: 0, y: 4, w: 4, h: 7, minW: 3, minH: 3 },
    { i: 'servicos_recorrentes', x: 4, y: 4, w: 4, h: 7, minW: 3, minH: 3 },
    { i: 'listas_tarefas', x: 8, y: 4, w: 4, h: 7, minW: 3, minH: 3 },
    { i: 'calendario', x: 0, y: 11, w: 12, h: 8, minW: 3, minH: 3 },
  ],
  md: [
    { i: 'projetos', x: 0, y: 4, w: 3, h: 6, minW: 3, minH: 3 },
    { i: 'servicos_recorrentes', x: 3, y: 4, w: 3, h: 6, minW: 3, minH: 3 },
    { i: 'listas_tarefas', x: 6, y: 4, w: 4, h: 6, minW: 3, minH: 3 },
    { i: 'calendario', x: 0, y: 10, w: 10, h: 8, minW: 3, minH: 3 },
  ],
  sm: [
    { i: 'projetos', x: 0, y: 4, w: 2, h: 6, minW: 2, minH: 3 },
    { i: 'servicos_recorrentes', x: 2, y: 4, w: 2, h: 6, minW: 2, minH: 3 },
    { i: 'listas_tarefas', x: 4, y: 4, w: 2, h: 6, minW: 2, minH: 3 },
    { i: 'calendario', x: 0, y: 10, w: 6, h: 8, minW: 3, minH: 3 },
  ],
  xs: [
    { i: 'projetos', x: 0, y: 4, w: 2, h: 6, minW: 2, minH: 3 },
    { i: 'servicos_recorrentes', x: 2, y: 4, w: 2, h: 6, minW: 2, minH: 3 },
    { i: 'listas_tarefas', x: 0, y: 10, w: 2, h: 6, minW: 2, minH: 3 },
    { i: 'calendario', x: 2, y: 10, w: 2, h: 8, minW: 2, minH: 3 },
  ],
  xxs: [
    { i: 'projetos', x: 0, y: 4, w: 2, h: 4, minW: 2, minH: 3 },
    { i: 'servicos_recorrentes', x: 0, y: 8, w: 2, h: 5, minW: 2, minH: 3 },
    { i: 'listas_tarefas', x: 0, y: 13, w: 2, h: 5, minW: 2, minH: 3 },
    { i: 'calendario', x: 0, y: 18, w: 2, h: 8, minW: 2, minH: 3 },
  ],
};

const createEmptyLayouts = (): LayoutMap => ({
  lg: [],
  md: [],
  sm: [],
  xs: [],
  xxs: [],
});

const normalizeLayoutArray = (layout?: Layout[]): Layout[] => {
  if (!Array.isArray(layout)) {
    return [];
  }

  const unique = new Set<string>();
  const normalized: Layout[] = [];

  for (const item of layout) {
    if (!item || typeof item.i !== 'string' || unique.has(item.i)) {
      continue;
    }
    unique.add(item.i);
    normalized.push({ ...item });
  }

  return normalized;
};

const normalizeLayoutMap = (layouts?: DynamicLayoutMap): LayoutMap => {
  const normalized = createEmptyLayouts();

  for (const breakpoint of BREAKPOINTS) {
    normalized[breakpoint] = normalizeLayoutArray(layouts?.[breakpoint]);
  }

  return normalized;
};

const ensureSelectedLayouts = (
  breakpoint: Breakpoint,
  selectedKeys: string[],
  currentLayouts: LayoutMap,
  defaultLayouts: LayoutMap
): Layout[] => {
  const selectedSet = new Set(selectedKeys);
  const existingVisible = currentLayouts[breakpoint].filter((item) => selectedSet.has(item.i));
  const byKey = new Map(existingVisible.map((item) => [item.i, item]));
  const defaults = defaultLayouts[breakpoint];
  const generated = generateDefaultLayoutForKeys(selectedKeys);

  const safeFallback = (key: string, index: number): Layout => ({
    i: key,
    x: index % 2 === 0 ? 0 : 3,
    y: Math.floor(index / 2) * 4,
    w: 3,
    h: 4,
    minW: 2,
    minH: 3,
  });

  return selectedKeys.map((key, index) => {
    const fromCurrent = byKey.get(key);
    if (fromCurrent) {
      return fromCurrent;
    }

    const fromDefault = defaults.find((item) => item.i === key);
    if (fromDefault) {
      return { ...fromDefault };
    }

    const fromGenerated = generated.find((item) => item.i === key);
    if (fromGenerated) {
      return { ...fromGenerated };
    }

    return safeFallback(key, index);
  });
};

const mergeLayoutsWithHidden = (
  previous: LayoutMap,
  incoming: DynamicLayoutMap,
  selectedKeys: string[]
): LayoutMap => {
  const selectedSet = new Set(selectedKeys);
  const merged = createEmptyLayouts();

  for (const breakpoint of BREAKPOINTS) {
    const previousLayout = normalizeLayoutArray(previous[breakpoint]);
    const hiddenItems = previousLayout.filter((item) => !selectedSet.has(item.i));
    const incomingVisible = normalizeLayoutArray(incoming[breakpoint]);
    merged[breakpoint] = [...hiddenItems, ...incomingVisible];
  }

  return merged;
};

const renderWidget = (widgetType: string, title: string) => {
  const WidgetComponent = widgetComponents[widgetType];
  if (!WidgetComponent) {
    return <div>Widget não encontrado</div>;
  }

  return (
    <Widget title={title}>
      <Suspense fallback={widgetFallback}>
        <WidgetComponent />
      </Suspense>
    </Widget>
  );
};

const WidgetGrid: React.FC<WidgetGridProps> = ({
  selectedKeys,
  allWidgets,
  defaultLayout: providedDefaultLayout,
}) => {
  const [layouts, setLayouts] = useState<LayoutMap>(createEmptyLayouts);
  const [isInitialized, setIsInitialized] = useState(false);

  const defaultLayouts = useMemo(
    () => normalizeLayoutMap(providedDefaultLayout || DEFAULT_LAYOUTS),
    [providedDefaultLayout]
  );

  // Load saved layouts on component mount and fallback to defaults.
  useEffect(() => {
    const savedLayouts = loadLayoutFromStorage();
    const initialLayouts =
      savedLayouts && Object.keys(savedLayouts).length > 0
        ? normalizeLayoutMap(savedLayouts)
        : defaultLayouts;

    setLayouts(initialLayouts);
    setIsInitialized(true);
  }, [defaultLayouts]);

  const visibleLayouts = useMemo(() => {
    const sourceLayouts = isInitialized ? layouts : defaultLayouts;
    const resolvedLayouts = createEmptyLayouts();

    for (const breakpoint of BREAKPOINTS) {
      resolvedLayouts[breakpoint] = ensureSelectedLayouts(
        breakpoint,
        selectedKeys,
        sourceLayouts,
        defaultLayouts
      );
    }

    return resolvedLayouts;
  }, [defaultLayouts, isInitialized, layouts, selectedKeys]);

  const onLayoutChange = useCallback(
    (_currentLayout: Layout[], allLayouts: DynamicLayoutMap) => {
      setLayouts((previous) => {
        const merged = mergeLayoutsWithHidden(previous, allLayouts, selectedKeys);
        saveLayoutToStorage(merged);
        return merged;
      });
    },
    [selectedKeys]
  );

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
          layouts={visibleLayouts}
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
            if (newItem.y < 0) {
              newItem.y = 0;
              placeholder.y = 0;
            }
          }}
          onResize={(_layout, _oldItem, newItem, placeholder) => {
            if (newItem.y < 0) {
              newItem.y = 0;
              placeholder.y = 0;
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
