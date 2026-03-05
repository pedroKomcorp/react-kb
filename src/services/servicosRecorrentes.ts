import api from './api';
import { getProjetos } from './projetos';
import { authHeaders } from './utils';
import type { Projeto, ProjetoStatus } from '../types/projeto';

export type ServicoRecorrente = Projeto & {
  categoria: 'SR';
  recorrencia_ativa?: boolean;
  recorrencia_intervalo_dias?: number | null;
  recorrencia_status_reinicio?: ProjetoStatus | null;
  recorrencia_ultima_execucao?: string | null;
  recorrencia_proxima_execucao?: string | null;
};

type ServicosRecorrentesResponse = {
  servicos_recorrentes?: ServicoRecorrente[];
  projetos?: ServicoRecorrente[];
  total?: number;
};

const isAxiosNotFound = (error: unknown) => {
  if (!error || typeof error !== 'object' || !('response' in error)) {
    return false;
  }
  const response = (error as { response?: { status?: number } }).response;
  return response?.status === 404;
};

const normalizeListResponse = (
  payload: ServicosRecorrentesResponse
): { projetos: ServicoRecorrente[]; total: number } => {
  const projetos = payload.servicos_recorrentes ?? payload.projetos ?? [];
  return {
    projetos,
    total: payload.total ?? projetos.length,
  };
};

export const getServicosRecorrentes = async (
  params?: { offset?: number; limit?: number },
  token?: string
) => {
  const queryParams = { ...(params || {}), limit: params?.limit ?? 1000 };

  try {
    const res = await api.get<ServicosRecorrentesResponse>(
      '/servicos-recorrentes/',
      {
        params: queryParams,
        ...(token && authHeaders(token)),
      }
    );
    return normalizeListResponse(res.data);
  } catch (error) {
    if (!isAxiosNotFound(error)) {
      throw error;
    }

    const fallback = await getProjetos(params, token);
    const recorrentes = fallback.projetos.filter(
      (projeto): projeto is ServicoRecorrente => projeto.categoria === 'SR'
    );
    return { projetos: recorrentes, total: recorrentes.length };
  }
};

export const updateServicoRecorrente = async (
  id: number,
  payload: Partial<Omit<ServicoRecorrente, 'id' | 'categoria'>>,
  token?: string
) => {
  try {
    const res = await api.put<ServicoRecorrente>(
      `/servicos-recorrentes/${id}`,
      payload,
      token ? authHeaders(token) : undefined
    );
    return res.data;
  } catch (error) {
    if (!isAxiosNotFound(error)) {
      throw error;
    }

    const fallback = await api.put<Projeto>(
      `/projetos/${id}`,
      payload,
      token ? authHeaders(token) : undefined
    );
    return fallback.data as ServicoRecorrente;
  }
};
