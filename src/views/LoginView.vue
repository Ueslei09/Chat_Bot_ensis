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
import { ref } from 'vue'
import { useRouter } from 'vue-router' // 👈 1. Importação que faltava
import { useAuthStore } from '@/stores/auth'
import { socket } from '@/services/api.js'
import bgImage from '@/assets/imagenschatbot/MOVE.png'

const usuario = ref('') // Armazena o e-mail digitado no input
const senha = ref('')
const erro = ref('')
const carregando = ref(false)

const router = useRouter() // 👈 2. Instanciando o router
const authStore = useAuthStore()

// 👈 3. Nome corrigido para 'login' minúsculo, batendo com o @submit do HTML
const login = async () => {
  try {
    erro.value = ''
    carregando.value = true

    console.log('--- DISPARANDO LOGIN COMUM ---')
    
    // 👈 4. Corrigido para enviar 'usuario.value' em vez de 'email.value'
    await authStore.realizarLogin(usuario.value, senha.value)

    // 🔌 5. SOCKET RESTAURADO: Conecta e ativa os eventos em tempo real
    if (socket && typeof socket.connect === 'function') {
      console.log('🔌 Conectando ao canal do Socket.IO...')
      socket.connect()
    }

  // 🚀 REDIRECIONAMENTO INTELIGENTE BASEADO NO PERFIL REAL DO BANCO:
    if (authStore.ehMaster) {
      console.log('👑 Super Admin identificado! Redirecionando para o Painel Master...');
      router.push('/master/empresas')
    } else {
      console.log('👤 Usuário comum identificado! Redirecionando para os Chamados...');
      router.push('/app/chamados')
    }

  } catch (err) {
    console.error('Erro no login comum:', err)
    // Dica extra: mude para ".erro" se o seu backend retornar o padrão que configuramos antes
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