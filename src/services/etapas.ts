import api from './api';
import type { Etapa } from '../types/etapa';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getEtapas = async () => {
  const res = await api.get<{ etapas: Etapa[] }>('/etapas/', {
    headers: getAuthHeaders(),
  });
  return res.data.etapas;
};

export const getEtapasByProjeto = async (projeto_id: number) => {
  const res = await api.get<{ etapas: Etapa[] }>(`/etapas/projeto/${projeto_id}`, {
    headers: getAuthHeaders(),
  });
  return res.data.etapas;
};

export const getEtapasByStatus = async (status: string) => {
  const res = await api.get<{ etapas: Etapa[] }>(`/etapas/status/${status}`, {
    headers: getAuthHeaders(),
  });
  return res.data.etapas;
};

export const getEtapasByDate = async (data_inicio?: string, data_fim?: string) => {
  const res = await api.get<{ etapas: Etapa[] }>(
    `/etapas/`,
    {
      params: { data_inicio, data_fim },
      headers: getAuthHeaders(),
    }
  );
  return res.data.etapas;
};

export const getEtapa = async (etapa_id: number) => {
  const res = await api.get<Etapa>(`/etapas/${etapa_id}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const createEtapa = async (etapa: Omit<Etapa, 'id' | 'created_at'>) => {
  const res = await api.post<Etapa>('/etapas/', etapa, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const updateEtapa = async (etapa_id: number, etapa: Partial<Omit<Etapa, 'id' | 'created_at'>>) => {
  const res = await api.put<Etapa>(`/etapas/${etapa_id}`, etapa, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const deleteEtapa = async (etapa_id: number) => {
  const res = await api.delete<{ message: string }>(`/etapas/${etapa_id}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};
