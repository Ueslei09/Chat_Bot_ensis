<template>
  <!-- login-page1: ocupa a tela inteira (100vh) e usa a imagem de fundo -->
  <div class="login-page1 animate-fade-in" :style="{ backgroundImage: `url(${bgImage})` }">
    <!-- Camada escura por cima da imagem para contraste perfeito -->
    <div class="overlay"></div>

    <div class="login-box">
      <h3 class="mb-4 text-center text-dark fw-bold">Acesso Administrativo</h3>

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

        <button type="submit" class="btn btn-primary w-100 py-2.5" :disabled="carregando">
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
  padding: 20px; /* 🎯 Evita que o card cole nas bordas no celular */
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
  padding: 24px; /* Padding seguro no mobile */
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 380px;
  transition: all 0.3s ease;
}

/* Em telas maiores (Desktop), ganha respiro maior */
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

.link-voltar {
  display: block;
  text-align: center;
  margin-top: 16px;
  font-size: 13px;
  color: #666;
  text-decoration: none;
  font-weight: 500;
}
.link-voltar:hover {
  text-decoration: underline;
  color: #1a3c6e;
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>