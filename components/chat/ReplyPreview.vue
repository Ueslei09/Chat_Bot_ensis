<template>
  <!-- Modo "citação dentro da bolha" (mostra o texto resumido da original) -->
  <div v-if="modo === 'citacao'" class="citacao-resposta" :title="texto">
    {{ textoFormatado }}
  </div>

  <!-- Modo "preview acima do campo de envio", com botão de cancelar -->
  <div v-else class="preview-barra" :class="modo" :title="texto">
    <span class="preview-texto">
      <strong>{{ rotulo }}:</strong> {{ textoFormatado }}
    </span>
    <button 
      type="button" 
      class="btn-fechar-preview" 
      aria-label="Cancelar ação" 
      @click="$emit('cancelar')"
    >
      ✕
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 'citacao' (dentro da bolha de chat) | 'resposta' (barra azul) | 'edicao' (barra amarela)
  modo: { 
    type: String, 
    default: 'citacao',
    validator: (value) => ['citacao', 'resposta', 'edicao'].includes(value)
  },
  texto: { 
    type: String, 
    required: true 
  },
  rotulo: { 
    type: String, 
    default: 'Respondendo' 
  },
  // Limite máximo de caracteres visíveis antes de cortar com "..."
  limiteCaracteres: {
    type: Number,
    default: 65
  }
})

defineEmits(['cancelar'])

// ⚡ FORMATADOR INTELIGENTE (UX & Escalabilidade):
// Evita que mensagens gigantescas quebrem a estrutura do chat e do input
const textoFormatado = computed(() => {
  if (!props.texto) return ''
  if (props.texto.length <= props.limiteCaracteres) return props.texto
  return props.texto.substring(0, props.limiteCaracteres).trim() + '...'
})
</script>

<style scoped>
.citacao-resposta {
  border-left: 3px solid #1a3c6e;
  background: rgba(0, 0, 0, 0.04);
  padding: 6px 10px;
  font-size: 12px;
  color: #555;
  margin-bottom: 6px;
  border-radius: 4px;
  max-width: 100%;
  word-break: break-all; /* Evita quebra de palavras esquisitas */
}

.preview-barra {
  padding: 10px 16px;
  font-size: 13px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e2e8f0;
  animation: slideUp 0.15s ease-out; /* Transição sutil ao abrir o preview */
}

.preview-texto {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 12px;
}

.preview-barra.resposta {
  background: #eef3fb;
  color: #1a3c6e;
  border-left: 4px solid #1a3c6e;
}

.preview-barra.edicao {
  background: #fff8e1;
  color: #8a6d1a;
  border-left: 4px solid #f5b041;
}

.btn-fechar-preview {
  background: none;
  border: none;
  cursor: pointer;
  color: #c0392b;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s;
}

.btn-fechar-preview:hover {
  background-color: rgba(192, 57, 43, 0.1);
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>