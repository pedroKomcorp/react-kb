/**
 * Check if tem_atualizacao_selic is enabled (handles different data types from API)
 */
export const isSelicEnabled = (value: unknown): boolean => {
  return value === true || value === 'true' || value === 1 || value === '1';
};

/**
 * Format a number value as Brazilian Real currency
 * @param value - The numeric value to format
 * @returns Formatted currency string (e.g., "R$ 1.234,56")
 */
export const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return 'R$ 0,00';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Handle API errors with specific messages
 */
export const handleApiError = (error: unknown, defaultMessage: string): string => {
  console.error('=== API Error ===');
  console.error('Full error object:', error);
  
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { 
      response?: { 
        data?: { detail?: string; message?: string }; 
        status?: number 
      } 
    };
    
    console.error('Response status:', axiosError.response?.status);
    console.error('Response data:', axiosError.response?.data);
    
    const errorDetail = axiosError.response?.data?.detail || axiosError.response?.data?.message;
    console.error('Error detail:', errorDetail);
    
    if (errorDetail === "Operação resultaria em saldo negativo") {
      return '❌ Operação não permitida: A movimentação resultaria em saldo negativo. Verifique o valor informado.';
    }
    
    if (errorDetail && typeof errorDetail === 'string') {
      return `❌ Erro: ${errorDetail}`;
    }
    
    return `❌ ${defaultMessage}`;
  }
  
  console.error('Non-axios error:', error);
  return '❌ Erro de comunicação. Verifique sua conexão.';
};
