<template>
  <div class="login-page1" :style="{ backgroundImage: `url(${bgImage})` }">
    <div class="login-box">
      <h3 class="mb-4 text-center text-dark">Acesso Administrativo</h3>

      <form @submit.prevent="entrar">
        <div class="mb-3">
          <label class="form-label">E-mail</label>
          <input
            v-model="email"
            type="email"
            class="form-control"
            placeholder="admin@ensis.com"
            required
          />
        </div>

        <div class="mb-3">
          <label class="form-label">Senha</label>
          <input
            v-model="senha"
            type="password"
            class="form-control"
            placeholder="Digite sua senha"
            required
          />
        </div>

        <p v-if="erro" class="erro">{{ erro }}</p>

        <button type="submit" class="btn btn-primary w-100" :disabled="carregando">
          {{ carregando ? 'Entrando...' : 'Entrar como ADM' }}
        </button>
      </form>

      <router-link to="/" class="link-voltar">
        Não sou administrador, voltar
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { socket } from '@/services/api.js'

// Imagem de fundo
import bgImage from '@/assets/imagenschatbot/MOVE.png'

const email = ref('')
const senha = ref('')
const erro = ref('')
const carregando = ref(false)

const router = useRouter()
const authStore = useAuthStore()

async function entrar() {
  erro.value = ''
  carregando.value = true

  try {
    // 1. Faz o login centralizado pela authStore
    await authStore.realizarLogin(email.value, senha.value)

    // 2. TRAVA DE SEGURANÇA: Só deixa passar se o usuário logado for de fato Administrador
    if (!authStore.eAdministrador) {
      // Login funcionou, mas a conta não é administrativa.
      // Desfazemos a sessão local e barramos a entrada.
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
</script>

<style scoped>
/* Ocupa a tela inteira e cobre com a imagem de fundo */
.login-page1 {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-box {
  background: #fff;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 360px;
}
.erro {
  color: #c0392b;
  font-size: 13px;
  margin-bottom: 8px;
}
.link-voltar {
  display: block;
  text-align: center;
  margin-top: 16px;
  font-size: 13px;
  color: #666;
  text-decoration: none;
}
.link-voltar:hover {
  text-decoration: underline;
}
</style>