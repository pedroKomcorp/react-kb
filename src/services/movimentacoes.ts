import api from './api';
import type { MovimentacaoCredito, CreateMovimentacaoData, UpdateMovimentacaoData } from '../types/movimentacao';
import { authHeaders, getAuthToken } from './utils';

export const getMovimentacoes = async (token?: string): Promise<MovimentacaoCredito[]> => {
  const authToken = getAuthToken(token);
  const response = await api.get('/movimentacoes/', authHeaders(authToken));
  return response.data;
};

export const getMovimentacao = async (id: number, token?: string): Promise<MovimentacaoCredito> => {
  const authToken = token || localStorage.getItem('token');
  
  if (!authToken) {
    throw new Error('Token de autenticação não encontrado');
  }

  const response = await api.get(`/movimentacoes/${id}`, authHeaders(authToken));
  return response.data;
};

export const createMovimentacao = async (data: CreateMovimentacaoData, token?: string): Promise<MovimentacaoCredito> => {
  const authToken = token || localStorage.getItem('token');
  
  if (!authToken) {
    throw new Error('Token de autenticação não encontrado');
  }

  // Use the generic route with credito_id in body
  const response = await api.post('/movimentacoes/', data, authHeaders(authToken));
  return response.data;
};

// Alternative: Create movimentacao for specific credito
export const createMovimentacaoForCredito = async (creditoId: number, data: Omit<CreateMovimentacaoData, 'credito_id'>, token?: string): Promise<MovimentacaoCredito> => {
  const authToken = token || localStorage.getItem('token');
  
  if (!authToken) {
    throw new Error('Token de autenticação não encontrado');
  }

  const response = await api.post(`/movimentacoes/credito/${creditoId}`, data, authHeaders(authToken));
  return response.data;
};

export const updateMovimentacao = async (id: number, data: UpdateMovimentacaoData, token?: string): Promise<MovimentacaoCredito> => {
  const authToken = token || localStorage.getItem('token');
  
  if (!authToken) {
    throw new Error('Token de autenticação não encontrado');
  }

  const response = await api.put(`/movimentacoes/${id}`, data, authHeaders(authToken));
  return response.data;
};

export const deleteMovimentacao = async (id: number, token?: string): Promise<void> => {
  const authToken = token || localStorage.getItem('token');
  
  if (!authToken) {
    throw new Error('Token de autenticação não encontrado');
  }

  await api.delete(`/movimentacoes/${id}`, authHeaders(authToken));
};

// Get movimentacoes by project
// Using: GET /movimentacoes/projeto/{projeto_id}
export const getMovimentacoesByProjeto = async (projetoId: number, token?: string): Promise<MovimentacaoCredito[]> => {
  const authToken = token || localStorage.getItem('token');
  
  if (!authToken) {
    throw new Error('Token de autenticação não encontrado');
  }

  const response = await api.get(`/movimentacoes/projeto/${projetoId}`, authHeaders(authToken));
  return response.data;
};

// Get movimentacoes by project grouped by credit
// Using: GET /movimentacoes/projeto/{projeto_id}/agrupadas
export const getMovimentacoesByProjetoAgrupadas = async (projetoId: number, token?: string): Promise<MovimentacaoCredito[]> => {
  const authToken = token || localStorage.getItem('token');
  
  if (!authToken) {
    throw new Error('Token de autenticação não encontrado');
  }

  const response = await api.get(`/movimentacoes/projeto/${projetoId}/agrupadas`, authHeaders(authToken));
  return response.data;
};

// Get movimentacoes by credito
export const getMovimentacoesByCredito = async (creditoId: number, token?: string): Promise<MovimentacaoCredito[]> => {
  const authToken = token || localStorage.getItem('token');
  
  if (!authToken) {
    throw new Error('Token de autenticação não encontrado');
  }

  const response = await api.get(`/movimentacoes/credito/${creditoId}`, authHeaders(authToken));
  return response.data;
};

// Get movimentacoes by cliente
export const getMovimentacoesByCliente = async (clienteId: number, token?: string): Promise<MovimentacaoCredito[]> => {
  const authToken = token || localStorage.getItem('token');
  
  if (!authToken) {
    throw new Error('Token de autenticação não encontrado');
  }

  const response = await api.get(`/movimentacoes/cliente/${clienteId}`, authHeaders(authToken));
  return response.data;
};

// Guia association functions
export const associarMovimentacaoAGuia = async (movimentacaoId: number, guiaId: number, token?: string): Promise<void> => {
  const authToken = token || localStorage.getItem('token');
  
  if (!authToken) {
    throw new Error('Token de autenticação não encontrado');
  }

  await api.post(`/movimentacoes/${movimentacaoId}/guias/${guiaId}`, {}, authHeaders(authToken));
};

export const desassociarMovimentacaoDeGuia = async (movimentacaoId: number, guiaId: number, token?: string): Promise<void> => {
  const authToken = token || localStorage.getItem('token');
  
  if (!authToken) {
    throw new Error('Token de autenticação não encontrado');
  }

  await api.delete(`/movimentacoes/${movimentacaoId}/guias/${guiaId}`, authHeaders(authToken));
};

// Get guias associated with a movimentacao
export const getGuiasByMovimentacao = async (movimentacaoId: number, token?: string): Promise<unknown[]> => {
  const authToken = token || localStorage.getItem('token');
  
  if (!authToken) {
    throw new Error('Token de autenticação não encontrado');
  }

  const response = await api.get(`/movimentacoes/${movimentacaoId}/guias`, authHeaders(authToken));
  return response.data;
};