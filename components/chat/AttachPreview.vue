<template>
  <div class="preview-overlay">
    <div class="preview-topo">
      <button class="btn-fechar" @click="$emit('cancelar')">✕</button>
      <span class="nome-arquivo">{{ arquivo.name }}</span>
      <span></span>
    </div>

    <div class="preview-corpo">
      <!-- Imagem: mostra de verdade -->
      <img v-if="ehImagem" :src="urlLocal" alt="Prévia da imagem" class="preview-imagem" />

      <!-- Áudio: player -->
      <audio v-else-if="ehAudio" :src="urlLocal" controls class="preview-audio"></audio>

      <!-- Qualquer outro tipo (PDF, doc, etc): placeholder genérico -->
      <div v-else class="preview-generico">
        <div class="icone-arquivo">📄</div>
        <p class="texto-indisponivel">Prévia indisponível</p>
        <p class="detalhes-arquivo">{{ tamanhoFormatado }} · {{ extensao }}</p>
      </div>
    </div>

    <form class="preview-rodape" @submit.prevent="enviar">
      <input v-model="legenda" type="text" placeholder="Digite uma legenda (opcional)..." />
      <button type="submit" class="btn-enviar">➤</button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'

const props = defineProps({
  arquivo: { type: File, required: true }
})

const emit = defineEmits(['cancelar', 'enviar'])

const legenda = ref('')

// Cria uma URL temporária só pra mostrar a prévia (imagem/áudio)
// no navegador, sem precisar subir o arquivo pro servidor ainda
const urlLocal = URL.createObjectURL(props.arquivo)

const ehImagem = computed(() => props.arquivo.type.startsWith('image/'))
const ehAudio = computed(() => props.arquivo.type.startsWith('audio/'))

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

// Libera a memória da URL temporária quando o componente fecha
onBeforeUnmount(() => {
  URL.revokeObjectURL(urlLocal)
})
</script>

<style scoped>
.preview-overlay {
  position: fixed;
  inset: 0;
  background: #0f0f1a;
  z-index: 300;
  display: flex;
  flex-direction: column;
}

.preview-topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  color: #fff;
}
.btn-fechar {
  background: none;
  border: none;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
}
.nome-arquivo {
  font-size: 14px;
  color: #ccc;
}

.preview-corpo {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-imagem {
  max-width: 90%;
  max-height: 70vh;
  border-radius: 8px;
}
.preview-audio {
  width: 320px;
}

.preview-generico {
  background: #1c1c2e;
  border-radius: 10px;
  padding: 40px 60px;
  text-align: center;
}
.icone-arquivo {
  width: 70px;
  height: 70px;
  background: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  margin: 0 auto 16px;
}
.texto-indisponivel {
  color: #ddd;
  font-size: 15px;
  margin: 0 0 4px;
}
.detalhes-arquivo {
  color: #888;
  font-size: 12px;
  margin: 0;
}

.preview-rodape {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
}
.preview-rodape input {
  flex: 1;
  padding: 12px 16px;
  border-radius: 20px;
  border: none;
  background: #1c1c2e;
  color: #fff;
  font-size: 14px;
}
.preview-rodape input::placeholder {
  color: #888;
}
.btn-enviar {
  background: #27ae60;
  color: #fff;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
}
</style>