import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
// @ts-ignore (evita que o TS reclame de importar arquivos .js sem tipagem declarada)
// @ts-ignore
// @ts-ignore
import { login as apiLogin, estaAutenticado, obterUsuarioLogado, isAdmin } from '@/services/authServices.js'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  // ==========================================
  // ESTADO (REFS)
  // ==========================================
  const token = ref<string | null>(localStorage.getItem('token') || null)
  const usuario = ref<any>(obterUsuarioLogado())
  const autenticado = ref<boolean>(estaAutenticado())

  // ==========================================
  // GETTERS (COMPUTED)
  // ==========================================
  const eAdministrador = computed<boolean>(() => {
    return usuario.value?.perfil === 'ADM' || isAdmin()
  })

  const primeiroNome = computed<string>(() => {
    if (!usuario.value?.nome) return ''
    return usuario.value.nome.split(' ')[0]
  })

  // ==========================================
  // AÇÕES (FUNÇÕES)
  // ==========================================
  
  /**
   * Realiza o login, guarda o token e redireciona para o painel de chamados
   */
  async function realizarLogin(email: string, senha: string): Promise<any> {
    try {
      const resposta = await apiLogin(email, senha)
      
      // Atualiza as refs reativas do Pinia
      token.value = localStorage.getItem('token')
      usuario.value = obterUsuarioLogado()
      autenticado.value = true

      // Redireciona com segurança
      router.push('/app/chamados')
      return resposta
    } catch (error) {
      limparSessao()
      throw error // Repassa o erro para a tela de login tratar visualmente
    }
  }

  /**
   * Desloga o usuário e limpa as credenciais locais
   */
  function logout(): void {
    limparSessao()
    router.push('/')
  }

  /**
   * Limpa o estado da sessão localmente
   */
  function limparSessao(): void {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    token.value = null
    usuario.value = null
    autenticado.value = false
  }

  return { 
    token, 
    usuario, 
    autenticado, 
    eAdministrador, 
    primeiroNome, 
    realizarLogin, 
    logout, 
    limparSessao
  }
})