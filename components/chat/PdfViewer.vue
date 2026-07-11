<template>
  <div class="pdf-viewer">
    <div class="pdf-linha" @click="mostrarPreview = !mostrarPreview">
      📄 <span class="pdf-nome">{{ nomeArquivo || 'Documento PDF' }}</span>
    </div>

    <!-- Preview inline, abre/fecha ao clicar na linha acima -->
    <iframe v-if="mostrarPreview" :src="url" class="preview-frame"></iframe>

    <div class="pdf-acoes">
      <a :href="url" target="_blank" class="link-pdf">Abrir em nova aba</a>
      <a :href="url" download class="link-download">⬇️ Baixar</a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  url: { type: String, required: true },
  nomeArquivo: { type: String, default: '' }
})

const mostrarPreview = ref(false)
</script>

<style scoped>
.pdf-viewer {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 260px;
}
.pdf-linha {
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.pdf-nome {
  text-decoration: underline;
  word-break: break-all;
}
.preview-frame {
  width: 100%;
  height: 200px;
  border: 1px solid #ddd;
  border-radius: 6px;
}
.pdf-acoes {
  display: flex;
  gap: 10px;
}
.link-pdf,
.link-download {
  font-size: 12px;
  color: #1a3c6e;
  text-decoration: none;
}
.link-pdf:hover,
.link-download:hover {
  text-decoration: underline;
}
</style>