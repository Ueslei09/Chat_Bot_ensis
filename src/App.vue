<template>
  <!-- Tela de Manutenção Bloqueando o Sistema -->
  <div v-if="emManutencao" class="manutencao-overlay">
    <div class="aviso-manutencao">
      <h1>⚠️ Sistema em Manutenção</h1>
      <p>No momento o sistema está passando por atualizações. Voltamos em breve!</p>
    </div>
  </div>

  <!-- Sistema Normal -->
  <div v-else>
    <router-view />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';
import { useRoute } from 'vue-router';

const route = useRoute();
const statusBanco = ref(false);

const verificarManutencaoGlobal = async () => {
  try {
    const res = await api.get('/configuracoes/status');
   statusBanco.value = res.data.emManutencao;
  } catch (e) {
    console.error('Erro ao verificar status de manutenção');
  }
};

// Só exibe a tela de manutenção se NÃO estiver em rotas de master
const emManutencao = computed(() => {

  return statusBanco.value && !route.path.startsWith('/master');
});

onMounted(() => {
  verificarManutencaoGlobal();
  // Opcional: checa a cada 10 segundos se o Master ligou/desligou
  setInterval(verificarManutencaoGlobal, 10000);
});
</script>

<style scoped>
.manutencao-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #0f172a;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
  color: white;
  text-align: center;
}
.aviso-manutencao h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  color: #f39c12;
}
.aviso-manutencao p {
  font-size: 1.2rem;
  color: #cbd5e1;
}
</style>