<template>
  <div class="topo">
    <div class="titulo">
      <strong>Chamado #{{ chamado.id }}</strong>
      <span class="status-badge">{{ chamado.status }}</span>
    </div>

    <div class="icones-acao">
      <button v-if="abaAtual === 'ABERTO'" class="icone-btn" title="Assumir chamado" @click="$emit('assumir')">
        ✅
      </button>

      <template v-if="abaAtual === 'EM_ATENDIMENTO'">
        <button class="icone-btn" title="Transferir chamado" @click="$emit('abrir-transferir')">🔄</button>
        <button class="icone-btn" title="Fechar chamado" @click="$emit('abrir-fechar')">✂️</button>
      </template>

      <button v-if="abaAtual === 'FECHADO'" class="icone-btn" title="Reabrir chamado" @click="$emit('reabrir')">
        ↩️
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  chamado: { type: Object, required: true },
  abaAtual: { type: String, required: true }
})

// Eventos: 'assumir', 'abrir-transferir', 'abrir-fechar', 'reabrir'
defineEmits(['assumir', 'abrir-transferir', 'abrir-fechar', 'reabrir'])
</script>

<style scoped>
.topo {
  background: #fff;
  padding: 14px 20px;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.titulo {
  display: flex;
  align-items: center;
  gap: 10px;
}
.status-badge {
  font-size: 12px;
  color: #666;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 10px;
}
.icones-acao {
  display: flex;
  gap: 6px;
}
.icone-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 6px;
  line-height: 1;
}
.icone-btn:hover {
  background: #f0f0f0;
}
</style>