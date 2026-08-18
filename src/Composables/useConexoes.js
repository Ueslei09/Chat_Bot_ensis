// src/Composables/useConexoes.js
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { listarConexoes } from '@/services/conexoesServices.js'
import { api, socket } from '@/services/api.js'

export function useConexoes() {
  const abaAtual = ref('ativas')
  const busca = ref('')
  const carregando = ref(false)

  const conexoesAtivas = ref([])
  const conexoesArquivadas = ref([])
  const arquivadasCount = ref(0)

  const modalAberto = ref(false)
  const nomeInstancia = ref('')
  const qrCode = ref(null)
  const carregandoQR = ref(false)

  let isMounted = true

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
      const ativas = await listarConexoes({ arquivadas: false })
      const arquivadas = await listarConexoes({ arquivadas: true })
      
      if (!isMounted) return

      conexoesAtivas.value = ativas
      conexoesArquivadas.value = arquivadas
      arquivadasCount.value = conexoesArquivadas.value.length
    } catch (err) {
      console.error('Erro ao carregar conexões:', err)
    } finally {
      if (isMounted) carregando.value = false
    }
  }

  function atualizarContadores() {
    arquivadasCount.value = conexoesArquivadas.value.length
  }

  function abrirModalCriar() {
    modalAberto.value = true
    qrCode.value = null
    nomeInstancia.value = ''
  }

  function fecharModal() {
    modalAberto.value = false
    qrCode.value = null
    carregarConexoes()
  }

  async function gerarQRCode() {
    if (!nomeInstancia.value.trim()) {
      alert('Por favor, informe o nome da instância!')
      return
    }

    carregandoQR.value = true
    try {
      const resposta = await api.post('/conexoes', {
        nomeInstancia: nomeInstancia.value
      }, {
        timeout: 30000
      })

      const dados = resposta.data.dados || resposta.data;
      
      if (dados.instance?.state === 'open') {
        alert('Esta instância já está conectada na API!');
        fecharModal();
        await carregarConexoes();
        return;
      }
      
      qrCode.value = 
        dados.base64 || 
        dados.qrcode?.base64 || 
        dados.qrcode?.code || 
        dados.code ||
        dados.qrcode || 
        null;

      if (!qrCode.value) {
        alert('A API conectou, mas a instância já pode estar ativa. Verifique o status.');
      }

    } catch (err) {
      console.error('Erro ao gerar QR Code:', err)
      alert(err.response?.data?.erro || 'Erro ao gerar QR Code')
    } finally {
      if (isMounted) carregandoQR.value = false
    }
  }

  async function abrirParaReconectar(conexao) {
    nomeInstancia.value = conexao.numero || conexao.nome || ''; 
    modalAberto.value = true;
    qrCode.value = null; 

    if (nomeInstancia.value) {
      await gerarQRCode();
    }
  }

  // 🔌 ADICIONADO: Função para desconectar a instância
  async function desconectarInstancia(conexao) {
    if (!confirm(`Deseja realmente desconectar esta instância?`)) {
      return
    }

    carregando.value = true
    try {
      await api.delete(`/conexoes/${conexao.id}`)
      alert('Instância desconectada com sucesso!')
      await carregarConexoes()
    } catch (err) {
      console.error('Erro ao desconectar:', err)
      alert(err.response?.data?.erro || 'Erro ao desconectar instância')
    } finally {
      carregando.value = false
    }
  }

  function configurarEventosSocket() {
    if (!socket.connected) {
      socket.connect()
    }

    socket.on('conexaoAtualizada', (conexaoModificada) => {
      if (!isMounted) return
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

      const indexArquivada = conexoesArquivadas.value.findIndex(c => c.id === conexaoModificada.id)
      if (indexArquivada !== -1) {
        if (!conexaoModificada.arquivada) {
          conexoesArquivadas.value.splice(indexArquivada, 1)
          conexoesAtivas.value.unshift(conexaoModificada)
        } else {
          conexoesArquivadas.value[indexArquivada] = conexaoModificada
        }
        atualizarContadores()
        return
      }
    })
  }

  function removerEventosSocket() {
    socket.off('conexaoAtualizada')
  }

  onMounted(async () => {
    isMounted = true
    await carregarConexoes()
    configurarEventosSocket()
  })

  onUnmounted(() => {
    isMounted = false
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
    rotuloTipo,
    modalAberto,
    nomeInstancia,
    qrCode,
    carregandoQR,
    abrirModalCriar,
    fecharModal,
    gerarQRCode,
    abrirParaReconectar,
    desconectarInstancia // <--- Exportado com sucesso aqui
  }
}