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

// Profile-specific API functions
export const getCurrentUserProfile = async () => {
  const token = localStorage.getItem('token');
  const res = await api.get<Usuario>('/usuario/profile', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
  return res.data;
};

export const updateUserProfile = async (profileData: Partial<Pick<Usuario, 'nome' | 'email' | 'profilePhoto'>>) => {
  const token = localStorage.getItem('token');
  const res = await api.put<Usuario>('/usuario/profile', profileData, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
  return res.data;
};

export const uploadProfilePhoto = async (photoFile: File) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('profilePhoto', photoFile);
  
  const res = await api.post<{ profilePhotoUrl: string }>('/usuario/profile/photo', formData, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data.profilePhotoUrl;
};

export const deleteProfilePhoto = async () => {
  const token = localStorage.getItem('token');
  await api.delete('/usuario/profile/photo', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
};
