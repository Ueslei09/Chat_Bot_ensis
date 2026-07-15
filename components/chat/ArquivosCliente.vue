<template>
  <div class="arquivos">
    <h6>
      <i class="bi bi-paperclip"></i> 
      Arquivos enviados
    </h6>

    <p v-if="arquivos.length === 0" class="vazio">
      Nenhum arquivo enviado ainda.
    </p>

    <ul v-else class="lista">
      <li v-for="arquivo in arquivos" :key="arquivo.id" class="item-arquivo">
        <!-- Ícone dinâmico baseado no tipo mime -->
        <i :class="[iconePorTipo(arquivo.tipo_mime), 'icone-arquivo']"></i>
        
        <!-- Link seguro para download/abertura -->
        <a 
          :href="urlArquivo(arquivo.caminho_arquivo)" 
          target="_blank" 
          rel="noopener noreferrer"
          :title="arquivo.nome_arquivo"
          class="link-arquivo"
        >
          {{ arquivo.nome_arquivo }}
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { urlArquivo } from '@/services/mensagensServices.js'

defineProps({
  arquivos: { type: Array, default: () => [] }
})

// ⚡ MAPEAMENTO ESTENDIDO (Escalabilidade & UX):
// Garante o ícone semântico ideal para os principais formatos utilizados
function iconePorTipo(mime) {
  if (!mime) return 'bi bi-file-earmark'
  
  const mimeLower = mime.toLowerCase()
  if (mimeLower.startsWith('image/')) return 'bi bi-image'
  if (mimeLower.startsWith('audio/')) return 'bi bi-music-note'
  if (mimeLower.startsWith('video/')) return 'bi bi-play-btn'
  if (mimeLower.includes('pdf')) return 'bi bi-file-earmark-pdf'
  if (mimeLower.includes('zip') || mimeLower.includes('rar')) return 'bi bi-file-zip'
  if (mimeLower.includes('word') || mimeLower.includes('officedocument.word')) return 'bi bi-file-earmark-word'
  if (mimeLower.includes('excel') || mimeLower.includes('officedocument.spreadsheet')) return 'bi bi-file-earmark-excel'
  
  return 'bi bi-file-earmark-text' // Fallback para documentos genéricos
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
  gap: 8px;
  font-size: 13px;
  color: #1a3c6e; /* Unificado com o padrão de títulos do sistema */
  margin-top: 0;
  margin-bottom: 14px;
  font-weight: 600;
}
.vazio {
  font-size: 12px;
  color: #94a3b8;
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
.item-arquivo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}
.icone-arquivo {
  font-size: 16px;
  color: #1a3c6e;
  flex-shrink: 0;
}
.link-arquivo {
  color: #475569;
  text-decoration: none;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis; /* Corta nomes longos com reticências (...) elegantes */
  white-space: nowrap;
  flex: 1;
  transition: color 0.15s ease;
}
.link-arquivo:hover {
  color: #1a3c6e;
  text-decoration: underline;
}
</style>