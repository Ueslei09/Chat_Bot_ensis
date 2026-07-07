<template>
  <div class="tela-chamados">

    <!-- ==================== SIDEBAR ESQUERDA ==================== -->
    <aside class="sidebar">
      <nav class="abas">
        <button
          :class="{ ativa: abaAtual === 'EM_ATENDIMENTO' }"
          @click="trocarAba('EM_ATENDIMENTO')"
        >
          Conversando
        </button>
        <button
          :class="{ ativa: abaAtual === 'ABERTO' }"
          @click="trocarAba('ABERTO')"
        >
          Fila
        </button>
        <button
          :class="{ ativa: abaAtual === 'FECHADO' }"
          @click="trocarAba('FECHADO')"
        >
          Chamados
        </button>
      </nav>

      <ul class="lista-chamados">
        <li v-if="carregando" class="vazio">Carregando...</li>
        <li v-else-if="chamados.length === 0" class="vazio">
          Nenhum chamado aqui.
        </li>
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

          <!-- ==================== ÍCONES DE AÇÃO ==================== -->
          <div class="icones-acao">
            <!-- Aba Fila: só assumir -->
            <button
              v-if="abaAtual === 'ABERTO'"
              class="icone-btn"
              title="Assumir chamado"
              @click="assumir"
            >
              ✅
            </button>

            <!-- Aba Conversando: transferir e fechar -->
            <template v-if="abaAtual === 'EM_ATENDIMENTO'">
              <button
                class="icone-btn"
                title="Transferir chamado"
                @click="abrirModalTransferir"
              >
                🔄
              </button>
              <button
                class="icone-btn"
                title="Fechar chamado"
                @click="abrirModalFechar"
              >
                ✂️
              </button>
            </template>

            <!-- Aba Chamados (fechados): reabrir -->
            <button
              v-if="abaAtual === 'FECHADO'"
              class="icone-btn"
              title="Reabrir chamado"
              @click="reabrir"
            >
              ↩️
            </button>
          </div>
        </div>

        <p v-if="mensagemAcao" class="mensagem-acao">{{ mensagemAcao }}</p>

        <div class="chat-placeholder">
          (área de mensagens vem no próximo passo)
        </div>
      </div>
    </main>

    <!-- ==================== MODAL: TRANSFERIR CHAMADO ==================== -->
    <div v-if="modalTransferirAberto" class="modal-overlay" @click.self="fecharModais">
      <div class="modal-box">
        <h3>Transferir chamado</h3>

        <label>Transferir para atendente</label>
        <select v-model="atendenteEscolhido">
          <option value="" disabled>Selecione...</option>
          <option
            v-for="atendente in atendentes"
            :key="atendente.id"
            :value="atendente.id"
          >
            {{ atendente.nome }}
          </option>
        </select>

        <label>Adicionar comentário</label>
        <textarea v-model="comentarioTransferir" rows="3" placeholder="Adicionar comentário"></textarea>

        <div class="modal-botoes">
          <button class="btn-cancelar" @click="fecharModais">Cancelar</button>
          <button class="btn-confirmar" :disabled="!atendenteEscolhido" @click="transferir">
            Salvar
          </button>
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
import { ref, watch, onMounted } from 'vue'
import {
  listarChamadosPorStatus,
  assumirChamado,
  fecharChamado,
  transferirChamado,
  reabrirChamado
} from '@/services/chamadoServices.js'
import { listarAtendentes } from '@/services/usuariosServices.js'
import { enviarMensagem } from '@/services/mensagensServices.js'
import { useRoute } from 'vue-router'

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
}

watch(abaAtual, carregarChamados)

function selecionarChamado(chamado) {
  chamadoSelecionado.value = chamado
  mensagemAcao.value = ''
}

async function assumir() {
  await assumirChamado(chamadoSelecionado.value.id)
  await carregarChamados()
  chamadoSelecionado.value = null
}

// ------------------------------------------------------------
// MODAIS: abrir e fechar
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// AÇÕES CONFIRMADAS DENTRO DO MODAL
// ------------------------------------------------------------
async function transferir() {
  try {
    await transferirChamado(chamadoSelecionado.value.id, atendenteEscolhido.value)

    // Se o usuário escreveu um comentário, salva como mensagem no histórico
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
    // Se o usuário escreveu um resumo, salva como mensagem no histórico
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
 
  // Se veio da tela de Contatos com ?abrir=ID, seleciona esse
  // chamado automaticamente (ele já está EM_ATENDIMENTO, então
  // já vai aparecer na aba padrão "Conversando")
  const idParaAbrir = route.query.abrir
  if (idParaAbrir) {
    const chamado = chamados.value.find(c => c.id === Number(idParaAbrir))
    if (chamado) {
      selecionarChamado(chamado)
    }
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

/* Ícones de ação no canto direito, igual referência */
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
.chat-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 13px;
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
</style>