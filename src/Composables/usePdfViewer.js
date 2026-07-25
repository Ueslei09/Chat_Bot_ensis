// src/composables/usePdfViewer.js
import { ref, computed } from 'vue'

export function usePdfViewer(props) {
  const mostrarPreview = ref(false)

  // ⚡ FORMATADOR DE NOME (UX):
  // Corta o nome do PDF caso ele seja gigante para manter a bolha do chat simétrica
  const nomeCortado = computed(() => {
    const nomeCompleto = props.nomeArquivo || 'Documento PDF'
    if (nomeCompleto.length <= 25) return nomeCompleto
    return nomeCompleto.substring(0, 22).trim() + '...'
  })

  const baixarArquivo = async (fileUrl) => {
    try {
      const response = await fetch(fileUrl)
      const blob = await response.blob()
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      
      // Extrai o nome do arquivo da URL
      const nomeArquivoExtraido = fileUrl.split('/').pop() || 'documento.pdf'
      link.download = nomeArquivoExtraido
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error)
    }
  }

  return {
    mostrarPreview,
    nomeCortado,
    baixarArquivo
  }
}