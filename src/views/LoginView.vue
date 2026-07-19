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
          <!-- Link Esqueci a senha -->
          <div class="forgot-wrapper">
            <router-link to="/esqueci-senha" class="link-forgot">
              Esqueci a senha?
            </router-link>
          </div>
        </div>

        <!-- Mostra erro de login, se houver -->
        <p v-if="erro" class="erro">{{ erro }}</p>

        <button type="submit" class="btn btn-primary w-100 py-2.5" :disabled="carregando">
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
/* Mantido todo o seu bloco <script setup> original perfeitamente intacto */
import { ref } from 'vue'
import { useRouter } from 'vue-router' 
import { useAuthStore } from '@/stores/auth'
import { socket } from '@/services/api.js'
import bgImage from '@/assets/imagenschatbot/MOVE.png'

const usuario = ref('') 
const senha = ref('')
const erro = ref('')
const carregando = ref(false)

const router = useRouter() 
const authStore = useAuthStore()

const login = async () => {
  try {
    erro.value = ''
    carregando.value = true

    console.log('--- DISPARANDO LOGIN COMUM ---')
    
    await authStore.realizarLogin(usuario.value, senha.value)

    if (socket && typeof socket.connect === 'function') {
      console.log('🔌 Conectando ao canal do Socket.IO...')
      socket.connect()
    }

    if (authStore.ehMaster) {
      console.log('👑 Super Admin identificado! Redirecionando para o Painel Master...');
      router.push('/master/empresas')
    } else {
      console.log('👤 Usuário comum identificado! Redirecionando para os Chamados...');
      router.push('/app/chamados')
    }

  } catch (err) {
    console.error('Erro no login comum:', err)
    erro.value = err.response?.data?.erro || err.response?.data?.message || 'E-mail ou senha inválidos'
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
  padding: 20px; /* 🎯 Evita que o card cole nos cantos da tela no celular */
}

/* Camada escura semi-transparente por cima da imagem (contraste) */
.overlay {
  position: absolute;
  inset: 0; 
  background: rgba(0, 0, 0, 0.5); /* Aumentado de 0.45 para 0.5 para melhor contraste */
}

/* Cartão do formulário, flutuando acima da imagem e do overlay */
.login-box {
  position: relative; 
  z-index: 1;
  background: #ffffff;
  padding: 24px; /* Reduzido de 32px para 24px no mobile por padrão */
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 380px;
  transition: all 0.3s ease;
}

/* Em telas maiores (Desktop), expande o espaçamento interno do formulário */
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

.erro {
  color: #dc2626;
  font-size: 13px;
  margin-bottom: 12px;
  font-weight: 500;
}

.link-admin {
  display: block;
  text-align: center;
  margin-top: 20px;
  font-size: 13px;
  color: #1a3c6e;
  text-decoration: none;
  font-weight: 500;
}
.link-admin:hover {
  text-decoration: underline;
}

.forgot-wrapper {
  text-align: right;
  margin-top: 6px;
}
.link-forgot {
  font-size: 12px;
  color: #1a3c6e;
  text-decoration: none;
  font-weight: 500;
}
.link-forgot:hover {
  text-decoration: underline;
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