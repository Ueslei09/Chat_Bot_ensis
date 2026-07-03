import api from './api'

/**
 * Lista as mensagens de um chamado específico.
 * @param {number} chamadoId
 */
export async function listarMensagens(chamadoId) {
  const resposta = await api.get(`/mensagens/${chamadoId}`)
  return resposta.data
}

/**
 * Envia uma nova mensagem (texto, imagem, áudio ou PDF).
 * @param {{chamado_id:number, tipo:'TEXTO'|'IMAGEM'|'AUDIO'|'PDF', conteudo:string}} dados
 */
export async function enviarMensagem(dados) {
  const resposta = await api.post('/mensagens', dados)
  return resposta.data
}

/**
 * Apaga (soft delete) uma mensagem.
 * @param {number} mensagemId
 */
export async function apagarMensagem(mensagemId) {
  const resposta = await api.delete(`/mensagens/${mensagemId}`)
  return resposta.data
}