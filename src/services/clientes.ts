import api from './api';
import type { Cliente } from '../types/cliente';

// Helper to add token to headers
const authHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const getClientes = async (token?: string) => {
  const res = await api.get<{ clientes: Cliente[] }>(
    '/clientes/',
    token ? authHeaders(token) : undefined
  );
  return res.data.clientes;
};

export const getCliente = async (id: number, token?: string) => {
  const res = await api.get<Cliente>(
    `/clientes/${id}`,
    token ? authHeaders(token) : undefined
  );
  return res.data;
};

export const createCliente = async (
  cliente: Omit<Cliente, 'id'>,
  token?: string
) => {
  const res = await api.post<Cliente>(
    '/clientes/',
    cliente,
    token ? authHeaders(token) : undefined
  );
  return res.data;
};

export const updateCliente = async (
  id: number,
  cliente: Partial<Omit<Cliente, 'id'>>,
  token?: string
) => {
  const res = await api.put<Cliente>(
    `/clientes/${id}`,
    cliente,
    token ? authHeaders(token) : undefined
  );
  return res.data;
};

export const deleteCliente = async (id: number, token?: string) => {
  const res = await api.delete<{ message: string }>(
    `/clientes/${id}`,
    token ? authHeaders(token) : undefined
  );
  return res.data;
};