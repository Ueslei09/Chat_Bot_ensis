<template>
  <div class="container-fluid py-4 animate-fade-in">
    <div class="row mb-4">
      <div class="col">
        <h2 class="text-dark fw-bold">Dashboard de Atendimento</h2>
        <p class="text-muted">Bem-vindo ao painel de controle do Moove Chat-Multi.</p>
      </div>
    </div>

    <!-- Cards de Métricas -->
    <div class="row g-3 mb-4">
      <!-- Card: Meus Chamados -->
      <div class="col-12 col-md-4">
        <div class="card border-0 shadow-sm p-3 bg-primary text-white">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="text-uppercase text-white-50 small mb-1">Meus Chamados</h6>
              <h3 class="mb-0 fw-bold">{{ metricas.meusChamados }}</h3>
            </div>
            <i class="bi bi-chat-left-text fs-1"></i>
          </div>
        </div>
      </div>

      <!-- Card: Fila de Espera -->
      <div class="col-12 col-md-4">
        <div class="card border-0 shadow-sm p-3 bg-warning text-dark">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="text-uppercase text-muted small mb-1">Fila de Espera</h6>
              <h3 class="mb-0 fw-bold">{{ metricas.filaEspera }}</h3>
            </div>
            <i class="bi bi-people fs-1"></i>
          </div>
        </div>
      </div>

      <!-- Card: Status do WhatsApp Dinâmico -->
      <div class="col-12 col-md-4">
        <div :class="[
          'card border-0 shadow-sm p-3 text-white transition-all', 
          metricas.whatsappStatus === 'Online' ? 'bg-success' : 'bg-danger'
        ]">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="text-uppercase text-white-50 small mb-1">WhatsApp Status</h6>
              <h3 class="mb-0 fw-bold">{{ metricas.whatsappStatus }}</h3>
            </div>
            <i class="bi bi-whatsapp fs-1"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Seção de Atalhos Rápidos -->
    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <h5 class="card-title fw-bold mb-3">Atalhos do Sistema</h5>
        <div class="d-flex flex-wrap gap-2">
          <router-link to="/app/chamados" class="btn btn-outline-primary btn-sm rounded-pill">
            <i class="bi bi-chat-dots-fill me-1"></i> Ir para o Chat
          </router-link>
          <router-link to="/app/contatos" class="btn btn-outline-secondary btn-sm rounded-pill">
            <i class="bi bi-person-lines-fill me-1"></i> Gerenciar Contatos
          </router-link>
          <router-link to="/app/conexoes" class="btn btn-outline-secondary btn-sm rounded-pill">
            <i class="bi bi-phone-vibrate me-1"></i> Conectar WhatsApp
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/services/api' // Sua instância global do Axios

const metricas = ref({
  meusChamados: 0,
  filaEspera: 0,
  whatsappStatus: 'Offline'
})

const buscarDadosPainel = async () => {
  try {
    const resposta = await api.get('/app/dashboard/metricas')
    metricas.value = resposta.data
  } catch (err) {
    console.error('Erro ao buscar estatísticas do painel:', err)
  }
}

onMounted(() => {
  buscarDadosPainel()
})
</script>

<style scoped>
.card {
  transition: transform 0.2s ease, background-color 0.3s ease;
}
.card:hover {
  transform: translateY(-2px);
}
.transition-all {
  transition: all 0.3s ease;
}
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>