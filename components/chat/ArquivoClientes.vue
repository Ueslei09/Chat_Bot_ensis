<template>
  <div class="arquivos">
    <h6><i class="bi bi-paperclip"></i> Arquivos enviados</h6>

    <p v-if="arquivos.length === 0" class="vazio">Nenhum arquivo enviado ainda.</p>

    <ul v-else class="lista">
      <li v-for="arquivo in arquivos" :key="arquivo.id">
        <i :class="iconePorTipo(arquivo.tipo_mime)"></i>
        <a :href="urlArquivo(arquivo.caminho_arquivo)" target="_blank">{{ arquivo.nome_arquivo }}</a>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { urlArquivo } from '@/services/mensagensServices.js'

defineProps({
  arquivos: { type: Array, default: () => [] }
})

function iconePorTipo(mime) {
  if (mime?.startsWith('image/')) return 'bi bi-image'
  if (mime?.startsWith('audio/')) return 'bi bi-music-note'
  return 'bi bi-file-earmark-pdf'
}
</script>

<style scoped>
.arquivos {
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
.lista a {
  color: #1a3c6e;
  text-decoration: none;
  word-break: break-all;
}
.lista a:hover {
  text-decoration: underline;
}
</style>