// ============================================================
// ApiBanco.js
// ------------------------------------------------------------
// Este arquivo é o ÚNICO lugar do front-end que fala com a
// API Node.js (que por sua vez fala com o PostgreSQL).
//
// Ideia: em vez de espalhar "axios.get(...)" em vários
// componentes Vue, centralizamos tudo aqui. Assim, se a URL
// da API mudar, você só corrige em um lugar.
// ============================================================

// Importa o axios, biblioteca usada para fazer requisições HTTP
import axios from 'axios'

// ------------------------------------------------------------
// 1) INSTÂNCIA BASE DO AXIOS
// ------------------------------------------------------------
// Aqui criamos uma "versão configurada" do axios, já apontando
// para o endereço da sua API Node.js (serve.js na porta 3000).
const api = axios.create({
  baseURL: 'http://localhost:3000', // troque se subir em outra porta/domínio
  headers: {
    'Content-Type': 'application/json'
  }
})

// ------------------------------------------------------------
// 2) INTERCEPTOR DE REQUISIÇÃO (injeta o token JWT)
// ------------------------------------------------------------
// Antes de CADA requisição sair, esse código roda e adiciona
// automaticamente o token salvo no localStorage no cabeçalho
// Authorization. Assim você não precisa repetir isso em cada
// função lá embaixo.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ------------------------------------------------------------
// 3) INTERCEPTOR DE RESPOSTA (trata token expirado/inválido)
// ------------------------------------------------------------
// Se a API responder 401 (não autorizado), significa que o
// token expirou ou é inválido. Aqui limpamos o login e mandamos
// o usuário de volta pra tela de login.
api.interceptors.response.use(
  (response) => response, // se deu certo, só repassa a resposta
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ============================================================
// 4) FUNÇÕES DE AUTENTICAÇÃO (/auth)
// ============================================================

/**
 * Faz login na API.
 * @param {string} email
 * @param {string} senha
 * @returns {Promise<object>} dados retornados pela API (contém o token)
 */
export async function login(email, senha) {
  const resposta = await api.post('/auth/login', { email, senha })

  // Salva o token no navegador para ser usado nas próximas requisições
  if (resposta.data.token) {
    localStorage.setItem('token', resposta.data.token)
  }

  return resposta.data
}

/** Remove o token e desconecta o usuário. */
export function logout() {
  localStorage.removeItem('token')
}

/** Retorna true se existir um token salvo (usuário "logado"). */
export function estaAutenticado() {
  return !!localStorage.getItem('token')
}

// ============================================================
// 5) FUNÇÕES DE USUÁRIOS (/usuarios) — ações de ADM
// ============================================================

/**
 * Cria um novo usuário (ADM ou USER).
 * @param {{nome:string, email:string, senha:string, perfil_id:number}} dados
 */
export async function criarUsuario(dados) {
  const resposta = await api.post('/usuarios', dados)
  return resposta.data
}

/**
 * Bloqueia (desativa) um usuário pelo id.
 * @param {number} id
 */
export async function bloquearUsuario(id) {
  const resposta = await api.put(`/usuarios/${id}/bloquear`)
  return resposta.data
}

// ============================================================
// 6) FUNÇÕES DE CHAMADOS (/chamados)
// ============================================================

/**
 * Busca chamados filtrando por status.
 * Usado nas 3 views do painel esquerdo:
 *   'ABERTO'          -> Fila de chamados
 *   'EM_ATENDIMENTO'  -> Atendendo
 *   'FECHADO'         -> Chamados fechados
 * @param {string} status
 */
export async function listarChamadosPorStatus(status) {
  const resposta = await api.get('/chamados', {
    params: { status }
  })
  return resposta.data
}

/**
 * Cria um novo chamado (abre atendimento) vinculado a um cliente.
 * @param {number} cliente_id
 */
export async function criarChamado(cliente_id) {
  const resposta = await api.post('/chamados', { cliente_id })
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

// ============================================================
// 7) FUNÇÕES DE MENSAGENS (/mensagens) — área de chat
// ============================================================

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
 * Apaga (soft delete) uma mensagem. Normalmente restrito a ADM.
 * @param {number} mensagemId
 */
export async function apagarMensagem(mensagemId) {
  const resposta = await api.delete(`/mensagens/${mensagemId}`)
  return resposta.data
}

// ============================================================
// 8) EXPORTA A INSTÂNCIA BASE (caso precise de algo customizado)
// ============================================================
export default api