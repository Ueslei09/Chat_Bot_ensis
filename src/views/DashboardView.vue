<template>
  <div class="container-fluid py-3 py-md-4 animate-fade-in dashboard-wrapper">
    <div class="row mb-4">
      <div class="col">
        <h2 class="text-dark fw-bold titulo-dashboard">Dashboard Administrativo</h2>
        <p class="text-muted subtitulo-dashboard">Painel gerencial de controle do Moove Chat-Multi.</p>
      </div>
    </div>

    <!-- Cards de Métricas -->
    <div class="row g-3 mb-4">
      <!-- Card: Em Atendimento Geral -->
      <div class="col-12 col-md-4">
        <div class="card border-0 shadow-sm p-3 bg-primary text-white h-100 card-metrica">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="text-uppercase text-white-50 small mb-1">Em Atendimento</h6>
              <h3 class="mb-0 fw-bold">{{ metricas.meusChamados }}</h3>
            </div>
            <i class="bi bi-chat-left-text fs-1"></i>
          </div>
        </div>
      </div>

      <!-- Card: Fila de Espera -->
      <div class="col-12 col-md-4">
        <div class="card border-0 shadow-sm p-3 bg-warning text-dark h-100 card-metrica">
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
          'card border-0 shadow-sm p-3 text-white transition-all h-100 card-metrica', 
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
      <div class="card-body p-3 p-md-4">
        <h5 class="card-title fw-bold mb-3">Atalhos do Sistema</h5>
        <div class="d-flex flex-wrap gap-2">
          <router-link to="/app/chamados" class="btn btn-outline-primary btn-sm rounded-pill px-3 py-2">
            <i class="bi bi-chat-dots-fill me-1"></i> Ir para o Chat
          </router-link>
          <router-link to="/app/contatos" class="btn btn-outline-secondary btn-sm rounded-pill px-3 py-2">
            <i class="bi bi-person-lines-fill me-1"></i> Gerenciar Contatos
          </router-link>
          <router-link to="/app/conexoes" class="btn btn-outline-secondary btn-sm rounded-pill px-3 py-2">
            <i class="bi bi-phone-vibrate me-1"></i> Conectar WhatsApp
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDashboard } from '@/composables/useDashboard'

const { metricas } = useDashboard()
</script>

<style scoped>
.dashboard-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.titulo-dashboard {
  font-size: 1.5rem;
}

@media (min-width: 768px) {
  .titulo-dashboard {
    font-size: 1.85rem;
  }
}

.subtitulo-dashboard {
  font-size: 0.9rem;
}

@media (min-width: 768px) {
  .subtitulo-dashboard {
    font-size: 1rem;
  }
}

.card-metrica {
  transition: transform 0.2s ease, background-color 0.3s ease;
  border-radius: 12px;
}

.card-metrica:hover {
  transform: translateY(-3px);
}

.transition-all {
  transition: all 0.3s ease;
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>