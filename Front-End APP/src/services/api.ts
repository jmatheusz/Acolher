import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Detecção dinâmica do IP do Back-End.
 * No Expo Go (iOS/Android), pega automaticamente o IP do computador
 * onde o Metro Bundler está rodando. Se falhar, usa o IP fixo da máquina.
 */
function getBaseUrl(): string {
  if (Platform.OS === 'web') {
    return 'http://localhost:8080';
  }

  // Pega o IP dinamicamente do host onde o Expo Go conectou
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:8080`;
    }
  }

  // Fallback para variavel de ambiente ou localhost
  return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';
}

const BASE_URL = getBaseUrl();
console.log('[Acolher API] Conectando em:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
