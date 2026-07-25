// src/composables/useChatFooter.js
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

export function useChatFooter(props, emit) {
  const texto = ref('')
  const textareaRef = ref(null)
  const footerRef = ref(null)

  const emojiAberto = ref(false)
  const emojisComuns = ['😀', '😂', '😊', '😍', '👍', '🙏', '🎉', '❤️', '😢', '🔥']

  const menuAnexoAberto = ref(false)
  const inputDocumento = ref(null)
  const inputFoto = ref(null)
  const inputAudio = ref(null)
  const arquivoPendente = ref(null)

  const estado = computed(() => {
    if (props.status === 'FECHADO') return 'encerrado'
    if (props.status === 'AGUARDANDO_CLIENTE') return 'aguardandoCliente'

    if (props.status === 'EM_ATENDIMENTO') {
      const souDono = props.chamado?.atendente_id === props.usuario?.id
      const souAdmin = props.usuario?.perfil === 'ADM'
      if (souDono || souAdmin) return 'liberado'
      return 'bloqueado'
    }

    return 'liberado'
  })

  const aoClicarBotaoPrincipal = () => {
    if (props.podeAssumir) {
      emit('assumirChamado')
    } else {
      emit('solicitarTransferencia')
    }
  }

  // Sincroniza o texto de edição vindo do componente pai
  watch(() => props.textoInicial, (novoValor) => { 
    texto.value = novoValor || '' 
    nextTick(ajustarAltura)
  })

  const resumoTexto = (t) => {
    if (!t) return ''
    return t.length > 60 ? t.slice(0, 60) + '...' : t
  }

  const aoEnviar = (evento) => {
    if (evento?.shiftKey) return // Permite quebra de linha com Shift+Enter
    if (!texto.value.trim()) return

    if (props.editando) {
      emit('confirmar-edicao', texto.value)
    } else {
      emit('enviarMensagem', texto.value)
    }
    
    texto.value = ''
    nextTick(ajustarAltura)
  }

  // ------------------------------------------------------------
  // AJUSTE DINÂMICO DE ALTURA (UX WhatsApp)
  // ------------------------------------------------------------
  const ajustarAltura = () => {
    const textarea = textareaRef.value
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
  }

  // ------------------------------------------------------------
  // EMOJI
  // ------------------------------------------------------------
  const alternarEmoji = () => {
    emojiAberto.value = !emojiAberto.value
    emit('abrirEmoji')
  }

  const inserirEmoji = (emoji) => {
    texto.value += emoji
    emojiAberto.value = false
    nextTick(ajustarAltura)
  }

  // ------------------------------------------------------------
  // ANEXO
  // ------------------------------------------------------------
  const alternarAnexo = () => {
    menuAnexoAberto.value = !menuAnexoAberto.value
  }

  const abrirSeletor = (tipo) => {
    menuAnexoAberto.value = false
    if (tipo === 'documento') inputDocumento.value?.click()
    if (tipo === 'foto') inputFoto.value?.click()
    if (tipo === 'audio') inputAudio.value?.click()
  }

  const aoSelecionarArquivo = (evento) => {
    const arquivo = evento.target.files[0]
    if (arquivo) arquivoPendente.value = arquivo
    evento.target.value = ''
  }

  const confirmarEnvioArquivo = (legenda) => {
    emit('anexarArquivo', { arquivo: arquivoPendente.value, legenda })
    arquivoPendente.value = null
  }

  const aoGravarAudio = (arquivoAudio) => {
    emit('gravarAudio', arquivoAudio)
  }

  // Fechamento de menus ao clicar fora
  const fecharMenusAoClicarFora = (event) => {
    if (!emojiAberto.value && !menuAnexoAberto.value) return

    if (footerRef.value && !footerRef.value.contains(event.target)) {
      emojiAberto.value = false
      menuAnexoAberto.value = false
    }
  }

  onMounted(() => {
    document.addEventListener('click', fecharMenusAoClicarFora, true)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', fecharMenusAoClicarFora, true)
  })

  const limpar = () => {
    texto.value = ''
    nextTick(ajustarAltura)
  }

  return {
    texto,
    textareaRef,
    footerRef,
    estado,
    emojiAberto,
    emojisComuns,
    menuAnexoAberto,
    inputDocumento,
    inputFoto,
    inputAudio,
    arquivoPendente,
    aoClicarBotaoPrincipal,
    resumoTexto,
    aoEnviar,
    ajustarAltura,
    alternarEmoji,
    inserirEmoji,
    alternarAnexo,
    abrirSeletor,
    aoSelecionarArquivo,
    confirmarEnvioArquivo,
    aoGravarAudio,
    limpar
  }
}