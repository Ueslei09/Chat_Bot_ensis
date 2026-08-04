<!-- src/views/LoginView.vue -->
<template>
  <!-- login-page: ocupa a tela inteira (100vh) e usa a imagem de fundo -->
  <div class="login-page" :style="{ backgroundImage: `url(${bgImage})` }">

    <!-- Camada escura por cima da imagem para contraste -->
    <div class="overlay"></div>

    <!-- Cartão do formulário, flutuando centralizado por cima da imagem -->
    <div class="login-box shadow-lg rounded-4 border-0 p-4 p-sm-5 animate-fade-in">
      <h3 class="mb-4 text-center text-dark fw-bold">Moove Chat-Multi</h3>

      <form @submit.prevent="login">
        <div class="mb-3">
          <label for="usuario" class="form-label small fw-bold text-muted">Usuário</label>
          <input
            id="usuario"
            v-model="usuario"
            type="text"
            class="form-control form-control-sm py-2"
            placeholder="Digite seu usuário"
            aria-label="Usuário"
            required
          />
        </div>

        <div class="mb-3">
          <label for="senha" class="form-label small fw-bold text-muted">Senha</label>
          <input
            id="senha"
            v-model="senha"
            type="password"
            class="form-control form-control-sm py-2"
            placeholder="Digite sua senha"
            aria-label="Senha"
            required
          />
          <!-- Link Esqueci a senha -->
          <div class="forgot-wrapper text-end mt-1">
            <router-link to="/esqueci-senha" class="link-forgot small text-decoration-none">
              Esqueci a senha?
            </router-link>
          </div>
        </div>

        <!-- Mostra erro de login, se houver -->
        <div v-if="erro" class="alert alert-danger py-2 small" role="alert">{{ erro }}</div>

        <button type="submit" class="btn btn-primary w-100 py-2 fw-bold shadow-sm" :disabled="carregando">
          <span v-if="carregando" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ carregando ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
 
      <div class="text-center mt-3">
        <router-link to="/admin-login" class="link-admin small text-decoration-none fw-semibold">
          Usuário administrador
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '@/Composables/useAuth'
import bgImage from '@/assets/imagenschatbot/MOVE.png'

const usuario = ref('') 
const senha = ref('')

// Utiliza o composable de autenticação que criamos
const { carregando, erro, executarLogin } = useAuth()

const login = async () => {
  await executarLogin(usuario.value, senha.value)
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
  padding: 20px;
}

/* Camada escura semi-transparente por cima da imagem */
.overlay {
  position: absolute;
  inset: 0; 
  background: rgba(0, 0, 0, 0.5);
}

/* Cartão do formulário */
.login-box {
  position: relative; 
  z-index: 1;
  background: var(--bg-card, #ffffff);
  width: 100%;
  max-width: 400px;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: var(--primary-color, #0d6efd);
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.15);
}

.link-admin, .link-forgot {
  color: var(--primary-color, #0d6efd);
}

.link-admin:hover, .link-forgot:hover {
  text-decoration: underline !important;
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>