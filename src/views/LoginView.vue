<template>
  <!--
    login-page: ocupa a tela inteira (100vh) e usa a imagem
    importada como fundo, cobrindo tudo (background-size: cover)
  -->
  <div class="login-page" :style="{ backgroundImage: `url(${bgImage})` }">

    <!-- Camada escura por cima da imagem, só pra dar contraste com o texto -->
    <div class="overlay"></div>

    <!-- Cartão do formulário, flutuando centralizado por cima da imagem -->
    <div class="login-box">
      <h3 class="mb-4 text-center text-dark">Moove Chat-Multi</h3>

      <form @submit.prevent="login">
        <div class="mb-3">
          <label class="form-label">Usuário</label>
          <input
            v-model="usuario"
            type="text"
            class="form-control"
            placeholder="Digite seu usuário"
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
          <!-- 💡 LINK ADICIONADO AQUI -->
          <div class="forgot-wrapper">
            <router-link to="/esqueci-senha" class="link-forgot">
              Esqueci a senha?
            </router-link>
          </div>
        </div>

        <!-- Mostra erro de login, se houver -->
        <p v-if="erro" class="erro">{{ erro }}</p>

        <button type="submit" class="btn btn-primary w-100" :disabled="carregando">
          {{ carregando ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
 
      <router-link to="/admin-login" class="link-admin">
        Usuário administrador
      </router-link>
    </div>
  </div>
</template>

<script setup>
// Estados reativos do formulário
import { ref } from 'vue'

// Importa a Store de autenticação global do Pinia
import { useAuthStore } from '@/stores/auth'

// Importa o cliente Socket.IO para conectá-lo assim que o login for aprovado
import { socket } from '@/services/api.js'

// Imagem de fundo
import bgImage from '@/assets/imagenschatbot/MOVE.png'

const usuario = ref('') // Esse campo receberá o e-mail do usuário
const senha = ref('')
const erro = ref('')
const carregando = ref(false)

const authStore = useAuthStore()

// Chamado ao enviar o formulário
async function login() {
  erro.value = ''
  carregando.value = true

  try {
    // 1. Dispara a ação de login na Store centralizadora do Pinia
    await authStore.realizarLogin(usuario.value, senha.value)

    // 2. Conectamos o Socket com segurança, já que o JWT está salvo
    socket.connect()
    
  } catch (err) {
    // Trata e expõe o erro do backend de forma limpa na tela
    erro.value = err.response?.data?.erro || 'E-mail ou senha inválidos'
  } finally {
    carregando.value = false
  }
}
</script>

<style scoped>
/* Ocupa a tela inteira e cobre com a imagem de fundo */
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

/* Camada escura semi-transparente por cima da imagem (contraste) */
.overlay {
  position: absolute;
  inset: 0; /* cobre top/right/bottom/left = 0 */
  background: rgba(0, 0, 0, 0.45);
}

/* Cartão do formulário, flutuando acima da imagem e do overlay */
.login-box {
  position: relative; /* fica acima do overlay por causa do z-index implícito */
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
.link-admin {
  display: block;
  text-align: center;
  margin-top: 16px;
  font-size: 13px;
  color: #1a3c6e;
  text-decoration: none;
}
.link-admin:hover {
  text-decoration: underline;
}

/* 💡 ESTILOS ADICIONADOS PARA O NOVOS LINKS */
.forgot-wrapper {
  text-align: right;
  margin-top: 6px;
}
.link-forgot {
  font-size: 12px;
  color: #1a3c6e;
  text-decoration: none;
}
.link-forgot:hover {
  text-decoration: underline;
}
</style>