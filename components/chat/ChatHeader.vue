<template>
  <div class="topo" @click="$emit('abrir-detalhes')">
    <div class="titulo">
      
      <!-- 🔙 BOTÃO RETORNO MOBILE: Aparece apenas em telas pequenas (< 768px) -->
      <button 
        type="button" 
        class="btn-voltar-mobile" 
        title="Voltar para a lista"
        @click.stop="$emit('voltar')"
      >
        <i class="bi bi-arrow-left"></i>
      </button>

      <!-- Avatar dinâmico (Letra ou Ícone de Grupo) -->
      <span class="avatar-contato" :class="{ grupo: chamado.eh_grupo }">
        <i v-if="chamado.eh_grupo" class="bi bi-people-fill"></i>
        <template v-else>{{ inicial }}</template>
      </span>

      <div class="info-contato">
        <strong>{{ chamado.cliente_nome || `Chamado #${chamado.id}` }}</strong>
        <!-- Badge de status amigável e com cores semânticas -->
        <span class="status-badge" :class="chamado.status.toLowerCase()">
          {{ formatarStatus(chamado.status) }}
        </span>
      </div>
    </div>

    <!-- Barra de botões de ações -->
    <div class="icones-acao" @click.stop>
      <!-- Ação: Assumir (Aba Fila / ABERTO) -->
      <button 
        v-if="abaAtual === 'ABERTO'" 
        type="button"
        class="icone-btn btn-sucesso" 
        title="Assumir chamado" 
        @click="$emit('assumir')"
      >
        <i class="bi bi-check-circle-fill"></i>
      </button>

      <template v-if="abaAtual === 'EM_ATENDIMENTO'">
        <!-- Ação: Transferir (Aba Conversando / EM_ATENDIMENTO) -->
        <button 
          type="button"
          class="icone-btn" 
          title="Transferir chamado" 
          @click="$emit('abrir-transferir')"
        >
          <i class="bi bi-arrow-left-right"></i>
        </button>
        <!-- Ação: Fechar (Ícone mais intuitivo para "Finalizar") -->
        <button 
          type="button"
          class="icone-btn btn-perigo" 
          title="Finalizar chamado" 
          @click="$emit('abrir-fechar')"
        >
          <i class="bi bi-check-lg"></i>
        </button>
      </template>

      <!-- Ação: Reabrir (Aba Finalizados / FECHADO) -->
      <button 
        v-if="abaAtual === 'FECHADO'" 
        type="button"
        class="icone-btn" 
        title="Reabrir chamado" 
        @click="$emit('reabrir')"
      >
        <i class="bi bi-arrow-counterclockwise"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  chamado: { type: Object, required: true },
  abaAtual: { type: String, required: true }
})

// 🎯 Incluído o 'voltar' na lista de emissões de eventos do cabeçalho
defineEmits(['assumir', 'abrir-transferir', 'abrir-fechar', 'reabrir', 'abrir-detalhes', 'voltar'])

const inicial = computed(() => {
  const nome = props.chamado.cliente_nome
  return nome ? nome.charAt(0).toUpperCase() : '?'
})

function formatarStatus(status) {
  if (!status) return ''
  const mapeamento = {
    'EM_ATENDIMENTO': 'Conversando',
    'ABERTO': 'Fila de espera',
    'FECHADO': 'Finalizado'
  }
  return mapeamento[status] || status
}
</script>

<style scoped>
.topo {
  background: #fff;
  padding: 14px 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease;
}
.topo:hover {
  background: #f8fafc;
}
.titulo {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 🌟 ESTILIZAÇÃO DO BOTÃO VOLTAR EXCLUSIVO PARA SMARTPHONES */
.btn-voltar-mobile {
  background: none;
  border: none;
  font-size: 20px;
  color: #64748b;
  cursor: pointer;
  padding: 4px 8px 4px 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}
.btn-voltar-mobile:hover {
  color: #1e293b;
}

/* Oculta o botão de voltar por padrão em telas grandes (Desktop) */
@media (min-width: 768px) {
  .btn-voltar-mobile {
    display: none !important;
  }
}

.avatar-contato {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1a3c6e;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: bold;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(26, 60, 110, 0.1);
}
.avatar-contato.grupo {
  background: #6c5ce7;
  font-size: 15px;
}

.info-contato {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.info-contato strong {
  font-size: 15px;
  color: #1e293b;
  /* Garante que nomes gigantes no mobile não quebrem a linha do cabeçalho */
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-truncate: ellipsis;
}
@media (min-width: 576px) {
  .info-contato strong {
    max-width: 100%;
  }
}

.status-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 1px 8px;
  border-radius: 10px;
  width: fit-content;
}
.status-badge.aberto {
  background: #fef3c7;
  color: #d97706;
}
.status-badge.em_atendimento {
  background: #e0f2fe;
  color: #0369a1;
}
.status-badge.fechado {
  background: #f1f5f9;
  color: #475569;
}

.icones-acao {
  display: flex;
  gap: 8px;
}
.icone-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  line-height: 1;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}
.icone-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.icone-btn.btn-sucesso {
  color: #22c55e;
}
.icone-btn.btn-sucesso:hover {
  background: #dcfce7;
  color: #15803d;
}
.icone-btn.btn-perigo {
  color: #ef4444;
}
.icone-btn.btn-perigo:hover {
  background: #fee2e2;
  color: #b91c1c;
}
</style>