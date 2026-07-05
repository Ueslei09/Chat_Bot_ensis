<template>
  <div class="tela-chamados">

    <!-- ==================== SIDEBAR ESQUERDA ==================== -->
    <aside class="sidebar">

      <!-- Abas: Atendendo (Conversando) / Fila / Fechados -->
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

      <!-- Lista de chamados da aba selecionada -->
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

    <!-- ==================== ÁREA DE CHAT (ainda vazia) ==================== -->
    <main class="area-chat">
      <div v-if="!chamadoSelecionado" class="chat-vazio">
        Selecione um chamado ao lado para abrir a conversa.
      </div>

      <div v-else class="chat-cabecalho">
        <div>
          <strong>Chamado #{{ chamadoSelecionado.id }}</strong>
          <span class="status-badge">{{ chamadoSelecionado.status }}</span>
        </div>

        <!-- Ações que vamos ligar depois: transferir, fechar, etc -->
        <div class="acoes">
          <button v-if="abaAtual === 'ABERTO'" @click="assumir">
            Assumir
          </button>
          <button v-if="abaAtual === 'EM_ATENDIMENTO'" @click="fechar">
            Fechar chamado
          </button>
        </div>

        <!-- Aqui embaixo entra a lista de mensagens, upload, etc,
             nos próximos passos -->
        <div class="chat-placeholder">
          (área de mensagens vem no próximo passo)
        </div>
      </div>
    </main>

  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import {
  listarChamadosPorStatus,
  assumirChamado,
  fecharChamado
} from '@/services/chamadoServices.js'

// Aba selecionada na sidebar (controla qual status é buscado)
const abaAtual = ref('EM_ATENDIMENTO')

// Lista de chamados da aba atual
const chamados = ref([])
const carregando = ref(false)

// Chamado aberto na área de chat
const chamadoSelecionado = ref(null)

// Busca os chamados da API, filtrando pelo status da aba atual
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

// Troca de aba: Conversando / Fila / Chamados
function trocarAba(status) {
  abaAtual.value = status
  chamadoSelecionado.value = null
}

// Sempre que a aba mudar, recarrega a lista de chamados
watch(abaAtual, carregarChamados)

// Seleciona um chamado (por enquanto só guarda qual foi clicado;
// a busca de mensagens entra no próximo passo)
function selecionarChamado(chamado) {
  chamadoSelecionado.value = chamado
}

// Assume o chamado selecionado (só aparece na aba Fila)
async function assumir() {
  await assumirChamado(chamadoSelecionado.value.id)
  await carregarChamados()
  chamadoSelecionado.value = null
}

// Fecha o chamado selecionado (só aparece na aba Conversando)
async function fechar() {
  await fecharChamado(chamadoSelecionado.value.id)
  await carregarChamados()
  chamadoSelecionado.value = null
}

// Carrega a aba padrão (Conversando) assim que a tela abre
onMounted(carregarChamados)
</script>

<style scoped>
.tela-chamados {
  display: flex;
  height: calc(100vh - 56px); /* desconta a altura do navbar do DefaultLayout */
}

/* ---------- SIDEBAR ---------- */
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

/* ---------- ÁREA DE CHAT ---------- */
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
.chat-cabecalho > div:first-child {
  background: #fff;
  padding: 14px 20px;
  border-bottom: 1px solid #ddd;
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
.acoes {
  background: #fff;
  padding: 8px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  gap: 8px;
}
.acoes button {
  background: #1a3c6e;
  color: #fff;
  border: none;
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
.chat-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 13px;
}
</style>