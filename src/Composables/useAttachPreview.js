// src/composables/useAttachPreview.js
import { ref, computed, watch, onBeforeUnmount, nextTick } from 'vue'

export function useAttachPreview(props, emit) {
  const legenda = ref('')
  const urlLocal = ref('')
  const inputLegenda = ref(null)

  const ehImagem = computed(() => props.arquivo.type.startsWith('image/'))
  const ehAudio = computed(() => props.arquivo.type.startsWith('audio/'))

  // ⚡ WATCH REATIVO INTELIGENTE:
  // Cria e reconstrói a URL temporária dinamicamente, liberando a memória anterior!
  watch(
    () => props.arquivo,
    (novoArquivo) => {
      if (urlLocal.value) {
        URL.revokeObjectURL(urlLocal.value)
      }
      if (novoArquivo) {
        urlLocal.value = URL.createObjectURL(novoArquivo)
      } else {
        urlLocal.value = ''
      }
      
      nextTick(() => {
        inputLegenda.value?.focus()
      })
    },
    { immediate: true }
  )

  const tamanhoFormatado = computed(() => {
    const kb = props.arquivo.size / 1024
    if (kb < 1024) return `${kb.toFixed(0)} KB`
    return `${(kb / 1024).toFixed(1)} MB`
  })

  const extensao = computed(() => {
    const partes = props.arquivo.name.split('.')
    return partes.length > 1 ? partes.pop().toUpperCase() : ''
  })

  const enviar = () => {
    emit('enviar', legenda.value)
  }

  onBeforeUnmount(() => {
    if (urlLocal.value) {
      URL.revokeObjectURL(urlLocal.value)
    }
  })

  return {
    legenda,
    urlLocal,
    inputLegenda,
    ehImagem,
    ehAudio,
    tamanhoFormatado,
    extensao,
    enviar
  }
}