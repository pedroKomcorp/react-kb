import api from './api';
import type { Usuario } from '../types/usuario'

export const getUsuarios = async () => {
  const token = localStorage.getItem('token');
  const res = await api.get<{ usuarios: Usuario[] }>('/usuario/', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
  return res.data.usuarios;
};

export const getUsuario = async (id: number): Promise<Usuario> => {
  // Validate input
  if (!id || id <= 0) {
    throw new Error('ID do usuário inválido');
  }

  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Token de autenticação não encontrado');
  }

  try {
    console.log(`Fetching user data for ID: ${id}`);
    
    const res = await api.get<Usuario>(`/usuario/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Validate response data
    if (!res.data) {
      throw new Error('Dados do usuário não encontrados na resposta');
    }
    
    if (!res.data.nome || !res.data.email) {
      console.warn('User data incomplete:', res.data);
    }
    
    console.log('User data loaded successfully:', res.data);
    return res.data;
    
  } catch (error: unknown) {
    console.error('Error fetching user:', error);
    
    // Handle axios errors
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status: number } };
      
      if (axiosError.response?.status === 404) {
        throw new Error('Usuário não encontrado');
      } else if (axiosError.response?.status === 401) {
        throw new Error('Token de autenticação inválido');
      } else if (axiosError.response?.status === 403) {
        throw new Error('Acesso negado');
      }
    }
    
    // Handle network errors
    if (error && typeof error === 'object' && 'code' in error) {
      const networkError = error as { code: string };
      if (networkError.code === 'NETWORK_ERROR') {
        throw new Error('Erro de conexão com o servidor');
      }
    }
    
    // Re-throw the original error if it's not handled above
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Erro desconhecido ao carregar usuário');
  }
};


export interface UpdateUsuarioData {
  id: number;
  nome: string;
  email: string;
  senha: string; // current or new password
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



