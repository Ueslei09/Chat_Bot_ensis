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
      <div v-if="!chamadoSelecionado" class="chat-vazio text-muted">
        Selecione um chamado ao lado para abrir a conversa.
      </div>

      <div v-else class="chat-corpo">
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

        <!-- FOOTER DO CHAT -->
        <ChatFooter :usuario="usuarioLogado" :chamado="chamadoSelecionado" :status="chamadoSelecionado?.status"
          :pode-assumir="podeAssumirChamado" :pode-reabrir="true" :respondendo-a="respondendoA" :editando="!!editandoId"
          :texto-inicial="textoParaEditar" @enviar-mensagem="enviar" @anexar-arquivo="enviarArquivoSelecionado"
          @gravar-audio="enviarArquivoSelecionado" @confirmar-edicao="confirmarEdicao" @cancelar-edicao="cancelarEdicao"
          @cancelar-resposta="respondendoA = null" @assumir-chamado="assumirForcado"
          @solicitar-transferencia="solicitarTransferencia" @retomar-chamado="retomarAtendimento"
          @reabrir-chamado="reabrir" @voltar-para-fila="voltarParaFila" @visualizar-historico="abrirDetalhes" />
      </div>
    </main>

    <!-- ==================== MODAIS ==================== -->
    <div v-if="modalTransferirAberto" class="modal-overlay" @click.self="fecharModais">
      <div class="modal-box shadow-lg rounded-4 border-0">
        <h4 class="fw-bold text-dark mb-3">Transferir chamado</h4>
        <div class="mb-3">
          <label class="form-label small fw-bold text-muted">Transferir para atendente</label>
          <select v-model="atendenteEscolhido" class="form-select form-select-sm">
            <option value="" disabled>Selecione...</option>
            <option v-for="atendente in atendentes" :key="atendente.id" :value="atendente.id">{{ atendente.nome }}</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label small fw-bold text-muted">Adicionar comentário</label>
          <textarea v-model="comentarioTransferir" rows="3" class="form-control form-control-sm" placeholder="Adicionar comentário"></textarea>
        </div>
        <div class="modal-botoes">
          <button class="btn btn-cancelar btn-sm" @click="fecharModais">Cancelar</button>
          <button class="btn btn-confirmar btn-sm" :disabled="!atendenteEscolhido" @click="transferir">Salvar</button>
        </div>
      </div>
    </div>

    <div v-if="modalFecharAberto" class="modal-overlay" @click.self="fecharModais">
      <div class="modal-box shadow-lg rounded-4 border-0 text-center">
        <div class="modal-icone-alerta mx-auto mb-2 bg-danger-subtle text-danger rounded-circle d-flex align-items-center justify-content-center" style="width: 42px; height: 42px; font-weight: bold;">!</div>
        <h4 class="fw-bold text-dark mb-1">Fechar chamado</h4>
        <p class="modal-subtitulo text-muted small mb-3">Você tem certeza que deseja fechar o chamado?</p>
        <div class="mb-3 text-start">
          <label class="form-label small fw-bold text-muted">Resumo do atendimento</label>
          <textarea v-model="resumoFechamento" rows="3" class="form-control form-control-sm" placeholder="Resumo do atendimento"></textarea>
        </div>
        <div class="modal-botoes">
          <button class="btn btn-cancelar btn-sm" @click="fecharModais">Cancelar</button>
          <button class="btn btn-confirmar btn-sm" @click="fechar">Fechar chamado</button>
        </div>
      </div>
    </div>

    <!-- MODAL: ENCAMINHAR MENSAGEM -->
    <div v-if="modalEncaminharAberto" class="modal-overlay" @click.self="fecharModalEncaminhar">
      <div class="modal-box modal-encaminhar-wpp rounded-4 shadow-lg border-0">
        <div class="modal-header-wpp">
          <h4 class="fw-bold text-dark mb-0">Encaminhar mensagem para</h4>
          <button class="btn-fechar-modal" @click="fecharModalEncaminhar">✕</button>
        </div>

        <div class="modal-search-box">
          <input 
            type="text" 
            placeholder="Pesquisar nome ou número" 
            class="form-control form-control-sm"
          />
        </div>

        <div class="modal-lista-conversas">
          <label 
            v-for="chamado in chamadosParaEncaminhar" 
            :key="chamado.id" 
            class="item-conversa-wpp"
          >
            <input 
              type="checkbox" 
              :value="chamado.id" 
              v-model="chamadoDestinoEncaminhar" 
              class="form-check-input"
            />
            
            <div class="avatar-container">
              <div class="avatar-placeholder">
                {{ chamado.cliente_nome ? chamado.cliente_nome.charAt(0).toUpperCase() : 'C' }}
              </div>
            </div>

            <div class="info-conversa">
              <span class="nome-contato">Chamado #{{ chamado.id }} - {{ chamado.cliente_nome || 'Cliente' }}</span>
              <span class="sub-contato">Clique para selecionar</span>
            </div>
          </label>

          <div v-if="chamadosParaEncaminhar.length === 0" class="sem-resultados">
            Nenhuma conversa encontrada.
          </div>
        </div>

        <div class="modal-botoes">
          <button class="btn btn-cancelar btn-sm" @click="fecharModalEncaminhar">Cancelar</button>
          <button class="btn btn-primary btn-sm" :disabled="!chamadoDestinoEncaminhar || chamadoDestinoEncaminhar.length === 0" @click="confirmarEncaminhar">
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
import ChatSidebar from '../../components/chat/ChatSidebar.vue'
import ChatHeader from '../../components/chat/ChatHeader.vue'
import ChatMessages from '../../components/chat/ChatMessages.vue'
import ChatFooter from '../../components/chat/ChatFooter.vue'
import ChatDrawer from '../../components/chat/ChatDrawer.vue'

import { useChamados } from '@/composables/useChamados'

const {
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
} = useChamados()
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

/* ---------- PADRONIZAÇÃO DE BOTÕES GLOBAIS (CORRIGIDOS) ---------- */
.btn-primary, 
.btn-confirmar, 
button[type="submit"], 
.btn-salvar,
button.btn-adicionar {
  background-color: #0d6efd !important;
  color: #ffffff !important;
  border: none !important;
  padding: 8px 20px !important;
  border-radius: 50px !important;
  font-size: 0.875rem !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  transition: background-color 0.2s ease, box-shadow 0.2s ease !important;
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.25) !important;
}

.btn-primary:hover:not(:disabled), 
.btn-confirmar:hover:not(:disabled), 
button[type="submit"]:hover:not(:disabled), 
.btn-salvar:hover:not(:disabled),
button.btn-adicionar:hover:not(:disabled) {
  background-color: #0b5ed7 !important;
  box-shadow: 0 6px 16px rgba(13, 110, 253, 0.35) !important;
}

.btn-primary:disabled, 
.btn-confirmar:disabled, 
button[type="submit"]:disabled, 
.btn-salvar:disabled,
button.btn-adicionar:disabled {
  background-color: #e2e8f0 !important;
  color: #94a3b8 !important;
  cursor: not-allowed !important;
  box-shadow: none !important;
  border: 1px solid #cbd5e1 !important;
}

.btn-cancelar {
  background-color: #f1f5f9 !important;
  color: #475569 !important;
  border: 1px solid #cbd5e1 !important;
  padding: 8px 18px !important;
  border-radius: 50px !important;
  font-size: 0.875rem !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
}

.btn-cancelar:hover {
  background-color: #e2e8f0 !important;
  color: #1e293b !important;
}

.modal-botoes {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}

/* ---------- LAYOUT RESPONSIVO E CHAT ---------- */
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

.d-none { display: none !important; }
.d-flex { display: flex !important; }

@media (min-width: 768px) {
  .d-md-flex { display: flex !important; }
  .d-md-none { display: none !important; }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 16px;
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