// ============================================================
// configuracoesServices.js
// ------------------------------------------------------------
// Chamadas para a rota /configuracoes da API (protegida, só ADM)
// ============================================================

// Ajustado para importar a constante nomeada { api } do api.js
import { api } from './api'

/** Busca todas as configurações salvas. */
export async function listarConfiguracoes() {
  const resposta = await api.get('/configuracoes')
  return resposta.data
}

/**
 * Atualiza o valor de uma configuração.
 * @param {string} chaves - ex: 'mensagem_bom_dia'
 * @param {string} valor - novo texto
 */
export async function atualizarConfiguracao(chaves, valor) {
  const resposta = await api.put(`/configuracoes/${chaves}`, { valor })
  return resposta.data
}