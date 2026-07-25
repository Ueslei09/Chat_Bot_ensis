// src/composables/useMessageBubble.js
import { computed, ref, onMounted, onUnmounted } from 'vue'

export function useMessageBubble(props, emit) {
  const reacao = ref('')
  const menuAberto = ref(false)

  const salvarReacao = (emoji) => {
    reacao.value = emoji
    menuAberto.value = false
  }

  const toggleMenu = () => {
    menuAberto.value = !menuAberto.value
  }

  const emitirAcao = (evento) => {
    menuAberto.value = false
    if (evento === 'apagar') {
      emit('apagar', props.mensagem.id)
    } else if (evento === 'editar') {
      emit('editar', props.mensagem)
    } else {
      emit(evento, props.mensagem)
    }
  }

  const fecharMenuExterno = () => {
    menuAberto.value = false
  }

  onMounted(() => {
    document.addEventListener('click', fecharMenuExterno)
  })

  onUnmounted(() => {
    document.removeEventListener('click', fecharMenuExterno)
  })

  const podeEditar = computed(() => props.mensagem.tipo === 'TEXTO' && props.souAutor)
  const podeApagar = computed(() => props.souAdmin || props.podeApagarGeral)

  const textoMensagemOriginal = computed(() => {
    const original = props.todasMensagens.find(m => m.id === props.mensagem.resposta_a)
    if (!original) return 'Mensagem original'
    
    if (original.tipo === 'IMAGEM') return '📷 Foto'
    if (original.tipo === 'AUDIO') return '🎵 Áudio'
    if (original.tipo === 'PDF') return '📄 Documento PDF'
    
    return original.conteudo.length > 60 
      ? original.conteudo.substring(0, 60).trim() + '...' 
      : original.conteudo
  })

  const formatarHora = (dataString) => {
    if (!dataString) return '--:--'
    try {
      const data = new Date(dataString)
      if (isNaN(data.getTime())) return '--:--'
      return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return '--:--'
    }
  }

  return {
    reacao,
    menuAberto,
    podeEditar,
    podeApagar,
    textoMensagemOriginal,
    salvarReacao,
    toggleMenu,
    emitirAcao,
    formatarHora
  }
}