import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export async function login(email: string, senha: string) {
  const response = await api.post('/auth/login', { email, senha });
  await AsyncStorage.setItem('token', response.data.token);
  if (response.data.usuario) {
    await AsyncStorage.setItem('usuario', JSON.stringify(response.data.usuario));
  }
  return response.data;
}

export async function cadastrar(dados: {
  nomeCompleto: string;
  email: string;
  senha: string;
  anonimo: boolean;
  tipo: string;
  crp?: string;
  especialidade?: string;
  credenciais?: string;
  biografia?: string;
}) {
  const response = await api.post('/auth/cadastro', dados);
  return response.data;
}

export async function logout() {
  await AsyncStorage.removeItem('token');
}

export async function isLogado() {
  const token = await AsyncStorage.getItem('token');
  return !!token;
}

export async function cadastrarEspecialista(dados: {
  usuarioId: number;
  nomeCompleto: string;
  credenciais?: string;
  crm?: string;
  especialidade?: string;
  biografia?: string;
  disponivel: boolean;
}) {
  const response = await api.post('/especialistas', dados);
  return response.data;
}