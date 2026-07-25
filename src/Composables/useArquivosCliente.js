// src/composables/useArquivosCliente.js
export function useArquivosCliente() {
  // ⚡ MAPEAMENTO ESTENDIDO (Escalabilidade & UX):
  // Garante o ícone semântico ideal para os principais formatos utilizados
  const iconePorTipo = (mime) => {
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

  return {
    iconePorTipo
  }
}