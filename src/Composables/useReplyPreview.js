// src/composables/useReplyPreview.js
import { computed } from 'vue'

export function useReplyPreview(props) {
  // ⚡ FORMATADOR INTELIGENTE: Evita que mensagens gigantescas quebrem o chat e o input
  const textoFormatado = computed(() => {
    if (!props.texto) return ''
    if (props.texto.length <= props.limiteCaracteres) return props.texto
    return props.texto.substring(0, props.limiteCaracteres).trim() + '...'
  })

  return {
    textoFormatado
  }
}