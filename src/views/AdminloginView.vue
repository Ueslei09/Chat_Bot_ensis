<template>
  <!-- login-page1: ocupa a tela inteira (100vh) e usa a imagem de fundo -->
  <div class="login-page1 animate-fade-in" :style="{ backgroundImage: `url(${bgImage})` }">
    <!-- Camada escura por cima da imagem para contraste perfeito -->
    <div class="overlay"></div>

    <div class="login-box shadow-lg rounded-4 border-0 p-4 p-sm-5">
      <h3 class="mb-4 text-center text-dark fw-bold">Acesso Administrativo</h3>

      <form @submit.prevent="entrar">
        <div class="mb-3">
          <label class="form-label small fw-bold text-muted">E-mail</label>
          <input
            v-model="email"
            type="email"
            class="form-control form-control-sm py-2"
            placeholder="admin@ensis.com"
            required
          />
        </div>

        <div class="mb-3">
          <label class="form-label small fw-bold text-muted">Senha</label>
          <input
            v-model="senha"
            type="password"
            class="form-control form-control-sm py-2"
            placeholder="Digite sua senha"
            required
          />
        </div>

        <div v-if="erro" class="alert alert-danger py-2 small" role="alert">{{ erro }}</div>

        <button type="submit" class="btn btn-primary w-100 py-2 fw-bold shadow-sm" :disabled="carregando">
          {{ carregando ? 'Entrando...' : 'Entrar como ADM' }}
        </button>
      </form>

      <div class="text-center mt-3">
        <router-link to="/" class="link-voltar small text-decoration-none fw-semibold">
          Não sou administrador, voltar
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAdminLogin } from '@/composables/useAdminLogin'
import bgImage from '@/assets/imagenschatbot/MOVE.png'

const {
  email,
  senha,
  erro,
  carregando,
  entrar
} = useAdminLogin()
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
  padding: 20px;
}

/* Camada escura semi-transparente por cima da imagem */
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
}

.login-box {
  position: relative;
  z-index: 1;
  background: #fff;
  width: 100%;
  max-width: 400px;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.15);
}

.link-voltar {
  color: #6c757d;
}
.link-voltar:hover {
  color: #0d6efd;
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