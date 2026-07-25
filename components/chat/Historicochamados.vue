<template>
  <div class="historico">
    <h6>
      <i class="bi bi-clock-history"></i> 
      Histórico de atendimentos
    </h6>

    <p v-if="historico.length === 0" class="vazio">
      Nenhum atendimento anterior.
    </p>

    <ul v-else class="lista">
      <li v-for="item in historico" :key="item.id">
        <!-- Badge dinâmica de status com fallback para status novos -->
        <span class="badge" :class="classeStatus(item.status)">
          {{ formatarStatus(item.status) }}
        </span>
        <span class="data">
          Chamado <strong>#{{ item.id }}</strong> — {{ formatarData(item.criado_em) }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useHistoricoChamados } from '@/Composables/useHistoricoChamados'

defineProps({
  historico: { type: Array, default: () => [] }
})

const {
  formatarData,
  classeStatus,
  formatarStatus
} = useHistoricoChamados()
</script>

<style scoped>
.historico {
  padding: 16px;
  border-bottom: 1px solid #eee;
  box-sizing: border-box;
  width: 100%;
}

h6 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #1a3c6e;
  margin-bottom: 14px;
  margin-top: 0;
  font-weight: 600;
}

.vazio {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.lista {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lista li {
  display: flex;
  align-items: center;
  flex-wrap: wrap; /* Garante quebra elegante em telas de celulares menores */
  gap: 10px;
  font-size: 13px;
  padding: 4px 0;
}

.badge {
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 10px;
  color: #fff;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

/* Status Conhecidos */
.badge-aberto { background: #f0ad4e; }
.badge-em_atendimento { background: #1a3c6e; }
.badge-fechado { background: #718096; }

/* Status de Fallback */
.badge-padrao { background: #a0aec0; }

.data {
  color: #4a5568;
  font-size: 12px;
  word-break: break-word;
  flex: 1;
  min-width: 0;
}
</style>