import axios from 'axios';
import { io } from 'socket.io-client';

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

// INTERCEPTOR DE RESPOSTA: Se o token expirar, desloga o usuário na hora
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token inválido ou expirado -> Limpa tudo e manda pro Login
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================================
// 2. CONFIGURAÇÃO DO SOCKET.IO (Tempo Real)
// ============================================================
// Iniciamos com autoConnect: false para não tentar conectar sem login
export const socket = io(API_URL, {
  autoConnect: false,
  auth: (cb) => {
    // Busca o token atualizado toda vez que tentar conectar/reconectar
    cb({ token: localStorage.getItem('token') });
  }
});