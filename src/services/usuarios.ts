import api from './api';
import type { Usuario } from '../types/usuario'

export const getUsuarios = async () => {
  const token = localStorage.getItem('token');
  const res = await api.get<{ usuarios: Usuario[] }>('/usuario/', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
  return res.data.usuarios;
};

export const getUsuario = async (id: number) => {
  const token = localStorage.getItem('token');
  const res = await api.get<Usuario>(`/usuario/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
  return res.data;
};
