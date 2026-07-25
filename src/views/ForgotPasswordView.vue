<template>
  <div class="login-page" :style="{ backgroundImage: `url(${bgImage})` }">
    <div class="overlay"></div>

    <div class="login-box animate-fade-in">
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

        <button type="submit" class="btn btn-primary w-100 mb-3 py-2.5" :disabled="carregando">
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
  padding: 20px; /* 🎯 Garante respiro nas bordas laterais em telas pequenas (mobile) */
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
  padding: 24px; /* Padding reduzido no mobile para não estourar a tela */
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 380px;
  transition: all 0.3s ease;
}

/* Em telas maiores (Desktop), expande o padding interno do card */
@media (min-width: 576px) {
  .login-box {
    padding: 36px;
  }
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.form-control {
  padding: 11px 14px;
  font-size: 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}
.form-control:focus {
  border-color: #1a3c6e;
  box-shadow: 0 0 0 3px rgba(26, 60, 110, 0.15);
}

.btn-primary {
  background: #1a3c6e;
  border: none;
  font-weight: bold;
  font-size: 14px;
  border-radius: 8px;
  transition: background 0.2s;
}
.btn-primary:hover {
  background: #11294a;
}
.btn-primary:disabled {
  background: #94a3b8;
}

.erro {
  color: #c0392b;
  font-size: 13px;
  margin-bottom: 12px;
  font-weight: 500;
}

.sucesso {
  color: #27ae60;
  font-size: 13px;
  margin-bottom: 12px;
  font-weight: 500;
}

.link-voltar {
  display: block;
  text-align: center;
  font-size: 13px;
  color: #1a3c6e;
  text-decoration: none;
  font-weight: 500;
}
.link-voltar:hover {
  text-decoration: underline;
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>