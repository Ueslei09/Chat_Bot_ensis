<template>
  <div class="manutencao-container">
    <div class="manutencao-box">
      <!-- Ilustração de manutenção -->
      <img 
        src="https://cdni.iconscout.com/illustration/premium/thumb/server-maintenance-illustration-download-in-svg-png-gif-file-formats--down-error-glitch-pack-development-illustrations-4357777.png" 
        alt="Sistema Fora do Ar" 
        class="manutencao-img"
      >
      
      <h1>Estamos em Manutenção!</h1>
      <p>No momento estamos realizando melhorias em nossos servidores ou o sistema está temporariamente indisponível. Por favor, tente novamente em alguns instantes.</p>
      
      <button class="btn-atualizar" @click="recarregarPagina">
        Tentar novamente
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function recarregarPagina() {
  // Tenta recarregar a rota atual ou atualizar a página inteira
  window.location.reload()
}
</script>

<style scoped>
.manutencao-container {
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: #f8fafc;
  color: #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  box-sizing: border-box;
  width: 100vw;
  position: fixed;
  inset: 0;
  z-index: 9999;
}

.manutencao-box {
  max-width: 480px;
  padding: 32px;
  box-sizing: border-box;
}

.manutencao-img {
  max-width: 280px;
  height: auto;
  margin-bottom: 24px;
}

h1 {
  font-size: 22px;
  color: var(--primary-color, #1a3c6e);
  margin-bottom: 12px;
}

p {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 24px;
}

.btn-atualizar {
  background-color: var(--primary-color, #1a3c6e);
  color: #ffffff;
  border: none;
  padding: 10px 24px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-atualizar:hover {
  background-color: var(--primary-hover, #11294a);
}
</style>