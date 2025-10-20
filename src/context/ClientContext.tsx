import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Cliente } from '../types/cliente';

interface ClientContextType {
  selectedClient: Cliente | null;
  setSelectedClient: (client: Cliente | null) => void;
  clearSelectedClient: () => void;
  isClientSelected: boolean;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

interface ClientProviderProps {
  children: ReactNode;
}

export const ClientProvider: React.FC<ClientProviderProps> = ({ children }) => {
  const [selectedClient, setSelectedClientState] = useState<Cliente | null>(null);

  // Load selected client from localStorage on mount
  useEffect(() => {
    const savedClient = localStorage.getItem('selectedClient');
    if (savedClient) {
      try {
        const client = JSON.parse(savedClient);
        setSelectedClientState(client);
      } catch (error) {
        console.error('Failed to parse saved client from localStorage:', error);
        localStorage.removeItem('selectedClient');
      }
    }
  }, []);

  // Save selected client to localStorage whenever it changes
  useEffect(() => {
    if (selectedClient) {
      localStorage.setItem('selectedClient', JSON.stringify(selectedClient));
    } else {
      localStorage.removeItem('selectedClient');
    }
  }, [selectedClient]);

  const setSelectedClient = (client: Cliente | null) => {
    setSelectedClientState(client);
  };

  const clearSelectedClient = () => {
    setSelectedClientState(null);
  };

  const isClientSelected = selectedClient !== null;

  const contextValue: ClientContextType = {
    selectedClient,
    setSelectedClient,
    clearSelectedClient,
    isClientSelected,
  };

  return (
    <ClientContext.Provider value={contextValue}>
      {children}
    </ClientContext.Provider>
  );
};

// Custom hook to use the client context
// eslint-disable-next-line react-refresh/only-export-components
export const useClient = (): ClientContextType => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
};

// Helper hook to check if a client is selected
// eslint-disable-next-line react-refresh/only-export-components
export const useClientRequired = (): Cliente => {
  const { selectedClient, isClientSelected } = useClient();
  
  if (!isClientSelected || !selectedClient) {
    throw new Error('A client must be selected to use this hook');
  }
  
  return selectedClient;
};

export default ClientContext;