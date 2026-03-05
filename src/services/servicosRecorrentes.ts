import api from './api';
import {
  authHeaders,
  getAuthToken,
  handleServiceError,
} from './utils';
import type {
  ServicoRecorrenteInstancia,
  ServicoRecorrenteTemplate,
} from '../types/recorrencia';

interface PendingInstanciasParams {
  limit?: number;
  includeOverdue?: boolean;
}

const PENDING_ROUTES = [
  '/servicos-recorrentes/instancias/pendentes',
  '/servicos_recorrentes/instancias/pendentes',
  '/servicos-recorrentes/pendentes',
] as const;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isNotFoundError = (error: unknown): boolean => {
  if (!isRecord(error)) {
    return false;
  }

  const response = error.response;
  if (!isRecord(response)) {
    return false;
  }

  return response.status === 404;
};

const extractListFromPayload = <T>(
  payload: unknown,
  keys: string[]
): T[] => {
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

export const getServicosRecorrentesTemplates = async (
  token?: string
): Promise<ServicoRecorrenteTemplate[]> => {
  try {
    const authToken = getAuthToken(token);
    const res = await api.get<unknown>(
      '/servicos-recorrentes/templates',
      authHeaders(authToken)
    );

    return extractListFromPayload<ServicoRecorrenteTemplate>(res.data, [
      'templates',
      'servicos_recorrentes',
      'servicos',
      'items',
    ]);
  } catch (error) {
    handleServiceError(error, 'busca de templates de serviços recorrentes');
  }

  throw new Error('Falha inesperada ao buscar templates de serviços recorrentes');
};

export const getInstanciasRecorrentesPendentes = async (
  params?: PendingInstanciasParams,
  token?: string
): Promise<ServicoRecorrenteInstancia[]> => {
  try {
    const authToken = getAuthToken(token);
    const query = {
      ...(typeof params?.limit === 'number' ? { limit: params.limit } : {}),
      ...(typeof params?.includeOverdue === 'boolean'
        ? { include_overdue: params.includeOverdue }
        : {}),
    };

    for (const route of PENDING_ROUTES) {
      try {
        const res = await api.get<unknown>(route, {
          ...authHeaders(authToken),
          params: query,
        });

        return extractListFromPayload<ServicoRecorrenteInstancia>(res.data, [
          'instancias',
          'instances',
          'pendentes',
          'servicos_recorrentes',
          'items',
        ]);
      } catch (routeError) {
        if (isNotFoundError(routeError)) {
          continue;
        }
        throw routeError;
      }
    }

    throw new Error('Rota de instâncias recorrentes pendentes não encontrada');
  } catch (error) {
    handleServiceError(error, 'busca de instâncias recorrentes pendentes');
  }

  throw new Error('Falha inesperada ao buscar instâncias recorrentes pendentes');
};
