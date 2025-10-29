import api from './api';
import type { Projeto } from '../types/projeto';
import { authHeaders, getAuthToken, handleServiceError } from './utils';

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

export const associateCreditoToProjeto = async (
  projetoId: number,
  creditoId: number,
  token?: string
) => {
  try {
    const authToken = getAuthToken(token);
    const res = await api.post<{ message: string }>(
      `/projetos/${projetoId}/creditos/${creditoId}`,
      {},
      authHeaders(authToken)
    );
    return res.data;
  } catch (error) {
    handleServiceError(error, 'associação do crédito ao projeto');
  }
};

// Disassociate credito from projeto
export const disassociateCreditoFromProjeto = async (
  projetoId: number,
  creditoId: number,
  token?: string
) => {
  try {
    const authToken = getAuthToken(token);
    const res = await api.delete<{ message: string }>(
      `/projetos/${projetoId}/creditos/${creditoId}`,
      authHeaders(authToken)
    );
    return res.data;
  } catch (error) {
    handleServiceError(error, 'desassociação do crédito do projeto');
  }
};
