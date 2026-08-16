// src/composables/useChamados.js
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { listarAtendentes } from '@/services/usuariosServices.js'
import { socket } from '@/services/api.js'

import {
  listarMensagens,
  enviarMensagem,
  enviarArquivo,
  apagarMensagem,
  editarMensagem,
  encaminharMensagem
} from '@/services/mensagensServices.js'

import {
  listarChamadosPorStatus,
  assumirChamado,
  fecharChamado,
  transferirChamado,
  reabrirChamado,
  buscarDetalhesChamado,
  retomarChamado,
} from '@/services/chamadoServices.js'

import { isAdmin, getIdUsuario, getNomeUsuario } from '@/services/authServices.js'

export function useChamados() {
  const route = useRoute()

  const chatMessagesComponent = ref(null)
  const mostrarBotaoScroll = ref(false)
  const mensagensNaoLidas = ref(0)
  let elementoScroll = null

  const abaAtual = ref('EM_ATENDIMENTO')
  const paginaAtual = ref(1) 
  const limitePorPagina = ref(20) 
  const chamados = ref([])
  const carregando = ref(false)
  const chamadoSelecionado = ref(null)
  const mensagemAcao = ref('')
  const detalhesAbertos = ref(false)
  const detalhesChamado = ref(null)
  const carregandoDetalhes = ref(false)




  const admin = isAdmin()
  const meuId = getIdUsuario()

  const usuarioLogado = computed(() => ({
    id: meuId,
    nome: getNomeUsuario(),
    perfil: admin ? 'ADM' : 'USER'
  }))

  const podeAssumirChamado = computed(() => admin)

  function rolarParaOFim() {
    if (elementoScroll) {
      elementoScroll.scrollTo({
        top: elementoScroll.scrollHeight,
        behavior: 'smooth'
      })
    }
    mostrarBotaoScroll.value = false
    mensagensNaoLidas.value = 0
  }

  function monitorarScroll(e) {
    const { scrollTop, scrollHeight, clientHeight } = e.target
    const distanciaDoFim = scrollHeight - scrollTop - clientHeight
    mostrarBotaoScroll.value = distanciaDoFim > 300
    if (distanciaDoFim < 20) {
      mensagensNaoLidas.value = 0
    }
  }

  watch(chatMessagesComponent, (novoComponente) => {
    if (novoComponente) {
      elementoScroll = novoComponente.scrollContainer || novoComponente.$el?.querySelector('.area-mensagens') || novoComponente.$el
    }
  })

  function reagirMensagem({ mensagemId, emoji }) {
    const index = mensagens.value.findIndex(m => m.id === mensagemId)
    if (index !== -1) {
      mensagens.value[index].reacao = emoji
    }
  }

  function configurarEventosSocket() {
    if (!socket.connected) socket.connect()

    socket.on('novaMensagem', (mensagem) => {
      if (chamadoSelecionado.value && mensagem.chamado_id === chamadoSelecionado.value.id) {
        const jaExiste = mensagens.value.some(m => m.id === mensagem.id)
        if (!jaExiste) {
          mensagens.value.push(mensagem)
          if (mostrarBotaoScroll.value) {
            mensagensNaoLidas.value++
          } else {
            nextTick(() => { rolarParaOFim() })
          }
        }
      }
    })

    socket.on('mensagemEditada', (mensagemAtualizada) => {
      if (chamadoSelecionado.value && mensagemAtualizada.chamado_id === chamadoSelecionado.value.id) {
        const index = mensagens.value.findIndex(m => m.id === mensagemAtualizada.id)
        if (index !== -1) mensagens.value[index] = mensagemAtualizada
      }
    })

    socket.on('mensagemApagada', ({ id, chamado_id }) => {
      if (chamadoSelecionado.value && chamado_id === chamadoSelecionado.value.id) {
        mensagens.value = mensagens.value.filter(m => m.id !== id)
      }
    })

    socket.on('chamadoAtualizado', (chamadoModificado) => {
      const index = chamados.value.findIndex(c => c.id === chamadoModificado.id)
      if (index !== -1) {
        if (chamadoModificado.status !== abaAtual.value) {
          chamados.value.splice(index, 1)
          if (chamadoSelecionado.value?.id === chamadoModificado.id) chamadoSelecionado.value = null
        } else {
          chamados.value[index] = chamadoModificado
          if (chamadoSelecionado.value?.id === chamadoModificado.id) chamadoSelecionado.value = chamadoModificado
        }
      } else if (chamadoModificado.status === abaAtual.value) {
        chamados.value.unshift(chamadoModificado)
      }
    })
  }

  function removerEventosSocket() {
    socket.off('novaMensagem')
    socket.off('mensagemEditada')
    socket.off('mensagemApagada')
    socket.off('chamadoAtualizado')
  }

  async function assumirForcado() {
    try {
      await transferirChamado(chamadoSelecionado.value.id, meuId)
      mensagemAcao.value = 'Você assumiu o chamado.'
    } catch (err) { mensagemAcao.value = err.response?.data?.erro || 'Erro ao assumir chamado' }
  }

  function solicitarTransferencia() {
    mensagemAcao.value = 'Solicitação de transferência enviada ao atendente responsável.'
  }

  async function retomarAtendimento() {
    try {
      await retomarChamado(chamadoSelecionado.value.id)
      mensagemAcao.value = 'Atendimento retomado!'
    } catch (err) { mensagemAcao.value = err.response?.data?.erro || 'Erro ao retomar atendimento' }
  }

  function voltarParaFila() {
    chamadoSelecionado.value = null
  }

  


  // A FUNÇÃO ATUALIZADA
  async function carregarChamados(resetarPagina = true) {
    if (resetarPagina) paginaAtual.value = 1;
    
    carregando.value = true;
    try {
      const resultado = await listarChamadosPorStatus(
        abaAtual.value, 
        paginaAtual.value, 
        limitePorPagina.value
      );
      
      // Ajuste importante: resultado.data é o padrão que combinamos
      chamados.value = resetarPagina ? resultado.data : [...chamados.value, ...resultado.data];
    } catch (err) { 
      console.error('Erro ao carregar chamados:', err); 
    } finally { 
      carregando.value = false; 
    }
  }

  function trocarAba(status) {
    abaAtual.value = status
    chamadoSelecionado.value = null,
    paginaAtual.value = 1,// Reseta para a primeira página
    mensagemAcao.value = ''
    mensagens.value = [],
    carregarChamados(true) // Carrega a nova aba
  }

  watch(abaAtual, carregarChamados)

  async function selecionarChamado(chamado) {
    chamadoSelecionado.value = chamado
    mensagemAcao.value = ''
    respondendoA.value = null
    editandoId.value = null
    await carregarMensagens()
    nextTick(() => { rolarParaOFim() })
  }

  async function assumir() {
    try {
      await assumirChamado(chamadoSelecionado.value.id)
      chamadoSelecionado.value = null
    } catch (err) { console.error(err) }
  }

  async function reabrir() {
    try {
      const resposta = await reabrirChamado(chamadoSelecionado.value.id)
      mensagemAcao.value = 'Chamado reaberto e assumido por você com sucesso!'
      if (resposta && resposta.chamado) {
        chamadoSelecionado.value = resposta.chamado
      } else {
        chamadoSelecionado.value.status = 'EM_ATENDIMENTO'
        chamadoSelecionado.value.atendente_id = meuId
      }
      abaAtual.value = 'EM_ATENDIMENTO'
      await carregarMensagens()
      nextTick(() => { rolarParaOFim() })
    } catch (err) { 
      mensagemAcao.value = err.response?.data?.erro || 'Erro ao reabrir chamado' 
    }
  }

  const atendentes = ref([])
  const atendenteEscolhido = ref('')
  const comentarioTransferir = ref('')
  const resumoFechamento = ref('')
  const modalTransferirAberto = ref(false)
  const modalFecharAberto = ref(false)

  async function carregarAtendentes() {
    try { atendentes.value = await listarAtendentes() } 
    catch (err) { console.error('Erro ao carregar atendentes:', err) }
  }

  function abrirModalTransferir() {
    atendenteEscolhido.value = ''
    comentarioTransferir.value = ''
    modalTransferirAberto.value = true
  }
  function abrirModalFechar() {
    resumoFechamento.value = ''
    modalFecharAberto.value = true
  }
  function fecharModais() {
    modalTransferirAberto.value = false
    modalFecharAberto.value = false
  }

  async function transferir() {
    try {
      await transferirChamado(chamadoSelecionado.value.id, atendenteEscolhido.value)
      if (comentarioTransferir.value.trim()) {
        await enviarMensagem({
          chamado_id: chamadoSelecionado.value.id,
          tipo: 'TEXTO',
          conteudo: `[Transferência] ${comentarioTransferir.value}`
        })
      }
      mensagemAcao.value = 'Chamado transferido com sucesso!'
      fecharModais()
      chamadoSelecionado.value = null
    } catch (err) { mensagemAcao.value = err.response?.data?.erro || 'Erro ao transferir chamado' }
  }

  async function fechar() {
    try {
      if (resumoFechamento.value.trim()) {
        await enviarMensagem({
          chamado_id: chamadoSelecionado.value.id,
          tipo: 'TEXTO',
          conteudo: `[Encerramento] ${resumoFechamento.value}`
        })
      }
      await fecharChamado(chamadoSelecionado.value.id)
      mensagemAcao.value = 'Chamado fechado com sucesso!'
      fecharModais()
      chamadoSelecionado.value = null
    } catch (err) { mensagemAcao.value = err.response?.data?.erro || 'Erro ao fechar chamado' }
  }

  const mensagens = ref([])
  const carregandoMensagens = ref(false)

  async function carregarMensagens() {
    if (!chamadoSelecionado.value) return
    carregandoMensagens.value = true
    try { mensagens.value = await listarMensagens(chamadoSelecionado.value.id) } 
    catch (err) { console.error('Erro ao carregar mensagens:', err) } 
    finally { carregandoMensagens.value = false }
  }

  async function enviar(texto) {
    try {
      const novaMensagem = await enviarMensagem({
        chamado_id: chamadoSelecionado.value.id,
        tipo: 'TEXTO',
        conteudo: texto,
        resposta_a: respondendoA.value?.id || null
      })
      const jaExiste = mensagens.value.some(m => m.id === novaMensagem.id)
      if (!jaExiste) mensagens.value.push(novaMensagem)
      respondendoA.value = null
      nextTick(() => { rolarParaOFim() })
    } catch (err) { console.error('Erro ao enviar mensagem:', err) }
  }

  async function enviarArquivoSelecionado(payload) {
    try {
      const arquivoReal = payload instanceof File || payload instanceof Blob ? payload : payload?.arquivo;
      if (!arquivoReal) return;

      const formData = new FormData();
      formData.append('arquivo', arquivoReal); 
      formData.append('legenda', payload?.legenda || '');
      formData.append('chamado_id', chamadoSelecionado.value.id);

      const novaMensagemAnexo = await enviarArquivo(formData); 
      const jaExiste = mensagens.value.some(m => m.id === novaMensagemAnexo.id);
      if (!jaExiste) mensagens.value.push(novaMensagemAnexo);
      nextTick(() => { rolarParaOFim(); });
    } catch (error) { 
      console.error("Erro ao enviar arquivo:", error); 
    }
  }

  const respondendoA = ref(null)
  const editandoId = ref(null)
  const textoParaEditar = ref('')

  function responder(msg) {
    editandoId.value = null
    respondendoA.value = msg
  }
  function iniciarEdicao(msg) {
    respondendoA.value = null
    editandoId.value = msg.id
    textoParaEditar.value = msg.conteudo
  }
  function cancelarEdicao() {
    editandoId.value = null
    textoParaEditar.value = ''
  }

  async function confirmarEdicao(texto) {
    try {
      await editarMensagem(editandoId.value, texto)
      editandoId.value = null
      textoParaEditar.value = ''
    } catch (err) { console.error('Erro ao editar mensagem:', err) }
  }

  const modalEncaminharAberto = ref(false)
  const mensagemParaEncaminhar = ref(null)
  const chamadoDestinoEncaminhar = ref([])
  const chamadosParaEncaminhar = ref([])

  async function abrirModalEncaminhar(msg) {
    mensagemParaEncaminhar.value = msg
    chamadoDestinoEncaminhar.value = []
    try { 
      chamadosParaEncaminhar.value = await listarChamadosPorStatus('EM_ATENDIMENTO') 
    } catch (err) { 
      console.error('Erro ao carregar chamados para encaminhar:', err) 
    }
    modalEncaminharAberto.value = true
  }

  function fecharModalEncaminhar() {
    modalEncaminharAberto.value = false
    mensagemParaEncaminhar.value = null
  }

  async function confirmarEncaminhar() {
    try {
      if (!chamadoDestinoEncaminhar.value || chamadoDestinoEncaminhar.value.length === 0) {
        alert('Por favor, selecione um chamado de destino válido.');
        return;
      }
      const destinoId = chamadoDestinoEncaminhar.value[0];
      await encaminharMensagem(mensagemParaEncaminhar.value.id, destinoId);
      fecharModalEncaminhar();
      mensagemAcao.value = 'Mensagem encaminhada com sucesso!';
    } catch (err) { 
      console.error('Erro ao encaminhar mensagem:', err); 
    }
  }

  async function carregarDetalhes() {
    if (!chamadoSelecionado.value) return
    carregandoDetalhes.value = true
    try { detalhesChamado.value = await buscarDetalhesChamado(chamadoSelecionado.value.id) } 
    catch (err) { console.error('Erro ao carregar detalhes do chamado:', err) } 
    finally { carregandoDetalhes.value = false }
  }

  async function abrirDetalhes() {
    detalhesAbertos.value = true
    await carregarDetalhes()
  }

async function carregarMaisMensagens() {
    if (carregandoMensagens.value) return
    try {
      carregandoMensagens.value = true
      const limite = 20
      const primeiraMensagemId = mensagens.value[0]?.id
      
      // Busca o lote de mensagens anteriores
      const historicoAntigo = await listarMensagens(chamadoSelecionado.value.id, { limite, antes_de: primeiraMensagemId })

      if (historicoAntigo && historicoAntigo.length > 0) {
        const alturaAnterior = elementoScroll ? elementoScroll.scrollHeight : 0
        
        // Cria um Set com os IDs que já estão na tela atualmente para evitar duplicidade
        const idsExistentes = new Set(mensagens.value.map(m => String(m.id)))
        
        // Filtra o histórico antigo para trazer apenas o que não está na tela
        const novasUnicas = historicoAntigo.filter(m => !idsExistentes.has(String(m.id)))

        if (novasUnicas.length > 0) {
          // Como a API costuma mandar o lote antigo invertido, invertemos ele para respeitar a cronologia correta no topo,
          // ou simplesmente inserimos no topo. Se a ordem vier invertida do backend, use: .reverse()
          const loteParaInserir = [...novasUnicas].reverse()

          // Adiciona estritamente no topo da lista atual
          mensagens.value = [...loteParaInserir, ...mensagens.value]
          
          nextTick(() => {
            if (elementoScroll) {
              elementoScroll.scrollTop = elementoScroll.scrollHeight - alturaAnterior
            }
          })
        } else {
          alert("Todas as mensagens já foram carregadas!")
        }
      } else {
        alert("Todas as mensagens já foram carregadas!")
      }
    } catch (err) { 
      console.error("Erro ao carregar mais histórico:", err) 
    } finally { 
      carregandoMensagens.value = false 
    }
  }
  async function apagar(mensagemId) {
    try {
      if (!confirm('Deseja realmente apagar esta mensagem?')) return;
      await apagarMensagem(mensagemId);
      mensagens.value = mensagens.value.filter(m => m.id !== mensagemId);
    } catch (error) {
      console.error("Erro ao apagar mensagem:", error);
      alert("Não foi possível apagar a mensagem.");
    }
  }

  onMounted(async () => {
    await carregarChamados()
    carregarAtendentes()
    configurarEventosSocket()

    const idParaAbrir = route.query.abrir
    if (idParaAbrir) {
      const chamado = chamados.value.find(c => c.id === Number(idParaAbrir))
      if (chamado) selecionarChamado(chamado)
    }
  })

  onUnmounted(() => {
    removerEventosSocket()
  })

  return {
    chatMessagesComponent,
    mostrarBotaoScroll,
    mensagensNaoLidas,
    abaAtual,
    chamados,
    carregando,
    chamadoSelecionado,
    mensagemAcao,
    detalhesAbertos,
    detalhesChamado,
    carregandoDetalhes,
    admin,
    meuId,
    usuarioLogado,
    podeAssumirChamado,
    mensagens,
    carregandoMensagens,
    atendentes,
    atendenteEscolhido,
    comentarioTransferir,
    resumoFechamento,
    modalTransferirAberto,
    modalFecharAberto,
    respondendoA,
    editandoId,
    textoParaEditar,
    modalEncaminharAberto,
    chamadoDestinoEncaminhar,
    chamadosParaEncaminhar,
    rolarParaOFim,
    monitorarScroll,
    reagirMensagem,
    assumirForcado,
    solicitarTransferencia,
    retomarAtendimento,
    voltarParaFila,
    trocarAba,
    selecionarChamado,
    assumir,
    reabrir,
    abrirModalTransferir,
    abrirModalFechar,
    fecharModais,
    transferir,
    fechar,
    enviar,
    enviarArquivoSelecionado,
    responder,
    iniciarEdicao,
    cancelarEdicao,
    confirmarEdicao,
    abrirModalEncaminhar,
    fecharModalEncaminhar,
    confirmarEncaminhar,
    carregarDetalhes,
    abrirDetalhes,
    carregarMaisMensagens,
    apagar
  }
}