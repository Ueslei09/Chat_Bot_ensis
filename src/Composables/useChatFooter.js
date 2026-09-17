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
      
      // Normaliza o perfil para evitar erros com acentos ou maiúsculas/minúsculas ('USUÁRIO', 'ADM', 'MASTER', etc)
      const perfilNormalizado = props.usuario?.perfil 
        ? props.usuario.perfil.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
        : ''
      
      const ehAdminOuMaster = perfilNormalizado === 'ADM' || perfilNormalizado === 'MASTER' || perfilNormalizado === 'ADMIN'

      // Se for dono, admin, ou se o chamado não tiver um atendente travado estritamente, libera!
      if (souDono || ehAdminOuMaster || !props.chamado?.atendente_id) return 'liberado'
      
      // Se chegou aqui e tem outro atendente, mas você quer flexibilizar para a mesma empresa:
      // Se a empresa do chamado for igual à empresa do usuário logado, libera também!
      if (props.chamado?.empresa_id && props.usuario?.empresa_id && props.chamado.empresa_id === props.usuario.empresa_id) {
        return 'liberado'
      }

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