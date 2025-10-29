import api from './api';
import type { Guia, CreateGuiaData, UpdateGuiaData } from '../types/guia';
import { authHeaders, getAuthToken } from './utils';

export const getGuias = async (token?: string): Promise<Guia[]> => {
  const authToken = getAuthToken(token);
  const response = await api.get('/guias/', authHeaders(authToken));
  return response.data;
};

export const getGuia = async (id: number, token?: string): Promise<Guia> => {
  const authToken = token || localStorage.getItem('token');
  
  if (!authToken) {
    throw new Error('Token de autenticação não encontrado');
  }

  const response = await api.get(`/guias/${id}`, authHeaders(authToken));
  return response.data;
};

export const createGuia = async (data: CreateGuiaData, token?: string): Promise<Guia> => {
  const authToken = token || localStorage.getItem('token');
  
  if (!authToken) {
    throw new Error('Token de autenticação não encontrado');
  }

  const response = await api.post('/guias/', data, authHeaders(authToken));
  return response.data;
};

export const updateGuia = async (id: number, data: UpdateGuiaData, token?: string): Promise<Guia> => {
  const authToken = token || localStorage.getItem('token');
  
  if (!authToken) {
    throw new Error('Token de autenticação não encontrado');
  }

  const response = await api.put(`/guias/${id}`, data, authHeaders(authToken));
  return response.data;
};

export const deleteGuia = async (id: number, token?: string): Promise<void> => {
  const authToken = token || localStorage.getItem('token');
  
  if (!authToken) {
    throw new Error('Token de autenticação não encontrado');
  }

  await api.delete(`/guias/${id}`, authHeaders(authToken));
};

// Get guias by client (simple list)
export const getGuiasByCliente = async (clienteId: number, token?: string): Promise<Guia[]> => {
  const authToken = token || localStorage.getItem('token');
  
  if (!authToken) {
    throw new Error('Token de autenticação não encontrado');
  }

  const response = await api.get(`/guias/cliente/${clienteId}`, authHeaders(authToken));
  return response.data;
};
