// Ajustado para importar a constante nomeada { api } do api.js
import { api } from './api'

/** Lista respostas rápidas, com busca opcional. */
export async function listarRespostasRapidas(busca = '') {
  const resposta = await api.get('/respostas-rapidas', { params: { busca: busca || undefined } })
  return resposta.data
}

/** Cria uma nova resposta rápida. */
export async function criarRespostaRapida(dados) {
  const resposta = await api.post('/respostas-rapidas', dados)
  return resposta.data
}

/** Atualiza uma resposta rápida existente. */
export async function atualizarRespostaRapida(id, dados) {
  const resposta = await api.put(`/respostas-rapidas/${id}`, dados)
  return resposta.data
}

/** Exclui uma resposta rápida. */
export async function excluirRespostaRapida(id) {
  const resposta = await api.delete(`/respostas-rapidas/${id}`)
  return resposta.data
}