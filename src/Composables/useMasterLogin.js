// src/composables/useMasterLogin.js
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function useMasterLogin() {
  const email = ref('')
  const senha = ref('')
  const erro = ref('')
  const carregando = ref(false)

  const router = useRouter()
  const authStore = useAuthStore()

  const handleMasterLogin = async () => {
    try {
      erro.value = ''
      carregando.value = true

      console.log('--- ENVIANDO LOGIN MASTER ---')
      
      const resposta = await authStore.realizarLogin(email.value, senha.value)
      const dadosDoServidor = resposta?.data?.user || resposta?.user || authStore.usuario

      console.log('=== AUDITORIA DE LOGIN MASTER ===')
      console.log('Objeto completo do usuário retornado:', dadosDoServidor)

      if (dadosDoServidor) {
        const idPerfil = String(dadosDoServidor.perfil_id || dadosDoServidor.profileId || '')
        const nomePerfil = String(dadosDoServidor.perfil || dadosDoServidor.profile || '').toUpperCase()

        console.log('ID do Perfil extraído:', idPerfil)
        console.log('Nome do Perfil extraído:', nomePerfil)

        const eMaster = idPerfil === '3' || 
                        nomePerfil === 'MASTER' || 
                        nomePerfil === 'SUPER_ADMIN' || 
                        nomePerfil === 'SUPERADMIN'
        if (eMaster) {
          console.log('Acesso Master Autorizado pelo Servidor!')
          router.push('/master/empresas')
        } else {
          console.error('O Servidor não confirmou este usuário como MASTER.')
          erro.value = 'Acesso restrito apenas ao administrador do SaaS.'
          authStore.limparSessao()
        }
      } else {
        erro.value = 'Não foi possível ler os dados do usuário vindos do servidor.'
        authStore.limparSessao()
      }

    } catch (err) {
      console.error('Erro na requisição de login:', err)
      erro.value = err.response?.data?.message || 'Chave de acesso ou senha incorreta.'
    } finally {
      carregando.value = false
    }
  }

  return {
    email,
    senha,
    erro,
    carregando,
    handleMasterLogin
  }
}