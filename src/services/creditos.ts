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
} from '../types/credito';
import { authHeaders, getAuthToken, handleServiceError } from './utils';

// Re-export utility functions for backward compatibility
export { 
  formatCurrency, 
  formatDate, 
  getCreditoStatusColor as getStatusColor,
  getTipoMovimentacaoColor,
  getTipoMovimentacaoLabel
} from './utils';

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
  try {
    const authToken = getAuthToken(token);
    const res = await api.get<ClienteCreditosResponse>(
      `/creditos/cliente/${clienteId}`,
      authHeaders(authToken)
    );
    
    // The API returns { creditos: Credito[] }, so we extract the array
    if (res.data && 'creditos' in res.data) {
      return res.data.creditos;
    }
    
    // Fallback in case structure is different
    return [];
  } catch (error) {
    handleServiceError(error, 'busca de créditos do cliente');
  }
};

export const createCredito = async (data: CreateCreditoData, token?: string) => {
  try {
    const authToken = getAuthToken(token);
    const res = await api.post<Credito>(
      '/creditos/',
      data,
      authHeaders(authToken)
    );
    return res.data;
  } catch (error) {
    handleServiceError(error, 'criação do crédito');
  }
};

export const updateCredito = async (
  creditoId: number,
  data: UpdateCreditoData,
  token?: string
) => {
  try {
    const authToken = getAuthToken(token);
    const res = await api.put<Credito>(
      `/creditos/${creditoId}`,
      data,
      authHeaders(authToken)
    );
    return res.data;
  } catch (error) {
    handleServiceError(error, 'atualização do crédito');
  }
};

export const deleteCredito = async (creditoId: number, token?: string) => {
  try {
    const authToken = getAuthToken(token);
    const res = await api.delete<{ message: string }>(
      `/creditos/${creditoId}`,
      authHeaders(authToken)
    );
    return res.data;
  } catch (error) {
    handleServiceError(error, 'exclusão do crédito');
  }
};

// ========== MOVIMENTACOES CRUD ==========

export const createMovimentacao = async (
  creditoId: number,
  data: CreateMovimentacaoData,
  token?: string
) => {
  try {
    const authToken = getAuthToken(token);
    const res = await api.post<MovimentacaoCredito>(
      `/creditos/${creditoId}/movimentacoes`,
      data,
      authHeaders(authToken)
    );
    return res.data;
  } catch (error) {
    handleServiceError(error, 'criação da movimentação');
  }
};

export const updateMovimentacao = async (
  creditoId: number,
  movimentacaoId: number,
  data: UpdateMovimentacaoData,
  token?: string
) => {
  try {
    const authToken = getAuthToken(token);
    const res = await api.put<MovimentacaoCredito>(
      `/creditos/${creditoId}/movimentacoes/${movimentacaoId}`,
      data,
      authHeaders(authToken)
    );
    return res.data;
  } catch (error) {
    handleServiceError(error, 'atualização da movimentação');
  }
};

export const deleteMovimentacao = async (
  creditoId: number,
  movimentacaoId: number,
  token?: string
) => {
  try {
    const authToken = getAuthToken(token);
    const res = await api.delete<{ message: string }>(
      `/creditos/${creditoId}/movimentacoes/${movimentacaoId}`,
      authHeaders(authToken)
    );
    return res.data;
  } catch (error) {
    handleServiceError(error, 'exclusão da movimentação');
  }
};

// Utility functions now imported from './utils'