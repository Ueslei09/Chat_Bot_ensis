<template>
  <!-- Modo "citação dentro da bolha" (mostra o texto resumido da original) -->
  <div v-if="modo === 'citacao'" class="citacao-resposta">
    {{ texto }}
  </div>

  <!-- Modo "preview acima do campo de envio", com botão de cancelar -->
  <div v-else class="preview-barra" :class="modo">
    <span>{{ rotulo }}: {{ texto }}</span>
    <button @click="$emit('cancelar')">✕</button>
  </div>
</template>

<script setup>
defineProps({
  // 'citacao' (dentro da bolha) | 'resposta' (barra azul) | 'edicao' (barra amarela)
  modo: { type: String, default: 'citacao' },
  texto: { type: String, required: true },
  rotulo: { type: String, default: 'Respondendo' }
})

defineEmits(['cancelar'])
</script>

<style scoped>
.citacao-resposta {
  border-left: 3px solid #1a3c6e;
  background: rgba(0, 0, 0, 0.04);
  padding: 4px 8px;
  font-size: 12px;
  color: #555;
  margin-bottom: 4px;
  border-radius: 4px;
}

.preview-barra {
  padding: 8px 16px;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #ddd;
}
.preview-barra.resposta {
  background: #eef3fb;
  color: #1a3c6e;
}
.preview-barra.edicao {
  background: #fff8e1;
  color: #8a6d1a;
}
.preview-barra button {
  background: none;
  border: none;
  cursor: pointer;
  color: #c0392b;
}
</style>