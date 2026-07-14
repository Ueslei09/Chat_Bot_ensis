// Ajustado para importar a constante nomeada { api } do api.js
import { api } from './api'

/**
 * Busca chamados filtrando por status.
 * Usado nas 3 views do painel esquerdo:
 *   'ABERTO'          -> Fila de chamados
 *   'EM_ATENDIMENTO'  -> Atendendo
 *   'FECHADO'         -> Chamados fechados
 * @param {string} status
 */
export async function listarChamadosPorStatus(status) {
  const resposta = await api.get('/chamados', { params: { status } })
  return resposta.data
}

/**
 * Cria um novo chamado (abre atendimento) vinculado a um cliente.
 * @param {number} clienteId
 */
export async function criarChamado(clienteId) {
  const resposta = await api.post('/chamados', { cliente_id: clienteId })
  return resposta.data
}

/**
 * Assume um chamado da fila (vira o atendente responsável).
 * @param {number} chamadoId
 */
export async function assumirChamado(chamadoId) {
  const resposta = await api.put(`/chamados/${chamadoId}/assumir`)
  return resposta.data
}

/**
 * Transfere o chamado para outro atendente.
 * @param {number} chamadoId
 * @param {number} paraUsuarioId
 */
export async function transferirChamado(chamadoId, paraUsuarioId) {
  const resposta = await api.put(`/chamados/${chamadoId}/transferir`, {
    para_usuario: paraUsuarioId
  })
  return resposta.data
}

/**
 * Fecha (encerra) um chamado.
 * @param {number} chamadoId
 */
export async function fecharChamado(chamadoId) {
  const resposta = await api.put(`/chamados/${chamadoId}/fechar`)
  return resposta.data
}

/**
 * Reabre um chamado fechado (volta pra fila).
 * @param {number} chamadoId
 */
export async function reabrirChamado(chamadoId) {
  const resposta = await api.put(`/chamados/${chamadoId}/reabrir`)
  return resposta.data
}

/** Busca os detalhes completos de um chamado (cliente, histórico, arquivos). */
export async function buscarDetalhesChamado(chamadoId) {
  const resposta = await api.get(`/chamados/${chamadoId}/detalhes`)
  return resposta.data
}
 
/** Atualiza tags e observações de um chamado. */
export async function atualizarDetalhesChamado(chamadoId, dados) {
  const resposta = await api.put(`/chamados/${chamadoId}/detalhes`, dados)
  return resposta.data
}

/** Retoma um chamado que estava aguardando cliente (volta pra EM_ATENDIMENTO). */
export async function retomarChamado(chamadoId) {
  const resposta = await api.put(`/chamados/${chamadoId}/retomar`)
  return resposta.data
}
 
/** Marca um chamado em atendimento como aguardando resposta do cliente. */
export async function marcarAguardandoCliente(chamadoId) {
  const resposta = await api.put(`/chamados/${chamadoId}/aguardar-cliente`)
  return resposta.data
}