// src/composables/useAdminLogin.js
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { socket } from '@/services/api.js'

export function useAdminLogin() {
  const email = ref('')
  const senha = ref('')
  const erro = ref('')
  const carregando = ref(false)

  const router = useRouter()
  const authStore = useAuthStore()

  const entrar = async () => {
    erro.value = ''
    carregando.value = true

    try {
      // 1. Faz o login centralizado pela authStore
      await authStore.realizarLogin(email.value, senha.value)

      // 2. TRAVA DE SEGURANÇA: Só deixa passar se o usuário logado for de fato Administrador
      if (!authStore.eAdministrador) {
        authStore.limparSessao()
        erro.value = 'Esta conta não tem permissão de administrador.'
        return
      }

      // 3. Conectamos o Socket.IO agora que o token administrativo está seguro
      socket.connect()

      // 4. Se é ADM, redireciona direto para a área de configurações
      router.push('/app/configuracoes')

    } catch (err) {
      erro.value = err.response?.data?.erro || 'E-mail ou senha inválidos'
    } finally {
      carregando.value = false
    }
  }

  return {
    email,
    senha,
    erro,
    carregando,
    entrar
  }
}