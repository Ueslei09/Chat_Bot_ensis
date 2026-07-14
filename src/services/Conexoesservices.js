// Ajustado para importar a constante nomeada { api } do api.js
import { api } from './api'

/**
 * Lista as conexões cadastradas.
 * @param {{arquivadas?: boolean}} filtros
 */
export async function listarConexoes(filtros = {}) {
  const resposta = await api.get('/conexoes', { params: filtros })
  return resposta.data
}