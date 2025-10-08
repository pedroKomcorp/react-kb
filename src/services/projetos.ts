import api from './api';
import type { Projeto } from '../types/projeto';

// Helper to add token to headers
const authHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const getProjetos = async (
  params?: { offset?: number; limit?: number },
  token?: string
) => {
  const res = await api.get<{ projetos: Projeto[]; total: number }>(
    '/projetos/',
    {
      params,
      ...(token && authHeaders(token)),
    }
  );
  return res.data;
};

export const getProjetoByID = async (id: number, token?: string) => {
  const res = await api.get<Projeto>(
    `/projetos/${id}`,
    token ? authHeaders(token) : undefined
  );
  return res.data;
};

export const createProjeto = async (
  projeto: Omit<Projeto, 'id'>,
  token?: string
) => {
  const res = await api.post<Projeto>(
    '/projetos/',
    projeto,
    token ? authHeaders(token) : undefined
  );
  return res.data;
};

export const updateProjeto = async (
  id: number,
  projeto: Partial<Omit<Projeto, 'id'>>,
  token?: string
) => {
  const res = await api.put<Projeto>(
    `/projetos/${id}`,
    projeto,
    token ? authHeaders(token) : undefined
  );
  return res.data;
};

export const deleteProjeto = async (id: number, token?: string) => {
  const res = await api.delete<{ message: string }>(
    `/projetos/${id}`,
    token ? authHeaders(token) : undefined
  );
  return res.data;
};
