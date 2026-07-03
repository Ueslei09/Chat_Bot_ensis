// ============================================================
// api.js
// ------------------------------------------------------------
// Instância base do axios, compartilhada por todos os
// serviços (auth, usuarios, chamados, mensagens).
// Contém apenas configuração — nenhuma chamada de rota fica
// aqui, isso vai em cada *.service.js.
// ============================================================

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Injeta o token JWT em toda requisição, se existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Se a API responder 401, o token expirou/é inválido:
// limpa o login e manda o usuário pra tela de login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api