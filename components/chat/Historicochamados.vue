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
defineProps({
  historico: { type: Array, default: () => [] }
})

// ⚡ FORMATADOR SEGURO DE DATA: Previne falhas de runtime e 'Invalid Date'
function formatarData(dataString) {
  if (!dataString) return '--/--/----'
  try {
    const data = new Date(dataString)
    if (isNaN(data.getTime())) return '--/--/----'
    return data.toLocaleDateString('pt-BR')
  } catch {
    return '--/--/----'
  }
}

// ⚡ TRATAMENTO DE STATUS DESCONHECIDOS (Escalabilidade):
// Se houver um status novo no banco, ele ganha uma cor cinza elegante em vez de ficar transparente
function classeStatus(status) {
  if (!status) return 'badge-padrao'
  const statusFormatado = status.toLowerCase()
  const conhecidos = ['aberto', 'em_atendimento', 'fechado']
  return conhecidos.includes(statusFormatado) ? `badge-${statusFormatado}` : 'badge-padrao'
}

// Substitui underscores por espaços e deixa legível
function formatarStatus(status) {
  if (!status) return '-'
  return status.replace(/_/g, ' ')
}
</script>

<style scoped>
.historico {
  padding: 16px;
  border-bottom: 1px solid #eee;
}
h6 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #1a3c6e; /* Cor alinhada com a paleta do Moove Chat */
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

/* Status de Fallback (Caso surja pendente, cancelado, etc. no futuro) */
.badge-padrao { background: #a0aec0; }

.data {
  color: #4a5568;
  font-size: 12px;
}
</style>