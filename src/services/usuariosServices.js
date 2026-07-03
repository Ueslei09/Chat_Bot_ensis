import api from './api'

/**
 * Cria um novo usuário (ADM ou USER). Restrito a ADM.
 * @param {{nome:string, email:string, senha:string, perfil_id:number}} dados
 */
export async function criarUsuario(dados) {
  const resposta = await api.post('/usuarios', dados)
  return resposta.data
}

/**
 * Bloqueia (desativa) um usuário pelo id. Restrito a ADM.
 * @param {number} id
 */
export async function bloquearUsuario(id) {
  const resposta = await api.put(`/usuarios/${id}/bloquear`)
  return resposta.data
}