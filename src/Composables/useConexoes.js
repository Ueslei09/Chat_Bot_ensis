// src/composables/useConexoes.js
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { listarConexoes } from '@/services/conexoesServices.js'
import { socket } from '@/services/api.js'

export function useConexoes() {
  const abaAtual = ref('ativas')
  const busca = ref('')
  const carregando = ref(false)

  const conexoesAtivas = ref([])
  const conexoesArquivadas = ref([])
  const arquivadasCount = ref(0)

  const conexoesFiltradas = computed(() => {
    const lista = abaAtual.value === 'ativas' ? conexoesAtivas.value : conexoesArquivadas.value
    if (!busca.value) return lista
    return lista.filter(c => c.nome?.toLowerCase().includes(busca.value.toLowerCase()))
  })

  function trocarAba(aba) {
    abaAtual.value = aba
  }

  function iconePorTipo(tipo) {
    const icones = { whatsapp: '📱', chat: '💬', helpdesk: '🎧' }
    return icones[tipo] || '🔌'
  }

  function rotuloTipo(tipo) {
    const nomes = { whatsapp: 'WhatsApp', chat: 'Chat', helpdesk: 'Helpdesk' }
    return nomes[tipo] || tipo
  }

  async function carregarConexoes() {
    carregando.value = true
    try {
      conexoesAtivas.value = await listarConexoes({ arquivadas: false })
      conexoesArquivadas.value = await listarConexoes({ arquivadas: true })
      arquivadasCount.value = conexoesArquivadas.value.length
    } catch (err) {
      console.error('Erro ao carregar conexões:', err)
    } finally {
      carregando.value = false
    }
  }

  function atualizarContadores() {
    arquivadasCount.value = conexoesArquivadas.value.length
  }

  function configurarEventosSocket() {
    if (!socket.connected) {
      socket.connect()
    }

    socket.on('conexaoAtualizada', (conexaoModificada) => {
      const indexAtiva = conexoesAtivas.value.findIndex(c => c.id === conexaoModificada.id)
      if (indexAtiva !== -1) {
        if (conexaoModificada.arquivada) {
          conexoesAtivas.value.splice(indexAtiva, 1)
          conexoesArquivadas.value.unshift(conexaoModificada)
        } else {
          conexoesAtivas.value[indexAtiva] = conexaoModificada
        }
        atualizarContadores()
        return
      }

      const indexArquvada = conexoesArquivadas.value.findIndex(c => c.id === conexaoModificada.id)
      if (indexArquvada !== -1) {
        if (!conexaoModificada.arquivada) {
          conexoesArquivadas.value.splice(indexArquvada, 1)
          conexoesAtivas.value.unshift(conexaoModificada)
        } else {
          conexoesArquivadas.value[indexArquvada] = conexaoModificada
        }
        atualizarContadores()
        return
      }

      if (conexaoModificada.arquivada) {
        conexoesArquivadas.value.unshift(conexaoModificada)
      } else {
        conexoesAtivas.value.unshift(conexaoModificada)
      }
      atualizarContadores()
    })
  }

  function removerEventosSocket() {
    socket.off('conexaoAtualizada')
  }

  onMounted(async () => {
    await carregarConexoes()
    configurarEventosSocket()
  })

  onUnmounted(() => {
    removerEventosSocket()
  })

  return {
    abaAtual,
    busca,
    carregando,
    conexoesFiltradas,
    arquivadasCount,
    trocarAba,
    iconePorTipo,
    rotuloTipo
  }
}