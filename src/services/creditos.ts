import api from './api';
import type {
  Credito,
  MovimentacaoCredito,
  CreateCreditoData,
  CreateMovimentacaoData,
  UpdateMovimentacaoData,
  UpdateCreditoData,
  CreditoFilters,
  CreditoListResponse,
  ClienteCreditosResponse,
  MovimentacoesResponse
} from '../types/credito';

// Helper to add token to headers
const authHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ========== CREDITOS CRUD ==========

export const getCreditos = async (filters?: CreditoFilters, token?: string) => {
  const params = new URLSearchParams();
  
  if (filters?.cliente_id) params.append('cliente_id', filters.cliente_id.toString());
  if (filters?.status) params.append('status', filters.status);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.size) params.append('size', filters.size.toString());
  
  const res = await api.get<CreditoListResponse>(
    `/creditos/?${params.toString()}`,
    token ? authHeaders(token) : undefined
  );
  return res.data;
};

export const getCredito = async (creditoId: number, token?: string) => {
  const res = await api.get<Credito>(
    `/creditos/${creditoId}`,
    token ? authHeaders(token) : undefined
  );
  return res.data;
};

export const getCreditosCliente = async (clienteId: number, token?: string) => {
  const authToken = token || localStorage.getItem('token');
  
  if (!authToken) {
    throw new Error('Token de autenticação não encontrado');
  }
  try {
    const res = await api.get<ClienteCreditosResponse>(
      `/creditos/cliente/${clienteId}`,
    authHeaders(authToken)
    );
    
    
    // The API returns { creditos: Credito[] }, so we extract the array
    if (res.data && 'creditos' in res.data) {
      const creditos = res.data.creditos;
      return creditos;
    }
    
    // Fallback in case structure is different
    return [];
  } catch (error) {
    console.error('=== Error in getCreditosCliente ===');
    console.error('Full error object:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: unknown; status?: number; statusText?: string } };
      console.error('Error response data:', axiosError.response?.data);
      console.error('Error status:', axiosError.response?.status);
      console.error('Error status text:', axiosError.response?.statusText);
    }
    throw error; // Re-throw to let the component handle it
  }
};

export const createCredito = async (data: CreateCreditoData, token?: string) => {
  const authToken = token || localStorage.getItem('token');
  if (!authToken) {
    throw new Error('Token de autenticação não encontrado');
  } 
  const res = await api.post<Credito>(
    '/creditos/',
    data,
    authHeaders(authToken)
  );
  
   return res.data;
};

export const updateCredito = async (
  creditoId: number,
  data: UpdateCreditoData,
  token?: string
) => {
  const authToken = token || localStorage.getItem('token');
  
  if (!authToken) {
    throw new Error('Token de autenticação não encontrado');
  }

  const res = await api.put<Credito>(
    `/creditos/${creditoId}`,
    data,
    authHeaders(authToken)
  );
  return res.data;
};

export const deleteCredito = async (creditoId: number, token?: string) => {
  const authToken = token || localStorage.getItem('token');
  
  if (!authToken) {
    throw new Error('Token de autenticação não encontrado');
  }
  const res = await api.delete<{ message: string }>(
    `/creditos/${creditoId}`,
    authHeaders(authToken)
  );
  return res.data;
};

// ========== MOVIMENTACOES CRUD ==========

export const getMovimentacoes = async (creditoId: number, token?: string): Promise<MovimentacaoCredito[]> => {
  
  const authToken = token || localStorage.getItem('token');
  
  if (!authToken) {
    console.error('❌ Token de autenticação não encontrado');
    throw new Error('Token de autenticação não encontrado');
  }
  
  try {
    const res = await api.get<MovimentacoesResponse>(
      `/creditos/${creditoId}/movimentacoes`,
      authHeaders(authToken)
    );
    
    
    // A API retorna { "movimentacoes": [...] }, então extraímos o array
    const movimentacoes = Array.isArray(res.data.movimentacoes) ? res.data.movimentacoes : [];
    return movimentacoes;
    
  } catch (error) {
    console.error('❌ Error loading movimentacoes:', error);
    // Retornar array vazio em caso de erro para evitar problemas com .map()
    return [];
  }
};

export const createMovimentacao = async (
  creditoId: number,
  data: CreateMovimentacaoData,
  token?: string
) => {
  const authToken = token || localStorage.getItem('token');
  
  if (!authToken) {
    throw new Error('Token de autenticação não encontrado');
  }

  const res = await api.post<MovimentacaoCredito>(
    `/creditos/${creditoId}/movimentacoes`,
    data,
    authHeaders(authToken)
  );
  return res.data;
};

export const updateMovimentacao = async (
  creditoId: number,
  movimentacaoId: number,
  data: UpdateMovimentacaoData,
  token?: string
) => {
  const authToken = token || localStorage.getItem('token');
  
  if (!authToken) {
    throw new Error('Token de autenticação não encontrado');
  }

  const res = await api.put<MovimentacaoCredito>(
    `/creditos/${creditoId}/movimentacoes/${movimentacaoId}`,
    data,
    authHeaders(authToken)
  );
  return res.data;
};

export const deleteMovimentacao = async (
  creditoId: number,
  movimentacaoId: number,
  token?: string
) => {
  const authToken = token || localStorage.getItem('token');
  
  if (!authToken) {
    throw new Error('Token de autenticação não encontrado');
  }

  const res = await api.delete<{ message: string }>(
    `/creditos/${creditoId}/movimentacoes/${movimentacaoId}`,
    authHeaders(authToken)
  );
  return res.data;
};

// ========== UTILITY FUNCTIONS ==========

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'ATIVO': return 'green';
    case 'QUITADO': return 'blue';
    case 'CANCELADO': return 'red';
    default: return 'default';
  }
};

export const getTipoMovimentacaoColor = (tipo: string) => {
  switch (tipo) {
    case 'COMPENSACAO': return 'red';
    case 'ATUALIZACAO_SELIC': return 'orange';
    case 'CALCULO_MENSAL': return 'yellow';
    case 'DESCONTO': return 'green';
    case 'AJUSTE_MANUAL': return 'purple';
    default: return 'default';
  }
};

export const getTipoMovimentacaoLabel = (tipo: string) => {
  switch (tipo) {
    case 'COMPENSACAO': return 'Compensação';
    case 'ATUALIZACAO_SELIC': return 'Atualização SELIC';
    case 'CALCULO_MENSAL': return 'Cálculo Mensal';
    case 'DESCONTO': return 'Desconto';
    case 'AJUSTE_MANUAL': return 'Ajuste Manual';
    default: return tipo;
  }
};