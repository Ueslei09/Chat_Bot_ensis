<template>
  <div class="tela-chamados">

    <!-- ==================== SIDEBAR ESQUERDA ==================== -->
    <aside class="sidebar">
      <nav class="abas">
        <button :class="{ ativa: abaAtual === 'EM_ATENDIMENTO' }" @click="trocarAba('EM_ATENDIMENTO')">
          Conversando
        </button>
        <button :class="{ ativa: abaAtual === 'ABERTO' }" @click="trocarAba('ABERTO')">
          Fila
        </button>
        <button :class="{ ativa: abaAtual === 'FECHADO' }" @click="trocarAba('FECHADO')">
          Chamados
        </button>
      </nav>

      <ul class="lista-chamados">
        <li v-if="carregando" class="vazio">Carregando...</li>
        <li v-else-if="chamados.length === 0" class="vazio">Nenhum chamado aqui.</li>
        <li
          v-for="chamado in chamados"
          :key="chamado.id"
          class="item-chamado"
          :class="{ selecionado: chamadoSelecionado?.id === chamado.id }"
          @click="selecionarChamado(chamado)"
        >
          <span class="nome">Chamado #{{ chamado.id }}</span>
          <span class="status">{{ chamado.status }}</span>
        </li>
      </ul>
    </aside>

    <!-- ==================== ÁREA DE CHAT ==================== -->
    <main class="area-chat">
      <div v-if="!chamadoSelecionado" class="chat-vazio">
        Selecione um chamado ao lado para abrir a conversa.
      </div>

      <div v-else class="chat-cabecalho">
        <div class="topo">
          <div class="titulo">
            <strong>Chamado #{{ chamadoSelecionado.id }}</strong>
            <span class="status-badge">{{ chamadoSelecionado.status }}</span>
          </div>

          <div class="icones-acao">
            <button v-if="abaAtual === 'ABERTO'" class="icone-btn" title="Assumir chamado" @click="assumir">✅</button>
            <template v-if="abaAtual === 'EM_ATENDIMENTO'">
              <button class="icone-btn" title="Transferir chamado" @click="abrirModalTransferir">🔄</button>
              <button class="icone-btn" title="Fechar chamado" @click="abrirModalFechar">✂️</button>
            </template>
            <button v-if="abaAtual === 'FECHADO'" class="icone-btn" title="Reabrir chamado" @click="reabrir">↩️</button>
          </div>
        </div>

        <p v-if="mensagemAcao" class="mensagem-acao">{{ mensagemAcao }}</p>

        <!-- ==================== LISTA DE MENSAGENS ==================== -->
        <div class="mensagens" ref="areaMensagens">
          <div v-if="carregandoMensagens" class="mensagens-vazio">Carregando mensagens...</div>
          <div v-else-if="mensagens.length === 0" class="mensagens-vazio">
            Nenhuma mensagem ainda.
          </div>

          <template v-for="msg in mensagens" :key="msg.id">

            <!-- Mensagem de SISTEMA: faixa cinza centralizada -->
            <div v-if="msg.autor_tipo === 'SISTEMA'" class="faixa-sistema">
              {{ msg.conteudo }} — {{ formatarHora(msg.criada_em) }}
            </div>

            <!-- Mensagem normal: bolha de chat -->
            <div
              v-else
              class="bolha"
              :class="msg.autor_tipo === 'CLIENTE' ? 'recebida' : 'enviada'"
            >
              <!-- Texto -->
              <p v-if="msg.tipo === 'TEXTO'" class="conteudo-texto">{{ msg.conteudo }}</p>

              <!-- Imagem -->
              <div v-else-if="msg.tipo === 'IMAGEM'" class="conteudo-midia">
                <img :src="urlArquivo(msg.conteudo)" alt="Imagem enviada" />
                <a :href="urlArquivo(msg.conteudo)" download class="link-download">⬇️ Baixar imagem</a>
              </div>

              <!-- Áudio -->
              <div v-else-if="msg.tipo === 'AUDIO'" class="conteudo-midia">
                <audio controls :src="urlArquivo(msg.conteudo)"></audio>
                <a :href="urlArquivo(msg.conteudo)" download class="link-download">⬇️ Baixar áudio</a>
              </div>

              <!-- PDF -->
              <div v-else-if="msg.tipo === 'PDF'" class="conteudo-midia">
                <a :href="urlArquivo(msg.conteudo)" target="_blank" class="link-pdf">📄 Abrir PDF</a>
                <a :href="urlArquivo(msg.conteudo)" download class="link-download">⬇️ Baixar</a>
              </div>

              <div class="rodape-bolha">
                <span class="hora">{{ formatarHora(msg.criada_em) }}</span>
                <button
                  v-if="podeApagar(msg)"
                  class="btn-apagar-msg"
                  title="Apagar mensagem"
                  @click="apagar(msg.id)"
                >
                  🗑️
                </button>
              </div>
            </div>
          </template>
        </div>

        <!-- ==================== CAMPO DE ENVIO ==================== -->
        <form class="campo-envio" @submit.prevent="enviar">
          <label class="btn-anexo" title="Anexar arquivo">
            +
            <input type="file" accept="image/*,audio/*,application/pdf" @change="enviarArquivoSelecionado" hidden />
          </label>

          <input v-model="novaMensagem" type="text" placeholder="Digite uma mensagem..." />

          <button type="submit" :disabled="!novaMensagem.trim()">Enviar</button>
        </form>
      </div>
    </main>

    <!-- ==================== MODAL: TRANSFERIR CHAMADO ==================== -->
    <div v-if="modalTransferirAberto" class="modal-overlay" @click.self="fecharModais">
      <div class="modal-box">
        <h3>Transferir chamado</h3>
        <label>Transferir para atendente</label>
        <select v-model="atendenteEscolhido">
          <option value="" disabled>Selecione...</option>
          <option v-for="atendente in atendentes" :key="atendente.id" :value="atendente.id">
            {{ atendente.nome }}
          </option>
        </select>
        <label>Adicionar comentário</label>
        <textarea v-model="comentarioTransferir" rows="3" placeholder="Adicionar comentário"></textarea>
        <div class="modal-botoes">
          <button class="btn-cancelar" @click="fecharModais">Cancelar</button>
          <button class="btn-confirmar" :disabled="!atendenteEscolhido" @click="transferir">Salvar</button>
        </div>
      </div>
    </div>

    <!-- ==================== MODAL: FECHAR CHAMADO ==================== -->
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

  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import {
  listarChamadosPorStatus,
  assumirChamado,
  fecharChamado,
  transferirChamado,
  reabrirChamado
} from '@/services/chamadoServices.js'
import { listarAtendentes } from '@/services/usuariosServices.js'
import {
  listarMensagens,
  enviarMensagem,
  enviarArquivo,
  apagarMensagem,
  urlArquivo
} from '@/services/mensagensServices.js'
import { isAdmin } from '@/services/authServices.js'

const route = useRoute()

const abaAtual = ref('EM_ATENDIMENTO')
const chamados = ref([])
const carregando = ref(false)
const chamadoSelecionado = ref(null)
const mensagemAcao = ref('')

const atendentes = ref([])
const atendenteEscolhido = ref('')
const comentarioTransferir = ref('')
const resumoFechamento = ref('')
const modalTransferirAberto = ref(false)
const modalFecharAberto = ref(false)

// ------------------------------------------------------------
// MENSAGENS
// ------------------------------------------------------------
const mensagens = ref([])
const carregandoMensagens = ref(false)
const novaMensagem = ref('')
const areaMensagens = ref(null)
const admin = isAdmin()

async function carregarMensagens() {
  if (!chamadoSelecionado.value) return
  carregandoMensagens.value = true
  try {
    mensagens.value = await listarMensagens(chamadoSelecionado.value.id)
    await nextTick()
    rolarParaFinal()
  } catch (err) {
    console.error('Erro ao carregar mensagens:', err)
  } finally {
    carregandoMensagens.value = false
  }
}

function rolarParaFinal() {
  if (areaMensagens.value) {
    areaMensagens.value.scrollTop = areaMensagens.value.scrollHeight
  }
}

function formatarHora(dataString) {
  const data = new Date(dataString)
  return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

// ADM sempre pode apagar; USER só se tiver a mensagem sido dele (checagem visual;
// a validação real de verdade acontece no backend)
function podeApagar(msg) {
  return admin
}

async function enviar() {
  if (!novaMensagem.value.trim()) return
  try {
    await enviarMensagem({
      chamado_id: chamadoSelecionado.value.id,
      tipo: 'TEXTO',
      conteudo: novaMensagem.value
    })
    novaMensagem.value = ''
    await carregarMensagens()
  } catch (err) {
    console.error('Erro ao enviar mensagem:', err)
  }
}

async function enviarArquivoSelecionado(evento) {
  const arquivo = evento.target.files[0]
  if (!arquivo || !chamadoSelecionado.value) return

  try {
    await enviarArquivo(chamadoSelecionado.value.id, arquivo)
    await carregarMensagens()
  } catch (err) {
    console.error('Erro ao enviar arquivo:', err)
  } finally {
    evento.target.value = ''
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
// CHAMADOS (sidebar)
// ------------------------------------------------------------
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

async function carregarAtendentes() {
  try {
    atendentes.value = await listarAtendentes()
  } catch (err) {
    console.error('Erro ao carregar atendentes:', err)
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
  await carregarMensagens()
}

async function assumir() {
  await assumirChamado(chamadoSelecionado.value.id)
  await carregarChamados()
  chamadoSelecionado.value = null
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

.sidebar {
  width: 300px;
  background: #fff;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
}
.abas {
  display: flex;
  border-bottom: 1px solid #eee;
}
.abas button {
  flex: 1;
  padding: 12px 8px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 13px;
  color: #555;
}
.abas button.ativa {
  border-bottom: 2px solid #1a3c6e;
  font-weight: bold;
  color: #1a3c6e;
}
.lista-chamados {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  flex: 1;
}
.vazio {
  padding: 16px;
  color: #999;
  font-size: 13px;
  text-align: center;
}
.item-chamado {
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}
.item-chamado:hover {
  background: #f7f9fc;
}
.item-chamado.selecionado {
  background: #e8f0fe;
}
.item-chamado .status {
  font-size: 11px;
  color: #888;
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
.chat-cabecalho {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.topo {
  background: #fff;
  padding: 14px 20px;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.titulo {
  display: flex;
  align-items: center;
  gap: 10px;
}
.status-badge {
  font-size: 12px;
  color: #666;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 10px;
}
.icones-acao {
  display: flex;
  gap: 6px;
}
.icone-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 6px;
  line-height: 1;
}
.icone-btn:hover {
  background: #f0f0f0;
}
.mensagem-acao {
  padding: 8px 20px;
  margin: 0;
  font-size: 13px;
  color: #1a3c6e;
  background: #eef3fb;
}

/* ---------- MENSAGENS ---------- */
.mensagens {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.mensagens-vazio {
  margin: auto;
  color: #999;
  font-size: 13px;
}
.faixa-sistema {
  align-self: center;
  background: #dbe3ee;
  color: #444;
  font-size: 12px;
  padding: 6px 14px;
  border-radius: 12px;
  margin: 6px 0;
  text-align: center;
}
.bolha {
  max-width: 60%;
  padding: 8px 12px;
  border-radius: 8px;
  background: #fff;
}
.bolha.enviada {
  align-self: flex-end;
  background: #d9fdd3;
}
.bolha.recebida {
  align-self: flex-start;
  background: #fff;
}
.conteudo-texto {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
.conteudo-midia {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.conteudo-midia img {
  max-width: 240px;
  border-radius: 6px;
}
.conteudo-midia audio {
  max-width: 240px;
}
.link-pdf,
.link-download {
  font-size: 12px;
  color: #1a3c6e;
  text-decoration: none;
}
.link-pdf:hover,
.link-download:hover {
  text-decoration: underline;
}
.rodape-bolha {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}
.hora {
  font-size: 10px;
  color: #888;
}
.btn-apagar-msg {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  opacity: 0.6;
}
.btn-apagar-msg:hover {
  opacity: 1;
}

/* ---------- CAMPO DE ENVIO ---------- */
.campo-envio {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fff;
  border-top: 1px solid #ddd;
}
.btn-anexo {
  font-size: 20px;
  cursor: pointer;
  padding: 6px;
}
.campo-envio input[type="text"] {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #ccc;
  border-radius: 20px;
}
.campo-envio button {
  background: #1a3c6e;
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 20px;
  cursor: pointer;
}
.campo-envio button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ---------- MODAIS (iguais aos que já tínhamos) ---------- */
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