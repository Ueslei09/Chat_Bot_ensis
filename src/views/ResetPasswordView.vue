<template>
  <!-- login-page: ocupa a tela inteira (100vh) e usa a imagem de fundo -->
  <div class="login-page" :style="{ backgroundImage: `url(${bgImage})` }">

    <!-- Camada escura por cima da imagem para contraste -->
    <div class="overlay"></div>

    <!-- Cartão do formulário, flutuando centralizado por cima da imagem -->
    <div class="login-box shadow-lg rounded-4 border-0 p-4 p-sm-5 animate-fade-in">
      <h3 class="mb-1 text-center text-dark fw-bold">Nova Senha</h3>
      <p class="text-muted text-center mb-4 small">
        Digite e confirme a sua nova senha de acesso.
      </p>

      <form v-if="token" @submit.prevent="alterarSenha">
        <div class="mb-3">
          <label class="form-label small fw-bold text-muted">Nova Senha</label>
          <input
            v-model="novaSenha"
            type="password"
            class="form-control form-control-sm py-2"
            placeholder="No mínimo 6 caracteres"
            required
          />
        </div>

        <div class="mb-3">
          <label class="form-label small fw-bold text-muted">Confirmar Nova Senha</label>
          <input
            v-model="confirmarSenha"
            type="password"
            class="form-control form-control-sm py-2"
            placeholder="Repita a nova senha"
            required
          />
        </div>

        <div v-if="mensagemErro" class="alert alert-danger py-2 small" role="alert">{{ mensagemErro }}</div>
        <div v-if="mensagemSucesso" class="alert alert-success py-2 small" role="alert">{{ mensagemSucesso }}</div>

        <button type="submit" class="btn btn-primary w-100 py-2 fw-bold shadow-sm" :disabled="carregando">
          {{ carregando ? 'Alterando...' : 'Redefinir Senha' }}
        </button>
      </form>

      <div v-else class="text-center">
        <div class="alert alert-danger py-2 small mb-3">Link de recuperação inválido ou expirado.</div>
        <router-link to="/esqueci-senha" class="btn btn-secondary w-100 py-2 fw-bold text-decoration-none">
          Solicitar novo link
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useResetPassword } from '@/composables/useResetPassword'
import bgImage from '@/assets/imagenschatbot/MOVE.png'

const {
  novaSenha,
  confirmarSenha,
  token,
  carregando,
  mensagemSucesso,
  mensagemErro,
  alterarSenha
} = useResetPassword()
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
  background: #ffffff;
  width: 100%;
  max-width: 400px;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.15);
}

/* Animação suave de entrada */
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>