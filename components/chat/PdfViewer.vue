<template>
  <div class="pdf-viewer">
    <!-- Linha clicável com título do PDF cortado de forma amigável -->
    <button 
      type="button" 
      class="pdf-linha" 
      :title="nomeArquivo || 'Documento PDF'"
      @click="mostrarPreview = !mostrarPreview"
    >
      <span class="icone-pdf">📄</span> 
      <span class="pdf-nome">{{ nomeCortado }}</span>
    </button>

    <!-- Preview inline seguro: Sandbox impede que scripts maliciosos roubem dados do front -->
    <iframe 
      v-if="mostrarPreview" 
      :src="url" 
      class="preview-frame"
      sandbox="allow-scripts allow-same-origin allow-forms"
      title="Visualizador de PDF"
    ></iframe>

    <!-- Ações simples e diretas -->
    <div class="pdf-acoes">
      <a :href="url" target="_blank" rel="noopener noreferrer" class="link-pdf">
        👁️ Visualizar
      </a>
      <a @click.prevent="baixarArquivo(url)" class="link-download" style="cursor: pointer;">
        ⬇️ Baixar
      </a>
    </div>
  </div>
</template>

<script setup>
import { usePdfViewer } from '@/Composables/usePdfViewer'

const props = defineProps({
  url: { type: String, required: true },
  nomeArquivo: { type: String, default: '' }
})

const {
  mostrarPreview,
  nomeCortado,
  baixarArquivo
} = usePdfViewer(props)
</script>

<style scoped>
.pdf-viewer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 280px;
  background: rgba(0, 0, 0, 0.02);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

@media (min-width: 768px) {
  .pdf-viewer {
    max-width: 320px;
  }
}

.pdf-linha {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  text-align: left;
  width: 100%;
}

.icone-pdf {
  font-size: 16px;
  flex-shrink: 0;
}

.pdf-nome {
  text-decoration: none;
  font-weight: 500;
  color: #1a3c6e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  flex: 1;
}

.pdf-linha:hover .pdf-nome {
  text-decoration: underline;
}

.preview-frame {
  width: 100%;
  height: 220px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background-color: #fff;
  transition: all 0.2s ease;
}

.pdf-acoes {
  display: flex;
  gap: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding-top: 8px;
  margin-top: 2px;
}

.link-pdf,
.link-download {
  font-size: 12px;
  color: #1a3c6e;
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.link-pdf:hover,
.link-download:hover {
  text-decoration: underline;
  color: #11294a;
}
</style>