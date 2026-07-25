// src/composables/useImageViewer.js
import { ref, onBeforeUnmount } from 'vue'

export function useImageViewer() {
  const aberta = ref(false)

  // Fecha o modal ao apertar a tecla ESC do teclado
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      fecharModal()
    }
  }

  const abrirModal = () => {
    aberta.value = true
    document.addEventListener('keydown', escHandler)
    // Bloqueia o scroll do chat ao fundo enquanto visualiza a imagem em tela cheia
    document.body.style.overflow = 'hidden'
  }

  const fecharModal = () => {
    aberta.value = false
    document.removeEventListener('keydown', escHandler)
    // Restaura o scroll do site
    document.body.style.overflow = ''
  }

  // Limpeza preventiva em caso de destruição do componente com o modal ainda aberto
  onBeforeUnmount(() => {
    document.removeEventListener('keydown', escHandler)
    document.body.style.overflow = ''
  })

  return {
    aberta,
    abrirModal,
    fecharModal
  }
}