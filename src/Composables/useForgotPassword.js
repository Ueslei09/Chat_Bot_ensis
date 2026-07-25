// src/composables/useForgotPassword.js
import { ref } from 'vue'
import { api } from '@/services/api'

export function useForgotPassword() {
  const email = ref('')
  const carregando = ref(false)
  const mensagemSucesso = ref('')
  const mensagemErro = ref('')

  const solicitarRecuperacao = async () => {
    if (!email.value) {
      mensagemErro.value = 'Por favor, insira o seu e-mail.'
      return
    }

    carregando.value = true
    mensagemErro.value = ''
    mensagemSucesso.value = ''

    try {
      await api.post('/auth/esqueci-senha', { email: email.value })
      mensagemSucesso.value = 'Se cadastrado, um link foi enviado para o seu e-mail.'
      email.value = ''
    } catch (error) {
      mensagemErro.value = error.response?.data?.erro || 'Erro ao processar solicitação.'
    } finally {
      carregando.value = false
    }
  }

  return {
    email,
    carregando,
    mensagemSucesso,
    mensagemErro,
    solicitarRecuperacao
  }
}