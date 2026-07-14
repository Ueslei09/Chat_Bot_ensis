// ============================================================
// usuariosServices.js
// ------------------------------------------------------------
// Chamadas para a rota /usuarios da API
// ============================================================

// Ajustado para importar a constante nomeada { api } do api.js
import { api } from './api'

/** Lista os perfis disponíveis (ADM, USER) para popular o dropdown. */
export async function listarPerfis() {
  const resposta = await api.get('/usuarios/perfis')
  return resposta.data
}

/**
 * Cria um novo usuário (Só ADM).
 * @param {{nome:string, email:string, senha:string, perfil_id:number}} dados
 */
export async function criarUsuario(dados) {
  const resposta = await api.post('/usuarios', dados)
  return resposta.data
}

/**
 * Bloqueia (desativa) um usuário pelo id (Só ADM).
 * @param {number} id
 */
export async function bloquearUsuario(id) {
  const resposta = await api.put(`/usuarios/${id}/bloquear`)
  return resposta.data
}

/** Lista todos os usuários cadastrados (Só ADM). */
export async function listarUsuarios() {
  const resposta = await api.get('/usuarios')
  return resposta.data
}

/** Desbloqueia (reativa) um usuário pelo id (Só ADM). */
export async function desbloquearUsuario(id) {
  const resposta = await api.put(`/usuarios/${id}/desbloquear`)
  return resposta.data
}

/**
 * Liga/desliga a permissão de um usuário apagar mensagens (Só ADM).
 * @param {number} id
 * @param {boolean} permitir
 */
export async function alternarPermissaoApagar(id, permitir) {
  const resposta = await api.put(`/usuarios/${id}/permissao-apagar`, { permitir })
  return resposta.data
}

/** Lista id e nome dos usuários ativos (para dropdown de transferência de chamados). */
export async function listarAtendentes() {
  const resposta = await api.get('/usuarios/atendentes')
  return resposta.data
}

/** Atualiza o nome do próprio usuário logado. */
export async function atualizarMeuNome(nome) {
  const resposta = await api.put('/usuarios/meu-perfil', { nome })
  return resposta.data
}