import api from './api';

export async function listarUsuarios(page = 0, size = 20) {
  const response = await api.get(`/cadastros?page=${page}&size=${size}`);
  return response.data;
}

export async function buscarUsuario(id: number) {
  const response = await api.get(`/cadastros/${id}`);
  return response.data;
}