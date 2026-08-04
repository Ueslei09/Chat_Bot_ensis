<template>
  <div class="login-page" :style="{ backgroundImage: `url(${bgImage})` }">
    <div class="overlay"></div>

    <div class="login-box shadow-lg rounded-4 border-0 p-4 p-sm-5 animate-fade-in">
      <h3 class="mb-2 text-center text-dark fw-bold">Recuperar Senha</h3>
      <p class="text-muted text-center mb-4 small">
        Insira o seu e-mail cadastrado para receber um link de redefinição.
      </p>

      <form @submit.prevent="solicitarRecuperacao">
        <div class="mb-3">
          <label class="form-label small fw-bold text-muted">E-mail de Cadastro</label>
          <input
            v-model="email"
            type="email"
            class="form-control form-control-sm py-2"
            placeholder="exemplo@empresa.com"
            required
          />
        </div>

        <div v-if="mensagemErro" class="alert alert-danger py-2 small" role="alert">{{ mensagemErro }}</div>
        <div v-if="mensagemSucesso" class="alert alert-success py-2 small" role="alert">{{ mensagemSucesso }}</div>

        <button type="submit" class="btn btn-primary w-100 mb-3 py-2 fw-bold shadow-sm" :disabled="carregando">
          {{ carregando ? 'Processando...' : 'Enviar Link' }}
        </button>
      </form>

      <div class="text-center">
        <router-link to="/login" class="link-voltar small text-decoration-none fw-semibold">
          Voltar para o Login
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useForgotPassword } from '@/composables/useForgotPassword'
import bgImage from '@/assets/imagenschatbot/MOVE.png'

const {
  email,
  carregando,
  mensagemSucesso,
  mensagemErro,
  solicitarRecuperacao
} = useForgotPassword()
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
  padding: 20px;
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
  width: 100%;
  max-width: 400px;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.15);
}

.link-voltar {
  color: #0d6efd;
}
.link-voltar:hover {
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