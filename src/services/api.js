import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth'; // Importamos a store central de autenticação

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ============================================================
// 1. CONFIGURAÇÃO DO AXIOS (HTTP)
// ============================================================
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// INTERCEPTOR: Adiciona o Token JWT automaticamente em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// INTERCEPTOR DE RESPOSTA: Se o token expirar (401), desloga o usuário reativamente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('⚠️ Sessão expirada ou não autorizada. Desconectando usuário...');
      
      // Obtém a instância da Store de Autenticação de forma limpa e segura
      const authStore = useAuthStore();
      
      // Limpa as variáveis do Pinia, fecha o socket de forma segura e redireciona via Vue Router
      authStore.logout();
    }
    return Promise.reject(error);
  }
);

// ============================================================
// 2. CONFIGURAÇÃO DO SOCKET.IO (Tempo Real)
// ============================================================
export const socket = io(API_URL, {
  autoConnect: false,
  auth: (cb) => {
    // Busca o token atualizado de forma dinâmica
    cb({ token: localStorage.getItem('token') });
  }
});

// OUVINTE DE SEGURANÇA: Se o servidor rejeitar a conexão (Token expirado no Handshake)
socket.on('connect_error', (error) => {
  if (error.message === 'xhr poll error' || error.message === 'Authentication error') {
    console.error('❌ Falha de autenticação no Socket.IO. Desconectando...', error.message);
    const authStore = useAuthStore();
    authStore.logout();
  }
});