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
     <!-- No seu template (HTML do Vue) -->
<a @click.prevent="baixarArquivo(url)" class="link-download" style="cursor: pointer;">
  ⬇️ Baixar
</a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  url: { type: String, required: true },
  nomeArquivo: { type: String, default: '' }
})

const mostrarPreview = ref(false)

// ⚡ FORMATADOR DE NOME (UX):
// Corta o nome do PDF caso ele seja gigante para manter a bolha do chat simétrica
const nomeCortado = computed(() => {
  const nomeCompleto = props.nomeArquivo || 'Documento PDF'
  if (nomeCompleto.length <= 25) return nomeCompleto
  return nomeCompleto.substring(0, 22).trim() + '...'
})


async function baixarArquivo(fileUrl) {
  try {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    
    // Extrai o nome do arquivo da URL
    const nomeArquivo = fileUrl.split('/').pop() || 'documento.pdf';
    link.download = nomeArquivo;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Erro ao baixar arquivo:', error);
  }
}
</script>

<style scoped>
.pdf-viewer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 260px;
  background: rgba(0, 0, 0, 0.02);
  padding: 10px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.05);
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
  gap: 12px;
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