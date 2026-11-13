import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import api from './api';

export async function getIdUsuarioLogado(): Promise<number | null> {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) return null;

    // Busca o usuário real autenticado pelo JWT
    try {
      const response = await api.get('/me');
      if (response.data?.id) {
        await AsyncStorage.setItem('usuario', JSON.stringify(response.data));
        return Number(response.data.id);
      }
    } catch {
      // Fallback para cache local caso a requisição falhe momentaneamente
    }

    const salvo = await AsyncStorage.getItem('usuario');
    if (salvo) {
      const u = JSON.parse(salvo);
      if (u.id) return Number(u.id);
    }
    return null;
  } catch {
    return null;
  }
}

export async function getNomeUsuario() {
  try {
    const salvo = await AsyncStorage.getItem('usuario');
    if (salvo) {
      const u = JSON.parse(salvo);
      if (u.nomeCompleto) return u.nomeCompleto;
    }
    const response = await api.get('/me');
    return response.data?.nomeCompleto || null;
  } catch {
    return null;
  }
}

export async function getTipoUsuario() {
  try {
    const salvo = await AsyncStorage.getItem('usuario');
    if (salvo) {
      const u = JSON.parse(salvo);
      if (u.tipo) return u.tipo;
    }
    const response = await api.get('/me');
    return response.data?.tipo || null;
  } catch {
    return null;
  }
}

export async function getEmailUsuario() {
  try {
    const salvo = await AsyncStorage.getItem('usuario');
    if (salvo) {
      const u = JSON.parse(salvo);
      if (u.email) return u.email;
    }
    const token = await AsyncStorage.getItem('token');
    if (token) {
      const decoded: any = jwtDecode(token);
      if (decoded?.sub) return decoded.sub;
    }
    const response = await api.get('/me');
    return response.data?.email || null;
  } catch {
    return null;
  }
}

export async function getIdEspecialistaLogado() {
  try {
    const response = await api.get('/especialistas');
    const token = await AsyncStorage.getItem('token');
    if (!token) return null;
    const decoded: any = jwtDecode(token);
    const email = decoded.sub;
    const usuario = await api.get('/cadastros');
    const usuarioLogado = usuario.data.content.find((u: any) => u.email === email);
    if (!usuarioLogado) return null;
    const especialista = response.data.content.find((e: any) => e.usuarioId === usuarioLogado.id);
    return especialista?.id || null;
  } catch {
    return null;
  }
}