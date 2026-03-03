import api from './api';
import {
  getAuthToken,
  authHeaders,
  handleServiceError,
} from './utils';
import type {
  ListaTarefas,
  ListaTarefasDetalhe,
  ItemListaTarefas,
  CreateListaTarefasData,
  UpdateListaTarefasData,
  CreateItemListaTarefasData,
  UpdateItemListaTarefasData,
  ReorderItensListaTarefasData,
  ListaTarefasListResponse,
  ClearConcluidosResponse,
} from '../types/listasTarefas';

export const getListasTarefas = async (
  params?: { offset?: number; limit?: number },
  token?: string
): Promise<ListaTarefasListResponse> => {
  try {
    const authToken = getAuthToken(token);
    const res = await api.get<ListaTarefasListResponse>(
      '/listas-tarefas/',
      {
        params,
        ...authHeaders(authToken),
      }
    );
    return res.data;
  } catch (error) {
    return handleServiceError(error, 'busca de listas de tarefas');
  }
};

export const getListaTarefas = async (listaId: number, token?: string): Promise<ListaTarefasDetalhe> => {
  try {
    const authToken = getAuthToken(token);
    const res = await api.get<ListaTarefasDetalhe>(
      `/listas-tarefas/${listaId}`,
      authHeaders(authToken)
    );
    return res.data;
  } catch (error) {
    return handleServiceError(error, 'busca da lista de tarefas');
  }
};

export const createListaTarefas = async (
  data: CreateListaTarefasData,
  token?: string
): Promise<ListaTarefas> => {
  try {
    const authToken = getAuthToken(token);
    const res = await api.post<ListaTarefas>(
      '/listas-tarefas/',
      data,
      authHeaders(authToken)
    );
    return res.data;
  } catch (error) {
    return handleServiceError(error, 'criação da lista de tarefas');
  }
};

export const updateListaTarefas = async (
  listaId: number,
  data: UpdateListaTarefasData,
  token?: string
): Promise<ListaTarefas> => {
  try {
    const authToken = getAuthToken(token);
    const res = await api.put<ListaTarefas>(
      `/listas-tarefas/${listaId}`,
      data,
      authHeaders(authToken)
    );
    return res.data;
  } catch (error) {
    return handleServiceError(error, 'atualização da lista de tarefas');
  }
};

export const deleteListaTarefas = async (
  listaId: number,
  token?: string
): Promise<{ message: string }> => {
  try {
    const authToken = getAuthToken(token);
    const res = await api.delete<{ message: string }>(
      `/listas-tarefas/${listaId}`,
      authHeaders(authToken)
    );
    return res.data;
  } catch (error) {
    return handleServiceError(error, 'remoção da lista de tarefas');
  }
};

export const createItemListaTarefas = async (
  listaId: number,
  data: CreateItemListaTarefasData,
  token?: string
): Promise<ItemListaTarefas> => {
  try {
    const authToken = getAuthToken(token);
    const res = await api.post<ItemListaTarefas>(
      `/listas-tarefas/${listaId}/itens`,
      data,
      authHeaders(authToken)
    );
    return res.data;
  } catch (error) {
    return handleServiceError(error, 'criação de item da lista de tarefas');
  }
};

export const updateItemListaTarefas = async (
  listaId: number,
  itemId: number,
  data: UpdateItemListaTarefasData,
  token?: string
): Promise<ItemListaTarefas> => {
  try {
    const authToken = getAuthToken(token);
    const res = await api.patch<ItemListaTarefas>(
      `/listas-tarefas/${listaId}/itens/${itemId}`,
      data,
      authHeaders(authToken)
    );
    return res.data;
  } catch (error) {
    return handleServiceError(error, 'atualização de item da lista de tarefas');
  }
};

export const deleteItemListaTarefas = async (
  listaId: number,
  itemId: number,
  token?: string
): Promise<{ message: string }> => {
  try {
    const authToken = getAuthToken(token);
    const res = await api.delete<{ message: string }>(
      `/listas-tarefas/${listaId}/itens/${itemId}`,
      authHeaders(authToken)
    );
    return res.data;
  } catch (error) {
    return handleServiceError(error, 'remoção de item da lista de tarefas');
  }
};

export const reorderItensListaTarefas = async (
  listaId: number,
  data: ReorderItensListaTarefasData,
  token?: string
): Promise<{ message: string }> => {
  try {
    const authToken = getAuthToken(token);
    const res = await api.put<{ message: string }>(
      `/listas-tarefas/${listaId}/itens/ordem`,
      data,
      authHeaders(authToken)
    );
    return res.data;
  } catch (error) {
    return handleServiceError(error, 'reordenação de itens da lista de tarefas');
  }
};

export const clearConcluidosListaTarefas = async (
  listaId: number,
  token?: string
): Promise<ClearConcluidosResponse> => {
  try {
    const authToken = getAuthToken(token);
    const res = await api.post<ClearConcluidosResponse>(
      `/listas-tarefas/${listaId}/limpar-concluidos`,
      {},
      authHeaders(authToken)
    );
    return res.data;
  } catch (error) {
    return handleServiceError(error, 'limpeza de itens concluídos da lista de tarefas');
  }
};
