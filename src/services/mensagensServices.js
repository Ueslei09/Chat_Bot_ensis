// Ajustado para importar a constante nomeada { api } do api.js
import { api } from './api'
import axios from 'axios';

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

 // Importe a instância que já tem o baseUrl configurado para localhost:3000

export async function enviarArquivo(formData) {
  // Use a instância 'api' em vez de 'axios' para garantir que ele vá para a porta correta
  const resposta = await api.post('/mensagens/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return resposta.data;
}
/**
 * Monta a URL completa de um arquivo (o backend guarda só o caminho relativo).
 * @param {string} caminho - ex: '/uploads/123-foto.png'
 */
export function urlArquivo(caminho) {
  const baseURL = api.defaults.baseURL
  return `${baseURL}${caminho}`
}

/** Edita o texto de uma mensagem já enviada. */
export async function editarMensagem(id, conteudo) {
  const resposta = await api.put(`/mensagens/${id}`, { conteudo })
  return resposta.data
}
 
/** Encaminha uma mensagem existente para outro chamado. */
export async function encaminharMensagem(id, chamadoIdDestino) {
  const resposta = await api.post(`/mensagens/${id}/encaminhar`, {
    chamado_id_destino: chamadoIdDestino
  })
  return resposta.data
}

