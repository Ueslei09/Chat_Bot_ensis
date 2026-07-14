// Ajustado para importar a constante nomeada { api } do api.js
import { api } from './api'

export async function listarContatos(filtros = {}) {
  const resposta = await api.get('/contatos', { params: filtros })
  return resposta.data
}

export async function criarContato(dados) {
  const resposta = await api.post('/contatos', dados)
  return resposta.data
}

export async function atualizarContato(id, dados) {
  const resposta = await api.put(`/contatos/${id}`, dados)
  return resposta.data
}

export async function excluirContato(id) {
  const resposta = await api.delete(`/contatos/${id}`)
  return resposta.data
}

export async function importarContatos(contatos) {
  const resposta = await api.post('/contatos/importar', { contatos })
  return resposta.data
}

export async function arquivarContato(id) {
  const resposta = await api.put(`/contatos/${id}/arquivar`)
  return resposta.data
}

export async function desarquivarContato(id) {
  const resposta = await api.put(`/contatos/${id}/desarquivar`)
  return resposta.data
}