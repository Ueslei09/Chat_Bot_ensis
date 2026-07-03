import api from './api'

/**
 * Faz login na API.
 * @param {string} email
 * @param {string} senha
 * @returns {Promise<object>} dados retornados pela API (contém o token)
 */
export async function login(email, senha) {
  const resposta = await api.post('/auth/login', { email, senha })

  if (resposta.data.token) {
    localStorage.setItem('token', resposta.data.token)
  }

  return resposta.data
}

/** Remove o token e desconecta o usuário. */
export function logout() {
  localStorage.removeItem('token')
}

/** Retorna true se existir um token salvo (usuário "logado"). */
export function estaAutenticado() {
  return !!localStorage.getItem('token')
}