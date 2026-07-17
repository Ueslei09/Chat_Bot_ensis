<template>
  <div class="login-page" :style="{ backgroundImage: `url(${bgImage})` }">
    <div class="overlay"></div>

    <div class="login-box">
      <h3 class="mb-3 text-center text-dark">Nova Senha</h3>
      <p class="text-muted text-center mb-4" style="font-size: 13px;">
        Digite e confirme a sua nova senha de acesso.
      </p>

      <form v-if="token" @submit.prevent="alterarSenha">
        <div class="mb-3">
          <label class="form-label">Nova Senha</label>
          <input
            v-model="novaSenha"
            type="password"
            class="form-control"
            placeholder="No mínimo 6 caracteres"
            required
          />
        </div>

        <div class="mb-3">
          <label class="form-label">Confirmar Nova Senha</label>
          <input
            v-model="confirmarSenha"
            type="password"
            class="form-control"
            placeholder="Repita a nova senha"
            required
          />
        </div>

        <p v-if="mensagemErro" class="erro">{{ mensagemErro }}</p>
        <p v-if="mensagemSucesso" class="sucesso">{{ mensagemSucesso }}</p>

        <button type="submit" class="btn btn-primary w-100" :disabled="carregando">
          {{ carregando ? 'Alterando...' : 'Redefinir Senha' }}
        </button>
      </form>

      <div v-else>
        <p class="erro text-center mb-3">Link de recuperação inválido ou expirado.</p>
        <router-link to="/esqueci-senha" class="btn btn-secondary w-100">
          Solicitar novo link
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import bgImage from '@/assets/imagenschatbot/MOVE.png'

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

async function alterarSenha() {
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
</style>