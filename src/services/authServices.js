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

// ============================================================
// ADICIONE ISSO NO FINAL DO SEU authServices.js JÁ EXISTENTE
// (não substitua o arquivo, só acrescente esta função)
// ============================================================

/**
 * Lê o token salvo e devolve o perfil do usuário ('ADM' ou 'USER'),
 * sem precisar chamar a API de novo. O token JWT tem 3 partes
 * separadas por ponto: cabeçalho.payload.assinatura — decodificamos
 * só o payload (que é Base64) pra ler o que tem dentro.
 */
export function getPerfil() {
  const token = localStorage.getItem('token')
  if (!token) return null

  try {
    const payloadBase64 = token.split('.')[1]
    const payload = JSON.parse(atob(payloadBase64))
    return payload.perfil // 'ADM' ou 'USER'
  } catch {
    return null
  }
}

/** Atalho: true se o usuário logado for ADM. */
export function isAdmin() {
  return getPerfil() === 'ADM'
}

/** Retorna true se existir um token salvo (usuário "logado"). */
export function estaAutenticado() {
  return !!localStorage.getItem('token')
}