// ============================================================
// usuariosServices.js
// ------------------------------------------------------------
// Chamadas para a rota /usuarios da API (protegida, só ADM)
// ============================================================

import api from './api'

/** Lista os perfis disponíveis (ADM, USER) para popular o dropdown. */
export async function listarPerfis() {
  const resposta = await api.get('/usuarios/perfis')
  return resposta.data
}

/**
 * Cria um novo usuário.
 * @param {{nome:string, email:string, senha:string, perfil_id:number}} dados
 */
export async function criarUsuario(dados) {
  const resposta = await api.post('/usuarios', dados)
  return resposta.data
}

/**
 * Bloqueia (desativa) um usuário pelo id.
 * @param {number} id
 */
export async function bloquearUsuario(id) {
  const resposta = await api.put(`/usuarios/${id}/bloquear`)
  return resposta.data
}
// ============================================================
// ADICIONE ESTAS DUAS FUNÇÕES no final do seu usuariosServices.js
// (junto com listarPerfis, criarUsuario e bloquearUsuario)
// ============================================================
 
/** Lista todos os usuários cadastrados. */
export async function listarUsuarios() {
  const resposta = await api.get('/usuarios')
  return resposta.data
}
 
/** Desbloqueia (reativa) um usuário pelo id. */
export async function desbloquearUsuario(id) {
  const resposta = await api.put(`/usuarios/${id}/desbloquear`)
  return resposta.data
}
 // ============================================================
// ADICIONE ESTA FUNÇÃO no final do seu usuariosServices.js
// ============================================================
 
/**
 * Liga/desliga a permissão de um usuário apagar mensagens.
 * @param {number} id
 * @param {boolean} permitir
 */
export async function alternarPermissaoApagar(id, permitir) {
  const resposta = await api.put(`/usuarios/${id}/permissao-apagar`, { permitir })
  return resposta.data
}

// ============================================================
// ADICIONE ESTA FUNÇÃO no final do seu usuariosServices.js
// ============================================================
 
/** Lista id e nome dos usuários ativos (pra dropdown de transferência). */
export async function listarAtendentes() {
  const resposta = await api.get('/usuarios/atendentes')
  return resposta.data
}
 // ============================================================
// ADICIONE no usuariosServices.js
// ============================================================

/** Atualiza o nome do próprio usuário logado. */
export async function atualizarMeuNome(nome) {
  const resposta = await api.put('/usuarios/meu-perfil', { nome })
  return resposta.data
}