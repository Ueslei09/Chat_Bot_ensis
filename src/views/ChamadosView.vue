<template>
  <div class="tela-chamados">

    <ChatSidebar
      :chamados="chamados"
      :carregando="carregando"
      :aba-atual="abaAtual"
      :chamado-selecionado="chamadoSelecionado"
      @trocar-aba="trocarAba"
      @selecionar="selecionarChamado"
    />

    <main class="area-chat">
      <div v-if="!chamadoSelecionado" class="chat-vazio">
        Selecione um chamado ao lado para abrir a conversa.
      </div>

      <div v-else class="chat-corpo">
        <ChatHeader
           :chamado="chamadoSelecionado"
  :aba-atual="abaAtual"
  @assumir="assumir"
  @abrir-transferir="abrirModalTransferir"
  @abrir-fechar="abrirModalFechar"
  @reabrir="reabrir"
  @abrir-detalhes="abrirDetalhes"
        />

        <p v-if="mensagemAcao" class="mensagem-acao">{{ mensagemAcao }}</p>

        <ChatMessages
          :mensagens="mensagens"
          :carregando="carregandoMensagens"
          :meu-id="meuId"
          :sou-admin="admin"
          @responder="responder"
          @encaminhar="abrirModalEncaminhar"
          @editar="iniciarEdicao"
          @apagar="apagar"
        />

        <ChatFooter
        :usuario="usuarioLogado"
  :chamado="chamadoSelecionado"
  :status="chamadoSelecionado?.status"
  :pode-assumir="podeAssumirChamado"
  :pode-reabrir="true"
  :respondendo-a="respondendoA"
  :editando="!!editandoId"
  :texto-inicial="textoParaEditar"
  @enviar-mensagem="enviar"
  @anexar-arquivo="enviarArquivoSelecionado"
  @gravar-audio="enviarArquivoSelecionado"
  @confirmar-edicao="confirmarEdicao"
  @cancelar-edicao="cancelarEdicao"
  @cancelar-resposta="respondendoA = null"
  @assumir-chamado="assumirForcado"
  @solicitar-transferencia="solicitarTransferencia"
  @retomar-chamado="retomarAtendimento"
  @reabrir-chamado="reabrir"
  @voltar-para-fila="voltarParaFila"
  @visualizar-historico="abrirDetalhes"
        />
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
    <ChatDrawer
  :aberto="detalhesAbertos"
  :detalhes="detalhesChamado"
  :carregando="carregandoDetalhes"
  @fechar="detalhesAbertos = false"
  @recarregar="carregarDetalhes"
  @transferir="detalhesAbertos = false; abrirModalTransferir()"
  @encerrar="detalhesAbertos = false; abrirModalFechar()"
/>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import ChatSidebar from '../../components/chat/ChatSidebar.vue'
import ChatHeader from '../../components/chat/ChatHeader.vue'
import ChatMessages from '../../components/chat/ChatMessages.vue'
import ChatFooter from '../../components/chat/ChatFooter.vue'
import ChatDrawer from '../../components/chat/ChatDrawer.vue'
import { listarAtendentes } from '@/services/usuariosServices.js'



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
// CHAMADOS (sidebar)
// ------------------------------------------------------------
const abaAtual = ref('EM_ATENDIMENTO')
const chamados = ref([])
const carregando = ref(false)
const chamadoSelecionado = ref(null)
const mensagemAcao = ref('')
// Estado do painel lateral
const detalhesAbertos = ref(false)
const detalhesChamado = ref(null)
const carregandoDetalhes = ref(false)


// Objeto simples com os dados do usuário logado, pro ChatFooter usar
const usuarioLogado = computed(() => ({
  id: meuId,
  nome: getNomeUsuario(),
  perfil: admin ? 'ADM' : 'USER'
}))

// Só ADM pode "forçar assumir" um chamado que já é de outro atendente
const podeAssumirChamado = computed(() => admin)
 
// Verdadeiro quando o chamado está EM_ATENDIMENTO mas NÃO é do usuário logado
const modoSomenteLeitura = computed(() => {
  if (!chamadoSelecionado.value) return false
  return (
    chamadoSelecionado.value.status === 'EM_ATENDIMENTO' &&
    chamadoSelecionado.value.atendente_id !== meuId
  )
})

// Chamado pelo botão "Assumir Atendimento" no estado bloqueado (só ADM vê esse botão)
// Reaproveita a rota de TRANSFERIR, passando o próprio usuário como novo atendente
async function assumirForcado() {
  try {
    await transferirChamado(chamadoSelecionado.value.id, meuId)
    mensagemAcao.value = 'Você assumiu o chamado.'
    await carregarChamados()
    await carregarMensagens()
  } catch (err) {
    mensagemAcao.value = err.response?.data?.erro || 'Erro ao assumir chamado'
  }
}

// Chamado pelo botão "Solicitar Transferência" (usuário comum, sem permissão de forçar)
// Por enquanto só avisa na tela — no futuro pode virar uma notificação de verdade
// pro atendente atual ou pro ADM
function solicitarTransferencia() {
  mensagemAcao.value = 'Solicitação de transferência enviada ao atendente responsável.'
}

async function retomarAtendimento() {
  try {
    await retomarChamado(chamadoSelecionado.value.id)
    mensagemAcao.value = 'Atendimento retomado!'
    await carregarChamados()
    // Atualiza o status do chamado selecionado localmente, sem precisar re-selecionar
    chamadoSelecionado.value = { ...chamadoSelecionado.value, status: 'EM_ATENDIMENTO' }
  } catch (err) {
    mensagemAcao.value = err.response?.data?.erro || 'Erro ao retomar atendimento'
  }
}

// Chamado pelo evento @voltar-para-fila (Estado 2 do ChatFooter, botão secundário)
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
}

async function assumir() {
  await assumirChamado(chamadoSelecionado.value.id)
  await carregarChamados()
  chamadoSelecionado.value = null
}

async function reabrir() {
  try {
    await reabrirChamado(chamadoSelecionado.value.id)
    mensagemAcao.value = 'Chamado reaberto! Ele voltou pra fila.'
    await carregarChamados()
    chamadoSelecionado.value = null
  } catch (err) {
    mensagemAcao.value = err.response?.data?.erro || 'Erro ao reabrir chamado'
  }
}

// ------------------------------------------------------------
// TRANSFERIR / FECHAR (modais)
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
    await carregarChamados()
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
    await carregarChamados()
    chamadoSelecionado.value = null
  } catch (err) {
    mensagemAcao.value = err.response?.data?.erro || 'Erro ao fechar chamado'
  }
}

// ------------------------------------------------------------
// MENSAGENS
// ------------------------------------------------------------
const mensagens = ref([])
const carregandoMensagens = ref(false)
const admin = isAdmin()
const meuId = getIdUsuario()

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
    await enviarMensagem({
      chamado_id: chamadoSelecionado.value.id,
      tipo: 'TEXTO',
      conteudo: texto,
      resposta_a: respondendoA.value?.id || null
    })
    respondendoA.value = null
    await carregarMensagens()
  } catch (err) {
    console.error('Erro ao enviar mensagem:', err)
  }
}

async function enviarArquivoSelecionado(arquivo) {
  if (!arquivo || !chamadoSelecionado.value) return
  try {
    await enviarArquivo(chamadoSelecionado.value.id, arquivo)
    await carregarMensagens()
  } catch (err) {
    console.error('Erro ao enviar arquivo:', err)
  }
}

async function apagar(mensagemId) {
  if (!confirm('Apagar esta mensagem?')) return
  try {
    await apagarMensagem(mensagemId)
    await carregarMensagens()
  } catch (err) {
    console.error('Erro ao apagar mensagem:', err)
  }
}

// ------------------------------------------------------------
// RESPONDER
// ------------------------------------------------------------
const respondendoA = ref(null)
function responder(msg) {
  editandoId.value = null
  respondendoA.value = msg
}

// ------------------------------------------------------------
// EDITAR (o texto fica no ChatFooter, igual WhatsApp)
// ------------------------------------------------------------
const editandoId = ref(null)
const textoParaEditar = ref('')

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
    await carregarMensagens()
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
// INICIALIZAÇÃO
// ------------------------------------------------------------
onMounted(async () => {
  await carregarChamados()
  carregarAtendentes()

  const idParaAbrir = route.query.abrir
  if (idParaAbrir) {
    const chamado = chamados.value.find(c => c.id === Number(idParaAbrir))
    if (chamado) selecionarChamado(chamado)
  }
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

/* ---------- MODAIS (permanecem no orquestrador) ---------- */
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
</style>