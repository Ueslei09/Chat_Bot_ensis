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
/**
 * Envia um arquivo (imagem, áudio ou PDF) anexado a um chamado.
 * @param {number} chamadoId
 * @param {File} arquivo - objeto File vindo de um <input type="file">
 */
export async function enviarArquivo(chamadoId, arquivo) {
  const formData = new FormData()
  formData.append('chamado_id', chamadoId)
  formData.append('arquivo', arquivo)
 
  const resposta = await api.post('/mensagens/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return resposta.data
}
 
/**
 * Monta a URL completa de um arquivo (o backend guarda só o caminho relativo).
 * @param {string} caminho - ex: '/uploads/123-foto.png'
 */
export function urlArquivo(caminho) {
  const baseURL = api.defaults.baseURL
  return `${baseURL}${caminho}`
}