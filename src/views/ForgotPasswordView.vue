<template>
  <div class="login-page" :style="{ backgroundImage: `url(${bgImage})` }">
    <div class="overlay"></div>

    <div class="login-box">
      <h3 class="mb-3 text-center text-dark">Recuperar Senha</h3>
      <p class="text-muted text-center mb-4" style="font-size: 13px;">
        Insira o seu e-mail cadastrado para receber um link de redefinição.
      </p>

      <form @submit.prevent="solicitarRecuperacao">
        <div class="mb-3">
          <label class="form-label">E-mail de Cadastro</label>
          <input
            v-model="email"
            type="email"
            class="form-control"
            placeholder="exemplo@empresa.com"
            required
          />
        </div>

        <p v-if="mensagemErro" class="erro">{{ mensagemErro }}</p>
        <p v-if="mensagemSucesso" class="sucesso">{{ mensagemSucesso }}</p>

        <button type="submit" class="btn btn-primary w-100 mb-3" :disabled="carregando">
          {{ carregando ? 'Processando...' : 'Enviar Link' }}
        </button>
      </form>

      <router-link to="/login" class="link-voltar">
        Voltar para o Login
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// PARA (com chaves para pegar o export nomeado):
import { api } from '@/services/api'
import bgImage from '@/assets/imagenschatbot/MOVE.png'

const email = ref('')
const carregando = ref(false)
const mensagemSucesso = ref('')
const mensagemErro = ref('')

async function solicitarRecuperacao() {
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
</script>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
}

.login-box {
  position: relative;
  z-index: 1;
  background: #ffffff;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 380px;
}

.erro {
  color: #c0392b;
  font-size: 13px;
  margin-bottom: 8px;
}

.sucesso {
  color: #27ae60;
  font-size: 13px;
  margin-bottom: 8px;
}

.link-voltar {
  display: block;
  text-align: center;
  font-size: 13px;
  color: #1a3c6e;
  text-decoration: none;
}
.link-voltar:hover {
  text-decoration: underline;
}
</style>