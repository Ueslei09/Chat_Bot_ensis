import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
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

  // 👑 ADICIONADO: Getter para validar se o usuário atual é o Dono do SaaS (SUPER_ADMIN)
  const ehMaster = computed<boolean>(() => {
    if (!usuario.value) return false
    const perfilId = Number(usuario.value.perfil_id || 0)
    const perfilNome = String(usuario.value.perfil || '').toUpperCase()
    return perfilId === 3 || perfilNome === 'SUPER_ADMIN' || perfilNome === 'MASTER'
  })

  const primeiroNome = computed<string>(() => {
    if (!usuario.value?.nome) return ''
    return usuario.value.nome.split(' ')[0]
  })

  // ==========================================
  // AÇÕES (FUNÇÕES)
  // ==========================================
  
  /**
   * Realiza o login, guarda o token e atualiza o estado imediatamente
   */
  async function realizarLogin(email: string, senha: string): Promise<any> {
    try {
      // 1. Limpa qualquer lixo de sessão anterior antes de tentar o novo login
      limparSessao()

      const resposta = await apiLogin(email, senha)
      
      // 🔥 FORÇA BRUTA CONTRA TIMING: Garantimos que o localStorage está populado 
      // usando os dados diretos da resposta da API (ajuste as propriedades se seu back responder diferente)
      if (resposta?.token && resposta?.usuario) {
        localStorage.setItem('token', resposta.token)
        localStorage.setItem('usuario', JSON.stringify(resposta.usuario))
      }

      // 2. Atualiza as refs reativas do Pinia com os dados novos já gravados
      token.value = localStorage.getItem('token')
      usuario.value = obterUsuarioLogado()
      autenticado.value = true

      return resposta 
    } catch (error) {
      limparSessao()
      throw error 
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
   * Limpa o estado da sessão localmente (Garante a higienização do navegador)
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
    ehMaster, // 🚀 Exportado para o Router conseguir ler agora!
    primeiroNome, 
    realizarLogin, 
    logout, 
    limparSessao
  }
})