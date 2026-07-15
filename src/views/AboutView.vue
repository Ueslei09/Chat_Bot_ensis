<template>
  <div class="container-fluid py-4">
    <div class="row mb-4">
      <div class="col">
        <h2 class="text-dark fw-bold">Dashboard de Atendimento</h2>
        <p class="text-muted">Bem-vindo ao painel de controle do Moove Chat-Multi.</p>
      </div>
    </div>

    <!-- Cards de Métricas -->
    <div class="row g-3 mb-4">
      <div class="col-12 col-md-4">
        <div class="card border-0 shadow-sm p-3 bg-primary text-white">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="text-uppercase text-white-50 small mb-1">Meus Chamados</h6>
              <h3 class="mb-0 fw-bold">12</h3>
            </div>
            <i class="bi bi-chat-left-text fs-1"></i>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <div class="card border-0 shadow-sm p-3 bg-warning text-dark">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="text-uppercase text-muted small mb-1">Fila de Espera</h6>
              <h3 class="mb-0 fw-bold">5</h3>
            </div>
            <i class="bi bi-people fs-1"></i>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <div class="card border-0 shadow-sm p-3 bg-success text-white">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="text-uppercase text-white-50 small mb-1">WhatsApp Status</h6>
              <h3 class="mb-0 fw-bold">Online</h3>
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
// No futuro, você poderá puxar estes dados diretamente das suas stores/APIs!
</script>

<style scoped>
.card {
  transition: transform 0.2s ease;
}
.card:hover {
  transform: translateY(-2px);
}
</style>
