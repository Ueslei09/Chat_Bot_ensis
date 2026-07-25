// src/composables/useResetPassword.js
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

export function useResetPassword() {
  const novaSenha = ref('')
  const confirmarSenha = ref('')
  const token = ref('')
  const carregando = ref(false)
  const mensagemSucesso = ref('')
  const mensagemErro = ref('')

  const route = useRoute()
  const router = useRouter()

  onMounted(() => {
    token.value = route.query.token || ''
  })

  const alterarSenha = async () => {
    if (novaSenha.value !== confirmarSenha.value) {
      mensagemErro.value = 'As senhas não coincidem!'
      return
    }

    if (novaSenha.value.length < 6) {
      mensagemErro.value = 'A senha deve conter no mínimo 6 caracteres.'
      return
    }

    carregando.value = true
    mensagemErro.value = ''
    mensagemSucesso.value = ''

    try {
      await api.post('/auth/redefinir-senha', {
        token: token.value,
        novaSenha: novaSenha.value
      })

      mensagemSucesso.value = 'Senha alterada com sucesso! Redirecionando...'
      setTimeout(() => {
        router.push('/login')
      }, 2500)
    } catch (error) {
      mensagemErro.value = error.response?.data?.erro || 'Falha ao redefinir a senha.'
    } finally {
      carregando.value = false
    }
  }

  return {
    novaSenha,
    confirmarSenha,
    token,
    carregando,
    mensagemSucesso,
    mensagemErro,
    alterarSenha
  }
}