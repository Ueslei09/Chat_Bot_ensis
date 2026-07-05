// ============================================================
// configuracoesServices.js
// ------------------------------------------------------------
// Chamadas para a rota /configuracoes da API (protegida, só ADM)
// ============================================================

import api from './api'

/** Busca todas as configurações salvas. */
export async function listarConfiguracoes() {
  const resposta = await api.get('/configuracoes')
  return resposta.data
}

/**
 * Atualiza o valor de uma configuração.
 * @param {string} chave - ex: 'mensagem_bom_dia'
 * @param {string} valor - novo texto
 */
export async function atualizarConfiguracao(chave, valor) {
  const resposta = await api.put(`/configuracoes/${chave}`, { valor })
  return resposta.data
}