<template>
  <div class="tela-chamados">

    <!-- 🎯 LISTA LATERAL (Sidebar): No mobile, ela SOME se houver um chamado aberto -->
    <ChatSidebar 
      :class="['sidebar-responsiva', chamadoSelecionado ? 'd-none d-md-flex' : 'd-flex']"
      :chamados="chamados" 
      :carregando="carregando" 
      :aba-atual="abaAtual"
      :chamado-selecionado="chamadoSelecionado" 
      @trocar-aba="trocarAba" 
      @selecionar="selecionarChamado" 
    />

    <!-- 🎯 ÁREA DO CHAT: No mobile, ela só aparece se HOUVER um chamado aberto -->
    <main :class="['area-chat', chamadoSelecionado ? 'd-flex' : 'd-none d-md-flex']">
      <div v-if="!chamadoSelecionado" class="chat-vazio">
        Selecione um chamado ao lado para abrir a conversa.
      </div>

      <div v-else class="chat-corpo">
        <!-- HEADER DO CHAT: Vamos passar uma prop ou tratar o botão voltar dentro dele -->
        <ChatHeader :chamado="chamadoSelecionado" :aba-atual="abaAtual" @assumir="assumir"
          @abrir-transferir="abrirModalTransferir" @abrir-fechar="abrirModalFechar" @reabrir="reabrir"
          @abrir-detalhes="abrirDetalhes" @voltar="voltarParaFila" />

        <p v-if="mensagemAcao" class="mensagem-acao">{{ mensagemAcao }}</p>

        <!-- Container estrutural das mensagens -->
        <div class="chat-mensagens-container-pai">
          <ChatMessages 
            ref="chatMessagesComponent"
            :mensagens="mensagens" 
            :carregando="carregandoMensagens" 
            :meu-id="meuId" 
            :sou-admin="admin"
            @responder="responder" 
            @encaminhar="abrirModalEncaminhar" 
            @editar="iniciarEdicao" 
            @apagar="apagar" 
            @reagir="reagirMensagem"
            @carregar-mais="carregarMaisMensagens"
            @scroll-monitor="monitorarScroll"
          />

          <!-- 🔽 Botão Flutuante Redondo de Scroll -->
          <button 
            v-show="mostrarBotaoScroll" 
            class="btn-scroll-fim" 
            @click="rolarParaOFim"
            type="button"
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 15.6l-6-6 1.4-1.4 4.6 4.6 4.6-4.6 1.4 1.4z" />
            </svg>
            <span v-if="mensagensNaoLidas > 0" class="badge-novas-mensagens">{{ mensagensNaoLidas }}</span>
          </button>
        </div>

        <!-- FOOTER DO CHAT: O evento @voltar-para-fila limpa a tela no mobile -->
        <ChatFooter :usuario="usuarioLogado" :chamado="chamadoSelecionado" :status="chamadoSelecionado?.status"
          :pode-assumir="podeAssumirChamado" :pode-reabrir="true" :respondendo-a="respondendoA" :editando="!!editandoId"
          :texto-inicial="textoParaEditar" @enviar-mensagem="enviar" @anexar-arquivo="enviarArquivoSelecionado"
          @gravar-audio="enviarArquivoSelecionado" @confirmar-edicao="confirmarEdicao" @cancelar-edicao="cancelarEdicao"
          @cancelar-resposta="respondendoA = null" @assumir-chamado="assumirForcado"
          @solicitar-transferencia="solicitarTransferencia" @retomar-chamado="retomarAtendimento"
          @reabrir-chamado="reabrir" @voltar-para-fila="voltarParaFila" @visualizar-historico="abrirDetalhes" />
      </div>
    </main>

    <!-- ==================== MODAIS (Mantidos 100% responsivos no CSS) ==================== -->
    <div v-if="modalTransferirAberto" class="modal-overlay" @click.self="fecharModais">
      <div class="modal-box">
        <h3>Transferir chamado</h3>
        <label>Transferir para atendente</label>
        <select v-model="atendenteEscolhido">
          <option value="" disabled>Selecione...</option>
          <option v-for="atendente in atendentes" :key="atendente.id" :value="atendente.id">{{ atendente.nome }}</option>
        </select>
        <label>Adicionar comentário</label>
        <textarea v-model="comentarioTransferir" rows="3" placeholder="Adicionar comentário"></textarea>
        <div class="modal-botoes">
          <button class="btn-cancelar" @click="fecharModais">Cancelar</button>
          <button class="btn-confirmar" :disabled="!atendenteEscolhido" @click="transferir">Salvar</button>
        </div>
      </div>
    </div>

    <div v-if="modalFecharAberto" class="modal-overlay" @click.self="fecharModais">
      <div class="modal-box">
        <div class="modal-icone-alerta">!</div>
        <h3>Fechar chamado</h3>
        <p class="modal-subtitulo">Você tem certeza que deseja fechar o chamado?</p>
        <label>Resumo do atendimento</label>
        <textarea v-model="resumoFechamento" rows="3" placeholder="Resumo do atendimento"></textarea>
        <div class="modal-botoes">
          <button class="btn-cancelar btn btn-primary" @click="fecharModais">Cancelar</button>
          <button class="btn-confirmar btn btn-primary" @click="fechar">Fechar chamado</button>
        </div>
      </div>
    </div>

    <!-- MODAL: ENCAMINHAR MENSAGEM (ESTILO WHATSAPP COM AVATARS) -->
<!-- MODAL: ENCAMINHAR MENSAGEM (ESTILO WHATSAPP COM AVATARS) -->
<div v-if="modalEncaminharAberto" class="modal-overlay" @click.self="fecharModalEncaminhar">
  <div class="modal-box modal-encaminhar-wpp">
    
    <!-- Cabeçalho do Modal -->
    <div class="modal-header-wpp">
      <h3>Encaminhar mensagem para</h3>
      <button class="btn-fechar-modal" @click="fecharModalEncaminhar">✕</button>
    </div>

    <!-- Barra de Pesquisa -->
    <div class="modal-search-box">
      <input 
        type="text" 
        v-model="filtroPesquisaEncaminhar" 
        placeholder="Pesquisar nome ou número" 
      />
    </div>

    <!-- Lista de Conversas / Contatos com Avatar -->
    <div class="modal-lista-conversas">
      <label 
        v-for="chamado in chamadosParaEncaminhar" 
        :key="chamado.id" 
        class="item-conversa-wpp"
      >
        <!-- Checkbox de Seleção amarrado à variável correta -->
        <input 
          type="checkbox" 
          :value="chamado.id" 
          v-model="chamadoDestinoEncaminhar" 
        />
        
        <!-- Avatar Redondo -->
        <div class="avatar-container">
          <div class="avatar-placeholder">
            {{ chamado.cliente_nome ? chamado.cliente_nome.charAt(0).toUpperCase() : 'C' }}
          </div>
        </div>

        <!-- Informações (Nome e Detalhe) -->
        <div class="info-conversa">
          <span class="nome-contato">Chamado #{{ chamado.id }} - {{ chamado.cliente_nome || 'Cliente' }}</span>
          <span class="sub-contato">Clique para selecionar</span>
        </div>
      </label>

      <div v-if="chamadosParaEncaminhar.length === 0" class="sem-resultados">
        Nenhuma conversa encontrada.
      </div>
    </div>

    <!-- Botões de Ação do Rodapé com a classe btn btn-primary -->
    <div class="modal-botoes">
      <button class="btn btn-secondary btn-cancelar" @click="fecharModalEncaminhar">Cancelar</button>
      <button class="btn btn-primary" :disabled="!chamadoDestinoEncaminhar || chamadoDestinoEncaminhar.length === 0" @click="confirmarEncaminhar">
        Encaminhar
      </button>
    </div>

  </div>
</div>

    <ChatDrawer :aberto="detalhesAbertos" :detalhes="detalhesChamado" :carregando="carregandoDetalhes"
      @fechar="detalhesAbertos = false" @recarregar="carregarDetalhes"
      @transferir="detalhesAbertos = false; abrirModalTransferir()"
      @encerrar="detalhesAbertos = false; abrirModalFechar()" />

  </div>
</template>

<script setup>
/* Mantido todo o seu bloco <script setup> intacto */
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'

import ChatSidebar from '../../components/chat/ChatSidebar.vue'
import ChatHeader from '../../components/chat/ChatHeader.vue'
import ChatMessages from '../../components/chat/ChatMessages.vue'
import ChatFooter from '../../components/chat/ChatFooter.vue'
import ChatDrawer from '../../components/chat/ChatDrawer.vue'
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

const route = useRoute()


const chatMessagesComponent = ref(null)
const mostrarBotaoScroll = ref(false)
const mensagensNaoLidas = ref(0)
let elementoScroll = null

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

const abaAtual = ref('EM_ATENDIMENTO')
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

function verificarModoMobile() {
  // Opcional: Caso precise forçar algum estado baseado no resize da janela
}

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

async function carregarChamados() {
  carregando.value = true
  try { chamados.value = await listarChamadosPorStatus(abaAtual.value) } 
  catch (err) { console.error('Erro ao carregar chamados:', err) } 
  finally { carregando.value = false }
}

function trocarAba(status) {
  abaAtual.value = status
  chamadoSelecionado.value = null
  mensagemAcao.value = ''
  mensagens.value = []
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
    // 1. Chama a API de reabertura (que no Back-end agora define status = 'EM_ATENDIMENTO' e atribui o atendente_id)
    const resposta = await reabrirChamado(chamadoSelecionado.value.id)
    
    // 2. Notificação visual de sucesso
    mensagemAcao.value = 'Chamado reaberto e assumido por você com sucesso!'
    
    // 3. Atualiza os dados do chamado selecionado em tempo real sem fechar a conversa na tela
    if (resposta && resposta.chamado) {
      chamadoSelecionado.value = resposta.chamado
    } else {
      // Caso sua API retorne o objeto direto no data
      chamadoSelecionado.value.status = 'EM_ATENDIMENTO'
      chamadoSelecionado.value.atendente_id = meuId
    }

    // 4. Muda automaticamente a aba da lista lateral para "Em Atendimento" para o usuário acompanhar o ticket
    abaAtual.value = 'EM_ATENDIMENTO'
    
    // 5. Recarrega as mensagens do chat para exibir a mensagem do sistema ("Reabriu o chamado")
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
    console.log("Payload recebido para envio:", payload);

    // Se o payload for diretamente um Arquivo/Blob ou tiver a propriedade arquivo
    const arquivoReal = payload instanceof File || payload instanceof Blob ? payload : payload?.arquivo;

    if (!arquivoReal) {
      console.error("Nenhum arquivo ou áudio encontrado no payload!");
      return;
    }

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
const chamadoDestinoEncaminhar = ref([]) // 🎯 Agora é um Array, o que faz o Vue capturar o :value corretamente!
const chamadosParaEncaminhar = ref([])

async function abrirModalEncaminhar(msg) {
  mensagemParaEncaminhar.value = msg
  chamadoDestinoEncaminhar.value = [] // 🎯 Mantém como Array limpo ao abrir o modal
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
    // 🎯 Valida se o array tem itens selecionados e pega o primeiro ID da lista
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
    const historicoAntigo = await listarMensagens(chamadoSelecionado.value.id, { limite, antes_de: primeiraMensagemId })

    if (historicoAntigo && historicoAntigo.length > 0) {
      const alturaAnterior = elementoScroll ? elementoScroll.scrollHeight : 0
      mensagens.value = [...historicoAntigo, ...mensagens.value]
      nextTick(() => {
        if (elementoScroll) elementoScroll.scrollTop = elementoScroll.scrollHeight - alturaAnterior
      })
    } else {
      alert("Todas as mensagens já foram carregadas!")
    }
  } catch (err) { console.error("Erro ao carregar mais histórico:", err) } 
  finally { carregandoMensagens.value = false }
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

// Função para apagar uma mensagem pelo ID
// Função para apagar uma mensagem pelo ID
async function apagar(mensagemId) {
  try {
    if (!confirm('Deseja realmente apagar esta mensagem?')) return;

    // Correção: Use 'apagarMensagem' que já está importada no topo do arquivo
    await apagarMensagem(mensagemId);

    // Remove a mensagem da lista localmente para sumir da tela na hora
    mensagens.value = mensagens.value.filter(m => m.id !== mensagemId);
    
  } catch (error) {
    console.error("Erro ao apagar mensagem:", error);
    alert("Não foi possível apagar a mensagem.");
  }
}
onUnmounted(() => {
  removerEventosSocket()
})
</script>

<style scoped>
/* ---------- ESTRUTURA GLOBAL DA VIEW ---------- */
.tela-chamados {
  display: flex;
  height: calc(100vh - 56px);
  position: relative;
  width: 100vw;
  overflow: hidden;
}
/* ---------- ESTILOS ESPECÍFICOS DO MODAL DE ENCAMINHAMENTO ESTILO WHATSAPP ---------- */
.modal-encaminhar-wpp {
  background: #ffffff !important;
  color: #111b21 !important;
  max-width: 480px !important;
  padding: 20px !important;
  border-radius: 12px !important;
}

.modal-header-wpp {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.modal-header-wpp h3 {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
  color: #111b21;
}

.btn-fechar-modal {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #54656f;
}

.modal-search-box {
  margin-bottom: 14px;
}

.modal-search-box input {
  width: 100%;
  padding: 10px 14px;
  background: #f0f2f5;
  border: 1px solid #e9edef;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  color: #111b21;
}

.modal-search-box input:focus {
  background: #ffffff;
  border-color: #00a884;
}

.modal-lista-conversas {
  max-height: 360px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
  border-top: 1px solid #f0f2f5;
  border-bottom: 1px solid #f0f2f5;
  padding: 8px 0;
}

.item-conversa-wpp {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.item-conversa-wpp:hover {
  background: #f5f6f8;
}

.item-conversa-wpp input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #00a884;
  cursor: pointer;
}

.avatar-container {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #dfe2e5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.avatar-placeholder {
  font-weight: bold;
  color: #54656f;
  font-size: 16px;
}

.info-conversa {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.nome-contato {
  font-size: 14px;
  font-weight: 500;
  color: #111b21;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sub-contato {
  font-size: 12px;
  color: #667781;
}

.sem-resultados {
  text-align: center;
  padding: 24px;
  color: #667781;
  font-size: 14px;
}

.modal-botoes {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}



/* 🎯 CORREÇÃO DE LARGURA DA SIDEBAR NO DESKTOP */
.sidebar-responsiva {
  width: 100%;
}
@media (min-width: 768px) {
  .sidebar-responsiva {
    min-width: 340px !important;
    max-width: 420px !important;
  }
}

.area-chat {
  flex: 1;
  background: #eae6df;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.chat-vazio {
  margin: auto;
  color: #888;
  font-size: 14px;
  padding: 20px;
  text-align: center;
}

.chat-corpo {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
}


.mensagem-acao {
  padding: 8px 20px;
  margin: 0;
  font-size: 13px;
  color: #1a3c6e;
  background: #eef3fb;
}

/* ---------- CLASSES DE COMPORTAMENTO DINÂMICO (BOOTSTRAP UTILS EMULADAS) ---------- */
.d-none { display: none !important; }
.d-flex { display: flex !important; }

@media (min-width: 768px) {
  .d-md-flex { display: flex !important; }
  .d-md-none { display: none !important; }
}

/* ---------- MODAIS RESPONSIVOS ---------- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 16px; /* Impede o modal de colar na borda do celular */
}

.modal-box {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.22);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ---------- CONTAINER DAS MENSAGENS & BOTÃO FLUTUANTE ---------- */
.chat-mensagens-container-pai {
  position: relative !important;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.btn-scroll-fim {
  position: absolute !important;
  bottom: 20px !important;
  right: 20px !important;
  background-color: #ffffff !important;
  border: none !important;
  border-radius: 50% !important;
  width: 46px !important;
  height: 46px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15) !important;
  cursor: pointer !important;
  z-index: 99 !important;
  transition: transform 0.2s ease;
}

.btn-scroll-fim:active {
  transform: scale(0.9);
}

.btn-scroll-fim svg {
  fill: #54656f !important;
  width: 22px !important;
  height: 22px !important;
}

.badge-novas-mensagens {
  position: absolute !important;
  top: -4px !important;
  right: -2px !important;
  background-color: #00a884 !important;
  color: #ffffff !important;
  font-size: 10px !important;
  font-weight: bold !important;
  min-width: 20px !important;
  height: 20px !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center;
  border: 2px solid #ffffff !important;
}

</style>