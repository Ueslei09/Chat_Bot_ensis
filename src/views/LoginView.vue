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
      <h3 class="mb-4 text-center">ChatBot Ensis</h3>

      <form @submit.prevent="login">
        <div class="mb-3">
          <label class="form-label">Usuário</label>
          <input
            v-model="usuario"
            type="text"
            class="form-control"
            placeholder="Digite seu usuário"
          />
        </div>

        <div class="mb-3">
          <label class="form-label">Senha</label>
          <input
            v-model="senha"
            type="password"
            class="form-control"
            placeholder="Digite sua senha"
          />
        </div>

        <!-- Mostra erro de login, se houver -->
        <p v-if="erro" class="erro">{{ erro }}</p>

        <button type="submit" class="btn btn-primary w-100" :disabled="carregando">
          {{ carregando ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
       <!-- ============================================================ -->
<!-- ADICIONE ISSO dentro do .login-box, logo depois do </form>   -->
<!-- no seu LoginView.vue                                         -->
<!-- ============================================================ -->
 
<router-link to="/admin-login" class="link-admin">
  Usuário administrador
</router-link>
    </div>
   
 


  </div>
</template>

<script setup>
// Estados reativos do formulário
import { ref } from 'vue'

// Roteador, pra redirecionar depois do login
import { useRouter } from 'vue-router'

// Função de login do arquivo central de API
// ✅ certo (é aqui que a função login realmente está)
import { login as loginApi } from '@/services/authServices.js'
// Imagem de fundo (mesma que você já tinha)
import bgImage from '@/assets/imagenschatbot/imagenslogichatbot.jpeg'

const usuario = ref('')
const senha = ref('')
const erro = ref('')
const carregando = ref(false)

const router = useRouter()

// Chamado ao enviar o formulário
async function login() {
  erro.value = ''
  carregando.value = true

  try {
    // usuario.value aqui é o e-mail (ajuste se seu backend usar outro campo)
    await loginApi(usuario.value, senha.value)

    // Login deu certo -> vai pra tela principal do sistema
    router.push('/app/chamados')
  } catch (err) {
    erro.value = err.response?.data?.erro || 'Usuário ou senha inválidos'
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
</style>