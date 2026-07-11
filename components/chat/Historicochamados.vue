<template>
  <div class="historico">
    <h6><i class="bi bi-clock-history"></i> Histórico de atendimentos</h6>

    <p v-if="historico.length === 0" class="vazio">Nenhum atendimento anterior.</p>

    <ul v-else class="lista">
      <li v-for="item in historico" :key="item.id">
        <span class="badge" :class="`badge-${item.status.toLowerCase()}`">{{ item.status }}</span>
        <span class="data">Chamado #{{ item.id }} — {{ formatarData(item.criado_em) }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  historico: { type: Array, default: () => [] }
})

function formatarData(dataString) {
  return new Date(dataString).toLocaleDateString('pt-BR')
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
  gap: 6px;
  font-size: 13px;
  color: #333;
  margin-bottom: 10px;
}
.vazio {
  font-size: 12px;
  color: #999;
}
.lista {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.lista li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
.badge {
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 10px;
  color: #fff;
}
.badge-aberto { background: #f0ad4e; }
.badge-em_atendimento { background: #1a3c6e; }
.badge-fechado { background: #999; }
.data {
  color: #555;
}
</style>