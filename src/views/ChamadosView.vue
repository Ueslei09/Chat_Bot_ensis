<template>
  <div class="tela-chamados">

    <ChatSidebar :chamados="chamados" :carregando="carregando" :aba-atual="abaAtual"
      :chamado-selecionado="chamadoSelecionado" @trocar-aba="trocarAba" @selecionar="selecionarChamado" />

    <main class="area-chat">
      <div v-if="!chamadoSelecionado" class="chat-vazio">
        Selecione um chamado ao lado para abrir a conversa.
      </div>

      <div v-else class="chat-corpo">
        <ChatHeader :chamado="chamadoSelecionado" :aba-atual="abaAtual" @assumir="assumir"
          @abrir-transferir="abrirModalTransferir" @abrir-fechar="abrirModalFechar" @reabrir="reabrir"
          @abrir-detalhes="abrirDetalhes" />

        <p v-if="mensagemAcao" class="mensagem-acao">{{ mensagemAcao }}</p>

        <!-- Container estrutural que segura a rolagem das mensagens e o botão flutuante de descer -->
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

          <!-- 🔽 Botão Flutuante Redondo de Scroll para o Fim (Sempre fixo em relação ao chat) -->
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

        <ChatFooter :usuario="usuarioLogado" :chamado="chamadoSelecionado" :status="chamadoSelecionado?.status"
          :pode-assumir="podeAssumirChamado" :pode-reabrir="true" :respondendo-a="respondendoA" :editando="!!editandoId"
          :texto-inicial="textoParaEditar" @enviar-mensagem="enviar" @anexar-arquivo="enviarArquivoSelecionado"
          @gravar-audio="enviarArquivoSelecionado" @confirmar-edicao="confirmarEdicao" @cancelar-edicao="cancelarEdicao"
          @cancelar-resposta="respondendoA = null" @assumir-chamado="assumirForcado"
          @solicitar-transferencia="solicitarTransferencia" @retomar-chamado="retomarAtendimento"
          @reabrir-chamado="reabrir" @voltar-para-fila="voltarParaFila" @visualizar-historico="abrirDetalhes" />
      </div>
    </main>

    <!-- ==================== MODAL: TRANSFERIR ==================== -->
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

    <!-- ==================== MODAL: FECHAR ==================== -->
    <div v-if="modalFecharAberto" class="modal-overlay" @click.self="fecharModais">
      <div class="modal-box">
        <div class="modal-icone-alerta">!</div>
        <h3>Fechar chamado</h3>
        <p class="modal-subtitulo">Você tem certeza que deseja fechar o chamado?</p>
        <label>Resumo do atendimento</label>
        <textarea v-model="resumoFechamento" rows="3" placeholder="Resumo do atendimento"></textarea>
        <div class="modal-botoes">
          <button class="btn-cancelar" @click="fecharModais">Cancelar</button>
          <button class="btn-confirmar" @click="fechar">Fechar chamado</button>
        </div>
      </div>
    </div>

    <!-- ==================== MODAL: ENCAMINHAR ==================== -->
    <div v-if="modalEncaminharAberto" class="modal-overlay" @click.self="fecharModalEncaminhar">
      <div class="modal-box">
        <h3>Encaminhar mensagem</h3>
        <label>Encaminhar para o chamado</label>
        <select v-model="chamadoDestinoEncaminhar">
          <option value="" disabled>Selecione...</option>
          <option v-for="chamado in chamadosParaEncaminhar" :key="chamado.id" :value="chamado.id">
            Chamado #{{ chamado.id }}
          </option>
        </select>
        <div class="modal-botoes">
          <button class="btn-cancelar" @click="fecharModalEncaminhar">Cancelar</button>
          <button class="btn-confirmar" :disabled="!chamadoDestinoEncaminhar" @click="confirmarEncaminhar">
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

// ------------------------------------------------------------
// ESTADOS DO SCROLL E COMPONENTES
// ------------------------------------------------------------
const chatMessagesComponent = ref(null)
const mostrarBotaoScroll = ref(false)
const mensagensNaoLidas = ref(0)
let elementoScroll = null

// Executa a rolagem suave até o fim do histórico
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

// Monitora o evento de scroll enviado pela lista de mensagens
function monitorarScroll(e) {
  const { scrollTop, scrollHeight, clientHeight } = e.target
  const distanciaDoFim = scrollHeight - scrollTop - clientHeight
  
  // Mostra o botão redondo flutuante se subiu mais de 300px
  mostrarBotaoScroll.value = distanciaDoFim > 300

  if (distanciaDoFim < 20) {
    mensagensNaoLidas.value = 0
  }
}

// Observa quando o componente ChatMessages é montado para vincular o elemento interno de scroll
watch(chatMessagesComponent, (novoComponente) => {
  if (novoComponente) {
    // Captura o contêiner interno com base na referência exposta
    elementoScroll = novoComponente.scrollContainer || novoComponente.$el?.querySelector('.area-mensagens') || novoComponente.$el
  }
})

// ------------------------------------------------------------
// ESTADOS GLOBAIS / REFS
// ------------------------------------------------------------
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

function reagirMensagem({ mensagemId, emoji }) {
  const index = mensagens.value.findIndex(m => m.id === mensagemId)
  if (index !== -1) {
    mensagens.value[index].reacao = emoji
  }
}

// ------------------------------------------------------------
// ⚡ MOTOR EM TEMPO REAL: SOCKET.IO (Segurança & Performance)
// ------------------------------------------------------------
function configurarEventosSocket() {
  if (!socket.connected) {
    socket.connect()
  }

  socket.on('novaMensagem', (mensagem) => {
    if (chamadoSelecionado.value && mensagem.chamado_id === chamadoSelecionado.value.id) {
      const jaExiste = mensagens.value.some(m => m.id === mensagem.id)
      if (!jaExiste) {
        mensagens.value.push(mensagem)
        
        // Se o usuário não está no fundo do chat, incrementa mensagens não lidas
        if (mostrarBotaoScroll.value) {
          mensagensNaoLidas.value++
        } else {
          nextTick(() => {
            rolarParaOFim()
          })
        }
      }
    }
  })

  socket.on('mensagemEditada', (mensagemAtualizada) => {
    if (chamadoSelecionado.value && mensagemAtualizada.chamado_id === chamadoSelecionado.value.id) {
      const index = mensagens.value.findIndex(m => m.id === mensagemAtualizada.id)
      if (index !== -1) {
        mensagens.value[index] = mensagemAtualizada
      }
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
        if (chamadoSelecionado.value?.id === chamadoModificado.id) {
          chamadoSelecionado.value = null
        }
      } else {
        chamados.value[index] = chamadoModificado
        if (chamadoSelecionado.value?.id === chamadoModificado.id) {
          chamadoSelecionado.value = chamadoModificado
        }
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

// ------------------------------------------------------------
// CHAMADOS (Ações)
// ------------------------------------------------------------
async function assumirForcado() {
  try {
    await transferirChamado(chamadoSelecionado.value.id, meuId)
    mensagemAcao.value = 'Você assumiu o chamado.'
  } catch (err) {
    mensagemAcao.value = err.response?.data?.erro || 'Erro ao assumir chamado'
  }
}

function solicitarTransferencia() {
  mensagemAcao.value = 'Solicitação de transferência enviada ao atendente responsável.'
}

async function retomarAtendimento() {
  try {
    await retomarChamado(chamadoSelecionado.value.id)
    mensagemAcao.value = 'Atendimento retomado!'
  } catch (err) {
    mensagemAcao.value = err.response?.data?.erro || 'Erro ao retomar atendimento'
  }
}

function voltarParaFila() {
  chamadoSelecionado.value = null
}

async function carregarChamados() {
  carregando.value = true
  try {
    chamados.value = await listarChamadosPorStatus(abaAtual.value)
  } catch (err) {
    console.error('Erro ao carregar chamados:', err)
  } finally {
    carregando.value = false
  }
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
  nextTick(() => {
    rolarParaOFim()
  })
}

async function assumir() {
  try {
    await assumirChamado(chamadoSelecionado.value.id)
    chamadoSelecionado.value = null
  } catch (err) {
    console.error(err)
  }
}

async function reabrir() {
  try {
    await reabrirChamado(chamadoSelecionado.value.id)
    mensagemAcao.value = 'Chamado reaberto! Ele voltou pra fila.'
    chamadoSelecionado.value = null
  } catch (err) {
    mensagemAcao.value = err.response?.data?.erro || 'Erro ao reabrir chamado'
  }
}

// ------------------------------------------------------------
// TRANSFERIR / FECHAR (Modais)
// ------------------------------------------------------------
const atendentes = ref([])
const atendenteEscolhido = ref('')
const comentarioTransferir = ref('')
const resumoFechamento = ref('')
const modalTransferirAberto = ref(false)
const modalFecharAberto = ref(false)

async function carregarAtendentes() {
  try {
    atendentes.value = await listarAtendentes()
  } catch (err) {
    console.error('Erro ao carregar atendentes:', err)
  }
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
  } catch (err) {
    mensagemAcao.value = err.response?.data?.erro || 'Erro ao transferir chamado'
  }
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
  } catch (err) {
    mensagemAcao.value = err.response?.data?.erro || 'Erro ao fechar chamado'
  }
}

// ------------------------------------------------------------
// MENSAGENS (Requisições seguras)
// ------------------------------------------------------------
const mensagens = ref([])
const carregandoMensagens = ref(false)

async function carregarMensagens() {
  if (!chamadoSelecionado.value) return
  carregandoMensagens.value = true
  try {
    mensagens.value = await listarMensagens(chamadoSelecionado.value.id)
  } catch (err) {
    console.error('Erro ao carregar mensagens:', err)
  } finally {
    carregandoMensagens.value = false
  }
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
    if (!jaExiste) {
      mensagens.value.push(novaMensagem)
    }

    respondendoA.value = null
    nextTick(() => {
      rolarParaOFim()
    })
  } catch (err) {
    console.error('Erro ao enviar mensagem:', err)
  }
}

async function enviarArquivoSelecionado(payload) {
  try {
    const formData = new FormData()
    formData.append('arquivo', payload.arquivo) 
    formData.append('legenda', payload.legenda || '')
    formData.append('chamado_id', chamadoSelecionado.value.id)

    const novaMensagemAnexo = await enviarArquivo(formData) 
    
    const jaExiste = mensagens.value.some(m => m.id === novaMensagemAnexo.id)
    if (!jaExiste) {
      mensagens.value.push(novaMensagemAnexo)
    }

    nextTick(() => {
      rolarParaOFim()
    })
  } catch (error) {
    console.error("Erro ao enviar arquivo:", error)
  }
}

async function apagar(mensagemId) {
  if (!confirm('Apagar esta mensagem?')) return
  try {
    await apagarMensagem(mensagemId)
  } catch (err) {
    console.error('Erro ao apagar mensagem:', err)
  }
}

// ------------------------------------------------------------
// RESPONDER & EDITAR
// ------------------------------------------------------------
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
  } catch (err) {
    console.error('Erro ao editar mensagem:', err)
  }
}

// ------------------------------------------------------------
// ENCAMINHAR
// ------------------------------------------------------------
const modalEncaminharAberto = ref(false)
const mensagemParaEncaminhar = ref(null)
const chamadoDestinoEncaminhar = ref('')
const chamadosParaEncaminhar = ref([])

async function abrirModalEncaminhar(msg) {
  mensagemParaEncaminhar.value = msg
  chamadoDestinoEncaminhar.value = ''
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
    await encaminharMensagem(mensagemParaEncaminhar.value.id, chamadoDestinoEncaminhar.value)
    fecharModalEncaminhar()
    mensagemAcao.value = 'Mensagem encaminhada com sucesso!'
  } catch (err) {
    console.error('Erro ao encaminhar mensagem:', err)
  }
}

async function carregarDetalhes() {
  if (!chamadoSelecionado.value) return
  carregandoDetalhes.value = true
  try {
    detalhesChamado.value = await buscarDetalhesChamado(chamadoSelecionado.value.id)
  } catch (err) {
    console.error('Erro ao carregar detalhes do chamado:', err)
  } finally {
    carregandoDetalhes.value = false
  }
}

async function abrirDetalhes() {
  detalhesAbertos.value = true
  await carregarDetalhes()
}

// ------------------------------------------------------------
// PAGINAÇÃO / CARREGAR HISTÓRICO ANTERIOR
// ------------------------------------------------------------
async function carregarMaisMensagens() {
  if (carregandoMensagens.value) return
  
  try {
    carregandoMensagens.value = true
    const limite = 20
    const primeiraMensagemId = mensagens.value[0]?.id
    
    const historicoAntigo = await listarMensagens(chamadoSelecionado.value.id, {
      limite,
      antes_de: primeiraMensagemId
    })

    if (historicoAntigo && historicoAntigo.length > 0) {
      const alturaAnterior = elementoScroll ? elementoScroll.scrollHeight : 0

      mensagens.value = [...historicoAntigo, ...mensagens.value]

      nextTick(() => {
        if (elementoScroll) {
          elementoScroll.scrollTop = elementoScroll.scrollHeight - alturaAnterior
        }
      })
    } else {
      alert("Todas as mensagens já foram carregadas!")
    }
  } catch (err) {
    console.error("Erro ao carregar mais histórico:", err)
  } finally {
    carregandoMensagens.value = false
  }
}

// ------------------------------------------------------------
// LIFECYCLE (Montagem e Desmontagem Segura)
// ------------------------------------------------------------
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
</script>

<style scoped>
.tela-chamados {
  display: flex;
  height: calc(100vh - 56px);
  position: relative;
}

.area-chat {
  flex: 1;
  background: #eae6df;
  display: flex;
  flex-direction: column;
}

.chat-vazio {
  margin: auto;
  color: #888;
  font-size: 14px;
}

.chat-corpo {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.mensagem-acao {
  padding: 8px 20px;
  margin: 0;
  font-size: 13px;
  color: #1a3c6e;
  background: #eef3fb;
}

/* ---------- MODAIS ---------- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-box {
  background: #fff;
  border-radius: 10px;
  padding: 28px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.modal-box h3 {
  margin: 0 0 4px 0;
  text-align: center;
}

.modal-icone-alerta {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid #f0ad4e;
  color: #f0ad4e;
  font-size: 22px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 8px;
}

.modal-subtitulo {
  text-align: center;
  color: #666;
  font-size: 13px;
  margin: 0 0 8px;
}

.modal-box label {
  font-size: 13px;
  color: #444;
  margin-top: 4px;
}

.modal-box select,
.modal-box textarea {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-family: inherit;
}

.modal-botoes {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}

.btn-cancelar {
  background: #dbe3ee;
  color: #333;
  border: none;
  padding: 8px 18px;
  border-radius: 20px;
  cursor: pointer;
}

.btn-confirmar {
  background: #1a3c6e;
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 20px;
  cursor: pointer;
}

.btn-confirmar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ---------- 📦 CONTAINER ESTRUTURAL DA ROLAGEM ---------- */
.chat-mensagens-container-pai {
  position: relative !important;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 🌟 BOTÃO REDONDO FLUTUANTE DE ROLAGEM PARA O FIM */
.btn-scroll-fim {
  position: absolute !important;
  bottom: 16px !important;
  right: 20px !important;
  background-color: #ffffff !important;
  border: none !important;
  border-radius: 50% !important;
  width: 42px !important;
  height: 42px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.05) !important;
  cursor: pointer !important;
  z-index: 999 !important;
  outline: none !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.btn-scroll-fim:hover {
  background-color: #f8f9fa !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.16) !important;
}

.btn-scroll-fim svg {
  fill: #54656f !important;
  width: 20px !important;
  height: 20px !important;
}

/* Badge do Contador verde WhatsApp */
.badge-novas-mensagens {
  position: absolute !important;
  top: -4px !important;
  right: -2px !important;
  background-color: #00a884 !important;
  color: #ffffff !important;
  font-size: 10px !important;
  font-weight: bold !important;
  min-width: 18px !important;
  height: 18px !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 4px !important;
  border: 2px solid #ffffff !important;
}
</style>