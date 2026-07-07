// ============================================================
// contatosServices.js
// ------------------------------------------------------------
// Chamadas para a rota /contatos da API
// ============================================================

import api from './api'

/**
 * Lista contatos, com filtros opcionais.
 * @param {{busca?: string, conexao?: string}} filtros
 */
export async function listarContatos(filtros = {}) {
  const resposta = await api.get('/contatos', { params: filtros })
  return resposta.data
}

/**
 * Cria um novo contato.
 * @param {{nome:string, telefone:string, conexao:string}} dados
 */
export async function criarContato(dados) {
  const resposta = await api.post('/contatos', dados)
  return resposta.data
}

/**
 * Atualiza um contato existente.
 * @param {number} id
 * @param {{nome:string, telefone:string, conexao:string}} dados
 */
export async function atualizarContato(id, dados) {
  const resposta = await api.put(`/contatos/${id}`, dados)
  return resposta.data
}

/**
 * Exclui um contato.
 * @param {number} id
 */
export async function excluirContato(id) {
  const resposta = await api.delete(`/contatos/${id}`)
  return resposta.data
}

/**
 * Importa vários contatos de uma vez.
 * @param {Array<{nome:string, telefone:string, conexao:string}>} contatos
 */
export async function importarContatos(contatos) {
  const resposta = await api.post('/contatos/importar', { contatos })
  return resposta.data
}

/** Arquiva um contato (esconde da listagem sem apagar). */
export async function arquivarContato(id) {
  const resposta = await api.put(`/contatos/${id}/arquivar`)
  return resposta.data
}
 
/** Desarquiva um contato. */
export async function desarquivarContato(id) {
  const resposta = await api.put(`/contatos/${id}/desarquivar`)
  return resposta.data
}
 