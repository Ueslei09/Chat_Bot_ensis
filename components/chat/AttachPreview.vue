<template>
  <div class="preview-overlay" role="dialog" aria-modal="true">
    <!-- Cabeçalho -->
    <div class="preview-topo">
      <button type="button" class="btn-fechar" aria-label="Cancelar envio" @click="$emit('cancelar')">
        ✕
      </button>
      <span class="nome-arquivo" :title="arquivo.name">{{ arquivo.name }}</span>
      <span class="espacador"></span>
    </div>

    <!-- Área da Prévia -->
    <div class="preview-corpo">
      <!-- Caso seja Imagem -->
      <img v-if="ehImagem" :src="urlLocal" alt="Prévia da imagem" class="preview-imagem" />

      <!-- Caso seja Áudio -->
      <div v-else-if="ehAudio" class="preview-audio-container">
        <div class="icone-audio-grande">🎵</div>
        <audio :src="urlLocal" controls class="preview-audio"></audio>
      </div>

      <!-- Caso seja outro tipo (PDF, Documentos) -->
      <div v-else class="preview-generico">
        <div class="icone-arquivo">📄</div>
        <p class="texto-indisponivel">Visualização indisponível</p>
        <p class="detalhes-arquivo">{{ tamanhoFormatado }} • {{ extensao || 'ARQUIVO' }}</p>
      </div>
    </div>

    <!-- Input de Legenda e Envio -->
    <form class="preview-rodape" @submit.prevent="enviar">
      <input 
        v-model="legenda" 
        type="text" 
        placeholder="Adicione uma legenda (opcional)..." 
        ref="inputLegenda"
        autofocus
      />
      <button type="submit" class="btn-enviar" title="Confirmar e enviar">
        <i class="bi bi-send-fill"></i>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
  arquivo: { type: File, required: true }
})

const emit = defineEmits(['cancelar', 'enviar'])

const legenda = ref('')
const urlLocal = ref('')
const inputLegenda = ref(null)

const ehImagem = computed(() => props.arquivo.type.startsWith('image/'))
const ehAudio = computed(() => props.arquivo.type.startsWith('audio/'))

// ⚡ WATCH REATIVO INTELIGENTE:
// Cria e reconstrói a URL temporária dinamicamente, liberando a memória anterior!
watch(
  () => props.arquivo,
  (novoArquivo) => {
    if (urlLocal.value) {
      URL.revokeObjectURL(urlLocal.value) // Previne vazamento de memória do arquivo antigo
    }
    if (novoArquivo) {
      urlLocal.value = URL.createObjectURL(novoArquivo)
    } else {
      urlLocal.value = ''
    }
    
    // Foca automaticamente na legenda ao abrir
    nextTick(() => {
      inputLegenda.value?.focus()
    })
  },
  { immediate: true }
)

const tamanhoFormatado = computed(() => {
  const kb = props.arquivo.size / 1024
  if (kb < 1024) return `${kb.toFixed(0)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
})

const extensao = computed(() => {
  const partes = props.arquivo.name.split('.')
  return partes.length > 1 ? partes.pop().toUpperCase() : ''
})

function enviar() {
  emit('enviar', legenda.value)
}

// Limpeza de segurança impecável ao fechar
onBeforeUnmount(() => {
  if (urlLocal.value) {
    URL.revokeObjectURL(urlLocal.value)
  }
})
</script>

<style scoped>
.preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.98); /* Fundo escuro mais premium */
  z-index: 9999; /* Garante que fique por cima de modais secundários */
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.2s ease-out;
}

.preview-topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.btn-fechar {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.15s;
}
.btn-fechar:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}
.nome-arquivo {
  font-size: 14px;
  font-weight: 500;
  color: #e2e8f0;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.espacador {
  width: 28px; /* Mantém simetria com o botão de fechar à esquerda */
}

.preview-corpo {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.preview-imagem {
  max-width: 90%;
  max-height: 65vh;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  object-fit: contain;
}

/* Áudio */
.preview-audio-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
.icone-audio-grande {
  font-size: 64px;
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3));
  animation: float 3s ease-in-out infinite;
}
.preview-audio {
  width: 320px;
  border-radius: 30px;
}

/* Outros Arquivos (PDF, DOCS) */
.preview-generico {
  background: #1e293b;
  border-radius: 12px;
  padding: 40px 50px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  max-width: 340px;
}
.icone-arquivo {
  width: 64px;
  height: 64px;
  background: #fff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin: 0 auto 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.texto-indisponivel {
  color: #f1f5f9;
  font-size: 15px;
  font-weight: 500;
  margin: 0 0 6px;
}
.detalhes-arquivo {
  color: #94a3b8;
  font-size: 12px;
  margin: 0;
}

/* Rodapé de Legenda */
.preview-rodape {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  background-color: rgba(15, 23, 42, 0.6);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.preview-rodape input {
  flex: 1;
  padding: 12px 20px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #1e293b;
  color: #fff;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}
.preview-rodape input:focus {
  border-color: #27ae60;
  background: #0f172a;
}
.preview-rodape input::placeholder {
  color: #64748b;
}
.btn-enviar {
  background: #27ae60;
  color: #fff;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.btn-enviar:hover {
  background: #219653;
  transform: scale(1.05);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>