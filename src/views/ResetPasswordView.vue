<template>
  <!-- login-page: ocupa a tela inteira (100vh) e usa a imagem de fundo -->
  <div class="login-page" :style="{ backgroundImage: `url(${bgImage})` }">

    <!-- Camada escura por cima da imagem, só pra dar contraste com o texto -->
    <div class="overlay"></div>

    <!-- Cartão do formulário, flutuando centralizado por cima da imagem -->
    <div class="login-box animate-fade-in">
      <h3 class="mb-2 text-center text-dark fw-bold">Nova Senha</h3>
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

        <button type="submit" class="btn btn-primary w-100 py-2.5" :disabled="carregando">
          {{ carregando ? 'Alterando...' : 'Redefinir Senha' }}
        </button>
      </form>

      <div v-else>
        <p class="erro text-center mb-4 font-medium">Link de recuperação inválido ou expirado.</p>
        <router-link to="/esqueci-senha" class="btn btn-secondary w-100 py-2.5">
          Solicitar novo link
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
/* Mantido todo o seu bloco <script setup> original perfeitamente intacto */
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
  padding: 20px; /* 🎯 Evita que o card cole nas bordas da tela do celular */
}

/* Camada escura semi-transparente por cima da imagem (contraste) */
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5); /* Sutil aumento para melhorar legibilidade */
}

/* Cartão do formulário, flutuando acima da imagem e do overlay */
.login-box {
  position: relative;
  z-index: 1;
  background: #ffffff;
  padding: 24px; /* Reduzido no mobile para economizar espaço de tela */
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 380px;
  transition: all 0.3s ease;
}

/* Em telas maiores (Desktop), ganha mais respiro interno */
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
  padding: 11px;
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

.btn-secondary {
  padding: 11px;
  font-weight: bold;
  font-size: 14px;
  border-radius: 8px;
}

.erro {
  color: #dc2626;
  font-size: 13px;
  margin-bottom: 12px;
  font-weight: 500;
}

.sucesso {
  color: #16a34a;
  font-size: 13px;
  margin-bottom: 12px;
  font-weight: 500;
}

.font-medium {
  font-weight: 500;
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