<template>
  <div class="container py-4 animate-fade-in" style="max-width: 1100px;">

    <!-- Cabeçalho -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
      <div>
        <h2 class="fw-bold text-dark mb-1">Conexões</h2>
      </div>
      <div class="d-flex align-items-center gap-2">
        <input 
          v-model="busca" 
          type="text" 
          placeholder="Pesquisar por nome..." 
          class="form-control form-control-sm"
          style="min-width: 240px;"
        />
        <button class="btn btn-outline-secondary btn-sm text-nowrap">▽ Filtros</button>
        <button 
          @click="abrirModalCriar" 
          class="btn btn-primary btn-sm d-flex align-items-center gap-1 text-nowrap"
        >
          <span>+</span> Nova Conexão
        </button>
      </div>
    </div>

    <!-- Abas: Ativas / Arquivadas -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ 'active fw-bold text-primary': abaAtual === 'ativas', 'text-muted': abaAtual !== 'ativas' }"
          @click="trocarAba('ativas')"
        >
          Ativas <span class="badge bg-secondary-subtle text-dark border ms-1">{{ conexoesFiltradas.length }}</span>
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ 'active fw-bold text-primary': abaAtual === 'arquivadas', 'text-muted': abaAtual !== 'arquivadas' }"
          @click="trocarAba('arquivadas')"
        >
          Arquivadas <span class="badge bg-secondary-subtle text-dark border ms-1">{{ arquivadasCount }}</span>
        </button>
      </li>
    </ul>

    <!-- Estado de carregamento ou vazio -->
    <div v-if="carregando" class="text-center text-muted py-5">Carregando dados...</div>

    <div v-else-if="conexoesFiltradas.length === 0" class="text-center text-muted py-5">
      <p class="mb-1">Nenhuma conexão {{ abaAtual === 'ativas' ? 'ativa' : 'arquivada' }} encontrada.</p>
      <small class="text-muted opacity-75">Essa lista será preenchida automaticamente quando a API do WhatsApp estiver conectada.</small>
    </div>

    <!-- Grid de Conexões Responsivo com Bootstrap Cards -->
    <div v-else class="row g-3">
      <div v-for="conexao in conexoesFiltradas" :key="conexao.id" class="col-12 col-md-6 col-lg-4">
        <div class="card border-0 shadow-sm p-3 h-100 rounded-4 bg-white transition-card">
          
          <div class="d-flex align-items-center gap-3 mb-3">
            <div class="rounded-circle d-flex align-items-center justify-content-center fs-5 fw-bold" 
                 :class="conexao.tipo === 'whatsapp' ? 'bg-success-subtle text-success' : 'bg-light text-secondary'"
                 style="width: 48px; height: 48px; flex-shrink: 0;">
              {{ iconePorTipo(conexao.tipo) }}
            </div>
            <div class="overflow-hidden">
              <h6 class="fw-bold text-dark mb-0 text-truncate">{{ conexao.nome }}</h6>
              <small class="text-muted">{{ rotuloTipo(conexao.tipo) }}</small>
            </div>
          </div>

          <div class="small text-secondary mb-2 d-flex align-items-center gap-2">
            <span>👤</span> <span class="text-truncate font-monospace">{{ conexao.numero || '-' }}</span>
          </div>
          <div class="small text-secondary mb-3 d-flex align-items-center gap-2">
            <span>🏢</span> <span class="text-truncate">{{ conexao.departamento || '-' }}</span>
          </div>

          <div class="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
            <span class="badge" :class="conexao.status === 'conectado' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'">
              ● {{ conexao.status === 'conectado' ? 'Conectado' : 'Desconectado' }}
            </span>

            <!-- Botão Dinâmico: Desconectar (se conectado) ou Reconectar (se desconectado) -->
            <div class="d-flex gap-1">
              <button 
                v-if="conexao.status === 'conectado'" 
                @click="desconectarInstancia(conexao)"
                class="btn btn-outline-danger btn-sm py-0 px-2 fw-semibold"
                style="font-size: 0.75rem;"
              >
                🔌 Desconectar
              </button>

              <button 
                v-else 
                @click="abrirParaReconectar(conexao)" 
                class="btn btn-outline-success btn-sm py-0 px-2 fw-semibold"
                style="font-size: 0.75rem;"
              >
                🔄 Reconectar
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>

    <div class="mt-4 text-muted small">
      Mostrando {{ conexoesFiltradas.length }} resultados
    </div>

    <!-- MODAL DE QR CODE / NOVA CONEXÃO -->
    <div v-if="modalAberto" class="modal-backdrop-custom d-flex align-items-center justify-content-center">
      <div class="card border-0 shadow-lg p-4 rounded-4 bg-white w-100" style="max-width: 400px;">
        
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-bold m-0">Conectar WhatsApp</h5>
          <button @click="fecharModal" class="btn-close" aria-label="Close"></button>
        </div>

        <!-- Se estiver carregando o QR Code -->
        <div v-if="carregandoQR" class="text-center py-4">
          <div class="spinner-border text-success mb-2" role="status"></div>
          <p class="text-muted small">Gerando QR Code...</p>
        </div>

        <!-- Se o QR Code já foi gerado e carregado -->
        <div v-else-if="qrCode" class="text-center">
          <p class="small text-muted mb-2">Abra o WhatsApp no seu celular > Aparelhos Conectados > Conectar Aparelho</p>
          <div class="bg-light p-3 rounded border d-inline-block mb-3">
            <img :src="qrCode" alt="QR Code" class="img-fluid" style="width: 220px; height: 220px;" />
          </div>
          <p class="text-warning small fw-bold mb-3">Aguardando leitura do QR Code...</p>
          <button @click="fecharModal" class="btn btn-outline-secondary btn-sm w-100">
            Concluir / Fechar
          </button>
        </div>

        <!-- Passo Inicial caso abra manualmente (Nova Conexão) sem instância preenchida -->
        <div v-else>
          <div class="mb-3">
            <label class="form-label small text-muted">Nome da Instância</label>
            <input 
              v-model="nomeInstancia" 
              type="text" 
              placeholder="Ex: Vendas-Matriz" 
              class="form-control"
            />
          </div>
          <button 
            @click="gerarQRCode" 
            class="container-fluid btn btn-success py-2 fw-semibold"
          >
            Gerar QR Code
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { useConexoes } from '@/Composables/useConexoes'

const {
  abaAtual,
  busca,
  carregando,
  conexoesFiltradas,
  arquivadasCount,
  trocarAba,
  iconePorTipo,
  rotuloTipo,
  modalAberto,
  nomeInstancia,
  qrCode,
  carregandoQR,
  abrirModalCriar,
  fecharModal,
  gerarQRCode,
  abrirParaReconectar,
  desconectarInstancia // <-- Importado do composable
} = useConexoes()
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.transition-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.transition-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08) !important;
}
.modal-backdrop-custom {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1050;
  backdrop-filter: blur(2px);
}
</style>