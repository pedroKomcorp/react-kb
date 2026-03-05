import api from './api';
import { authHeaders, getAuthToken, handleServiceError } from './utils';
import type { Projeto } from '../types/projeto';

export interface ServicosRecorrentesListParams {
  offset?: number;
  limit?: number;
  status?: Projeto['status'];
  responsavelId?: number;
  search?: string;
}

export interface ServicosRecorrentesListResponse {
  servicos: Projeto[];
  total: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const extractListFromPayload = <T>(payload: unknown, keys: string[]): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!isRecord(payload)) {
    return [];
  }

  for (const key of keys) {
    const candidate = payload[key];
    if (Array.isArray(candidate)) {
      return candidate as T[];
    }
  }

  const nestedData = payload.data;
  if (isRecord(nestedData)) {
    for (const key of keys) {
      const candidate = nestedData[key];
      if (Array.isArray(candidate)) {
        return candidate as T[];
      }
    }
  }

  return [];
};

const extractTotalFromPayload = (payload: unknown, fallback: number): number => {
  if (!isRecord(payload)) {
    return fallback;
  }

  const candidates = [payload.total, payload.count, payload.quantidade];
  for (const candidate of candidates) {
    if (typeof candidate === 'number' && Number.isFinite(candidate)) {
      return candidate;
    }
  }

  const nestedData = payload.data;
  if (isRecord(nestedData)) {
    const nestedCandidates = [nestedData.total, nestedData.count, nestedData.quantidade];
    for (const candidate of nestedCandidates) {
      if (typeof candidate === 'number' && Number.isFinite(candidate)) {
        return candidate;
      }
    }
  }

  return fallback;
};

export const getServicosRecorrentes = async (
  params?: ServicosRecorrentesListParams,
  token?: string
): Promise<ServicosRecorrentesListResponse> => {
  try {
    const authToken = getAuthToken(token);
    const query = {
      ...(typeof params?.offset === 'number' ? { offset: params.offset } : {}),
      ...(typeof params?.limit === 'number' ? { limit: params.limit } : {}),
      ...(params?.status ? { status: params.status } : {}),
      ...(typeof params?.responsavelId === 'number' ? { responsavel_id: params.responsavelId } : {}),
      ...(params?.search ? { search: params.search } : {}),
    };

    const res = await api.get<unknown>('/servicos-recorrentes/', {
      ...authHeaders(authToken),
      params: query,
    });

    const servicos = extractListFromPayload<Projeto>(res.data, [
      'servicos_recorrentes',
      'projetos',
      'items',
      'data',
    ]);

    return {
      servicos,
      total: extractTotalFromPayload(res.data, servicos.length),
    };
  } catch (error) {
    handleServiceError(error, 'busca de serviços recorrentes');
  }

  throw new Error('Falha inesperada ao buscar serviços recorrentes');
};

export const getServicoRecorrenteById = async (id: number, token?: string): Promise<Projeto> => {
  try {
    const authToken = getAuthToken(token);
    const res = await api.get<Projeto>(`/servicos-recorrentes/${id}`, authHeaders(authToken));
    return res.data;
  } catch (error) {
    handleServiceError(error, 'busca de serviço recorrente');
  }

  throw new Error('Falha inesperada ao buscar serviço recorrente');
};

export const createServicoRecorrente = async (
  payload: Omit<Projeto, 'id'>,
  token?: string
): Promise<Projeto> => {
  try {
    const authToken = getAuthToken(token);
    const res = await api.post<Projeto>(
      '/servicos-recorrentes/',
      {
        ...payload,
        categoria: 'SR',
      },
      authHeaders(authToken)
    );
    return res.data;
  } catch (error) {
    handleServiceError(error, 'criação de serviço recorrente');
  }

  throw new Error('Falha inesperada ao criar serviço recorrente');
};

export const updateServicoRecorrente = async (
  id: number,
  payload: Partial<Omit<Projeto, 'id'>>,
  token?: string
): Promise<Projeto> => {
  try {
    const authToken = getAuthToken(token);
    const res = await api.patch<Projeto>(
      `/servicos-recorrentes/${id}`,
      payload,
      authHeaders(authToken)
    );
    return res.data;
  } catch (error) {
    handleServiceError(error, 'atualização de serviço recorrente');
  }

  throw new Error('Falha inesperada ao atualizar serviço recorrente');
};

export const reiniciarServicoRecorrente = async (
  id: number,
  token?: string
): Promise<Projeto> => {
  try {
    const authToken = getAuthToken(token);
    const res = await api.post<Projeto>(
      `/servicos-recorrentes/${id}/reiniciar`,
      {},
      authHeaders(authToken)
    );
    return res.data;
  } catch (error) {
    handleServiceError(error, 'reinício de serviço recorrente');
  }

  throw new Error('Falha inesperada ao reiniciar serviço recorrente');
};
