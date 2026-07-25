<!-- src/views/LoginView.vue -->
<template>
  <!-- login-page: ocupa a tela inteira (100vh) e usa a imagem de fundo -->
  <div class="login-page" :style="{ backgroundImage: `url(${bgImage})` }">

    <!-- Camada escura por cima da imagem, só pra dar contraste com o texto -->
    <div class="overlay"></div>

    <!-- Cartão do formulário, flutuando centralizado por cima da imagem -->
    <div class="login-box animate-fade-in">
      <h3 class="mb-4 text-center text-dark fw-bold">Moove Chat-Multi</h3>

      <form @submit.prevent="login">
        <div class="mb-3">
          <label for="usuario" class="form-label">Usuário</label>
          <input
            id="usuario"
            v-model="usuario"
            type="text"
            class="form-control"
            placeholder="Digite seu usuário"
            aria-label="Usuário"
            required
          />
        </div>

        <div class="mb-3">
          <label for="senha" class="form-label">Senha</label>
          <input
            id="senha"
            v-model="senha"
            type="password"
            class="form-control"
            placeholder="Digite sua senha"
            aria-label="Senha"
            required
          />
          <!-- Link Esqueci a senha -->
          <div class="forgot-wrapper">
            <router-link to="/esqueci-senha" class="link-forgot">
              Esqueci a senha?
            </router-link>
          </div>
        </div>

        <!-- Mostra erro de login, se houver -->
        <p v-if="erro" class="erro" role="alert">{{ erro }}</p>

        <button type="submit" class="btn btn-primary w-100 py-2.5" :disabled="carregando">
          <span v-if="carregando" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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
  padding: 24px;
  border-radius: var(--radius-box, 12px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 380px;
  transition: all 0.3s ease;
}

@media (min-width: 576px) {
  .login-box {
    padding: 36px;
  }
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color, #475569);
}

.form-control {
  padding: 11px 14px;
  font-size: 14px;
  border: 1px solid var(--border-color, #cbd5e1);
  border-radius: var(--radius-base, 8px);
}

.form-control:focus {
  border-color: var(--primary-color, #1a3c6e);
  box-shadow: 0 0 0 3px rgba(26, 60, 110, 0.15);
}

.btn-primary {
  background: var(--primary-color, #1a3c6e);
  border: none;
  padding: 11px;
  font-weight: bold;
  font-size: 14px;
  border-radius: var(--radius-base, 8px);
  transition: background 0.2s;
}

.btn-primary:hover {
  background: var(--primary-hover, #11294a);
}

.btn-primary:disabled {
  background: #94a3b8;
}

.erro {
  color: var(--error-color, #dc2626);
  font-size: 13px;
  margin-bottom: 12px;
  font-weight: 500;
}

.link-admin, .link-forgot {
  color: var(--primary-color, #1a3c6e);
  text-decoration: none;
  font-weight: 500;
}

.link-admin {
  display: block;
  text-align: center;
  margin-top: 20px;
  font-size: 13px;
}

.link-admin:hover, .link-forgot:hover {
  text-decoration: underline;
}

.forgot-wrapper {
  text-align: right;
  margin-top: 6px;
}

.link-forgot {
  font-size: 12px;
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>