// Ajustado para importar usando Named Imports, combinando com o nosso api.js
import { api, socket } from './api'

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
  
  // Se a API retornar os dados do usuário, salva também para uso rápido
  if (resposta.data.usuario) {
    localStorage.setItem('usuario', JSON.stringify(resposta.data.usuario))
  }

  return resposta.data
}

/** Remove o token, desconecta o Socket.IO e desloga o usuário. */
export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
  
  // 🔥 SEGURANÇA NO WEBSOCKET: Encerra a conexão em tempo real imediatamente
  if (socket && socket.connected) {
    socket.disconnect()
  }
}

/**
 * Lê o token salvo e devolve o perfil do usuário ('ADM' ou 'USER'),
 * sem precisar chamar a API de novo. 
 */
export function getPerfil() {
  const token = localStorage.getItem('token')
  if (!token) return null

  try {
    const payloadBase64 = token.split('.')[1]
    
    // Tratamento seguro para decodificar caracteres especiais/acentos no Base64
    const payloadDecodificado = decodeURIComponent(
      atob(payloadBase64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    
    const payload = JSON.parse(payloadDecodificado)
    return payload.perfil // Retornará 'ADM' ou 'USER'
  } catch {
    return null
  }
}

/** Retorna true se o usuário logado for ADM. */
export function isAdmin() {
  return getPerfil() === 'ADM'
}

/** Retorna true se existir um token salvo (usuário "logado"). */
export function estaAutenticado() {
  return !!localStorage.getItem('token')
}

/** Lê o nome do usuário logado, direto do token. */
export function getNomeUsuario() {
  const token = localStorage.getItem('token')
  if (!token) return null
 
  try {
    const payloadBase64 = token.split('.')[1]
    
    // Decodifica preservando acentos do nome (ex: João, Valéria)
    const payloadDecodificado = decodeURIComponent(
      atob(payloadBase64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    
    const payload = JSON.parse(payloadDecodificado)
    return payload.nome || null
  } catch {
    return null
  }
}

/** Lê o id do usuário logado, direto do token. */
export function getIdUsuario() {
  const token = localStorage.getItem('token')
  if (!token) return null
 
  try {
    const payloadBase64 = token.split('.')[1]
    const payload = JSON.parse(atob(payloadBase64))
    return payload.id || null
  } catch {
    return null
  }
}

/** Lê o objeto completo do usuário salvo localmente. */
export function obterUsuarioLogado() {
  const usuario = localStorage.getItem('usuario')
  if (!usuario) {
    // Se não tiver no localStorage, tenta montar um objeto básico a partir do Token
    const nome = getNomeUsuario()
    const id = getIdUsuario()
    const perfil = getPerfil()
    if (nome || id) return { id, nome, perfil }
    return null
  }
  try {
    return JSON.parse(usuario)
  } catch (e) {
    return null
  }
}