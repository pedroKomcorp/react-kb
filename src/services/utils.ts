// ========================================
// AUTHENTICATION UTILITIES
// ========================================

/**
 * Creates authentication headers with Bearer token
 */
export const authHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

/**
 * Gets auth headers from localStorage token (etapas.ts style)
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Gets authentication token with fallback to localStorage
 * Throws error if no token is found
 */
export const getAuthToken = (token?: string): string => {
  const authToken = token || localStorage.getItem('token');
  
  if (!authToken) {
    throw new Error('Token de autenticação não encontrado');
  }
  
  return authToken;
};

// ========================================
// DATA VALIDATION AND NORMALIZATION
// ========================================

/**
 * Safely converts value to string with fallback
 */
export const safeString = (value: unknown, fallback: string = ''): string => {
  if (value === null || value === undefined) return fallback;
  return String(value);
};

/**
 * Safely gets enum value with validation
 */
export const safeEnum = <T extends string>(value: unknown, validValues: T[], fallback: T): T => {
  if (value && typeof value === 'string' && validValues.includes(value as T)) {
    return value as T;
  }
  return fallback;
};

// ========================================
// FORMATTING UTILITIES
// ========================================

/**
 * Formats number as Brazilian currency
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Formats date string as Brazilian date format
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

/**
 * Formats date and time string as Brazilian format
 */
export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('pt-BR');
};

// ========================================
// STATUS AND COLOR UTILITIES
// ========================================

/**
 * Gets color for credito status
 */
export const getCreditoStatusColor = (status: string): string => {
  switch (status) {
    case 'habilitado': return 'green';
    case 'em_andamento': return 'blue';
    case 'aguardando_habilitacao': return 'orange';
    case 'parcialmente_compensado': return 'yellow';
    case 'compensado': return 'gray';
    case 'indeferido': return 'red';
    case 'ATIVO': return 'green';
    case 'QUITADO': return 'blue';
    case 'CANCELADO': return 'red';
    default: return 'gray';
  }
};

/**
 * Gets color for movimentacao type
 */
export const getTipoMovimentacaoColor = (tipo: string): string => {
  switch (tipo) {
    case 'COMPENSACAO': return 'red';
    case 'ATUALIZACAO_SELIC': return 'orange';
    case 'CALCULO_MENSAL': return 'yellow';
    case 'DESCONTO': return 'green';
    case 'AJUSTE_MANUAL': return 'purple';
    default: return 'default';
  }
};

/**
 * Gets friendly label for movimentacao type
 */
export const getTipoMovimentacaoLabel = (tipo: string): string => {
  switch (tipo) {
    case 'COMPENSACAO': return 'Compensação';
    case 'ATUALIZACAO_SELIC': return 'Atualização SELIC';
    case 'CALCULO_MENSAL': return 'Cálculo Mensal';
    case 'DESCONTO': return 'Desconto';
    case 'AJUSTE_MANUAL': return 'Ajuste Manual';
    default: return tipo;
  }
};

/**
 * Gets friendly text for credito status
 */
export const getCreditoStatusText = (status: string): string => {
  switch (status) {
    case 'em_andamento': return 'Em Andamento';
    case 'habilitado': return 'Habilitado';
    case 'compensado': return 'Compensado';
    case 'indeferido': return 'Indeferido';
    case 'parcialmente_compensado': return 'Parcialmente Compensado';
    case 'aguardando_habilitacao': return 'Aguardando Habilitação';
    default: return status;
  }
};

// ========================================
// ERROR HANDLING UTILITIES
// ========================================

/**
 * Standard error handler for axios errors with user-friendly messages
 */
export const handleServiceError = (error: unknown, context: string = 'operação'): never => {
  console.error(`Error in ${context}:`, error);
  
  // Handle axios errors
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { status?: number; data?: unknown; statusText?: string } };
    
    if (axiosError.response?.status === 404) {
      throw new Error('Recurso não encontrado');
    } else if (axiosError.response?.status === 401) {
      throw new Error('Token de autenticação inválido');
    } else if (axiosError.response?.status === 403) {
      throw new Error('Acesso negado');
    } else if (axiosError.response?.status === 422) {
      throw new Error('Dados inválidos fornecidos');
    }
  }
  
  // Handle network errors
  if (error && typeof error === 'object' && 'code' in error) {
    const networkError = error as { code: string };
    if (networkError.code === 'NETWORK_ERROR') {
      throw new Error('Erro de conexão com o servidor');
    }
  }
  
  // Re-throw if it's already an Error instance
  if (error instanceof Error) {
    throw error;
  }
  
  throw new Error(`Erro desconhecido na ${context}`);
};

// ========================================
// CURRENCY FORMATTING UTILITIES  
// ========================================

/**
 * Formats input currency for display in form fields
 */
export const formatInputCurrency = (value: string | number | undefined): string => {
  if (!value) return '';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue).replace('R$', 'R$').replace(/\s/, '');
};

/**
 * Parses currency input back to number
 */
export const parseInputCurrency = (value: string | undefined): string => {
  if (!value) return '';
  return value.replace(/R\$\s?/g, '').replace(/\./g, '').replace(',', '.');
};