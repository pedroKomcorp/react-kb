import api from './api';
import type { Usuario } from '../types/usuario';
import { authHeaders, getAuthToken } from './utils';

export const getUsuarios = async () => {
  const token = getAuthToken();
  const res = await api.get<{ usuarios: Usuario[] }>('/usuario/', authHeaders(token));
  return res.data.usuarios;
};

export const getUsuario = async (id: number): Promise<Usuario> => {
  // Validate input
  if (!id || id <= 0) {
    throw new Error('ID do usuário inválido');
  }

  const token = getAuthToken();
  const res = await api.get<Usuario>(`/usuario/${id}`, authHeaders(token));
  
  // Validate response data
  if (!res.data) {
    throw new Error('Dados do usuário não encontrados na resposta');
  }
  
  if (!res.data.nome || !res.data.email) {
    console.warn('User data incomplete:', res.data);
  }
  
  return res.data;
};


export interface UpdateUsuarioData {
  id: number;
  nome: string;
  email: string;
  senha: string;
}

export const updateUsuario = async (data: UpdateUsuarioData) => {
  const token = localStorage.getItem('token');
  const { id, nome, email, senha } = data;
  const payload = { nome, email, senha };
  const res = await api.put<Usuario>(`/usuario/${id}`, payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
  return res.data;
};



