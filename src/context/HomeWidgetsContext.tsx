import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type HomeWidgetKey = 'projetos' | 'listas_tarefas' | 'calendario' | 'servicos_recorrentes';

interface HomeWidgetOption {
  label: string;
  value: HomeWidgetKey;
}

interface HomeWidgetsContextType {
  selectedKeys: HomeWidgetKey[];
  setSelectedKeys: (keys: HomeWidgetKey[]) => void;
  restoreDefaultWidgets: () => void;
  widgetOptions: HomeWidgetOption[];
}

const WIDGET_SELECTOR_STORAGE_KEY = 'home_selected_widgets_v1';
const DEFAULT_WIDGET_KEYS: HomeWidgetKey[] = [
  'projetos',
  'servicos_recorrentes',
  'listas_tarefas',
  'calendario',
];
const ALLOWED_KEYS = new Set<HomeWidgetKey>(DEFAULT_WIDGET_KEYS);

const WIDGET_OPTIONS: HomeWidgetOption[] = [
  { label: 'Projetos', value: 'projetos' },
  { label: 'Serviços Recorrentes', value: 'servicos_recorrentes' },
  { label: 'Listas de Tarefas', value: 'listas_tarefas' },
  { label: 'Calendário', value: 'calendario' },
];

const isHomeWidgetKey = (value: string): value is HomeWidgetKey => {
  return ALLOWED_KEYS.has(value as HomeWidgetKey);
};

export const normalizeHomeWidgetKeys = (keys: unknown): HomeWidgetKey[] => {
  if (!Array.isArray(keys)) {
    return [];
  }

  return keys
    .filter((key): key is string => typeof key === 'string')
    .filter(isHomeWidgetKey)
    .filter((key, index, array) => array.indexOf(key) === index);
};

const HomeWidgetsContext = createContext<HomeWidgetsContextType | undefined>(undefined);

export const HomeWidgetsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedKeys, setSelectedKeysState] = useState<HomeWidgetKey[]>(() => {
    try {
      const stored = localStorage.getItem(WIDGET_SELECTOR_STORAGE_KEY);
      if (!stored) {
        return DEFAULT_WIDGET_KEYS;
      }

      const parsed = normalizeHomeWidgetKeys(JSON.parse(stored));
      if (!parsed.length) {
        return DEFAULT_WIDGET_KEYS;
      }

      if (!parsed.includes('servicos_recorrentes')) {
        return [...parsed, 'servicos_recorrentes'];
      }

      return parsed;
    } catch (error) {
      console.warn('Falha ao carregar widgets selecionados:', error);
      return DEFAULT_WIDGET_KEYS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(WIDGET_SELECTOR_STORAGE_KEY, JSON.stringify(selectedKeys));
    } catch (error) {
      console.warn('Falha ao salvar widgets selecionados:', error);
    }
  }, [selectedKeys]);

  const setSelectedKeys = (keys: HomeWidgetKey[]) => {
    const normalized = normalizeHomeWidgetKeys(keys);
    setSelectedKeysState(normalized.length ? normalized : DEFAULT_WIDGET_KEYS);
  };

  const restoreDefaultWidgets = () => {
    setSelectedKeysState(DEFAULT_WIDGET_KEYS);
  };

  const value = useMemo(
    () => ({
      selectedKeys,
      setSelectedKeys,
      restoreDefaultWidgets,
      widgetOptions: WIDGET_OPTIONS,
    }),
    [selectedKeys]
  );

  return <HomeWidgetsContext.Provider value={value}>{children}</HomeWidgetsContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHomeWidgets = () => {
  const context = useContext(HomeWidgetsContext);
  if (!context) {
    throw new Error('useHomeWidgets must be used within HomeWidgetsProvider');
  }
  return context;
};
