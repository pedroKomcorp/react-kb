import React, { createContext, useContext, useState, useCallback } from 'react';

interface ErrorItem {
  id: string;
  message: string;
  timestamp: number;
}

interface ErrorContextType {
  errors: ErrorItem[];
  addError: (message: string) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
  isLocked: boolean;
  setAuthLocked: (locked: boolean) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const [isLocked, setIsLocked] = useState(false);

  const addError = useCallback((message: string) => {
    const id = `error-${Date.now()}-${Math.random()}`;
    const newError: ErrorItem = {
      id,
      message,
      timestamp: Date.now(),
    };

    setErrors(prev => [...prev, newError]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setErrors(prev => prev.filter(err => err.id !== id));
    }, 5000);
  }, []);

  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(err => err.id !== id));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const setAuthLocked = useCallback((locked: boolean) => {
    setIsLocked(locked);
  }, []);

  return (
    <ErrorContext.Provider value={{ errors, addError, removeError, clearErrors, isLocked, setAuthLocked }}>
      {children}
    </ErrorContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useError = () => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};
