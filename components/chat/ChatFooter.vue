<template>
  <div ref="footerRef" class="chat-footer-container">
    <!-- Preview de Resposta -->
    <ReplyPreview
      v-if="respondendoA && estado === 'liberado'"
      modo="resposta"
      rotulo="Respondendo"
      :texto="resumoTexto(respondendoA.conteudo)"
      @cancelar="$emit('cancelar-resposta')"
    />
    
    <!-- Preview de Edição (Corrigido de texto="mensagem" para a variável de estado dinâmica props.textoInicial) -->
    <ReplyPreview
      v-if="editando && estado === 'liberado'"
      modo="edicao"
      rotulo="Editando"
      :texto="resumoTexto(textoInicial)"
      @cancelar="$emit('cancelar-edicao')"
    />

    <Transition name="footer-fade" mode="out-in">

      <!-- ==================== ESTADO 1: ATENDIMENTO LIBERADO ==================== -->
      <form v-if="estado === 'liberado'" key="liberado" class="campo-envio" @submit.prevent="aoEnviar">
        <template v-if="!editando">
          <!-- Seção: Emojis -->
          <div class="acao-wrapper">
            <button type="button" class="btn-icone" title="Emoji" @click.stop="alternarEmoji">
              <i class="bi bi-emoji-smile"></i>
            </button>
            <div v-if="emojiAberto" class="menu-emoji" @click.stop>
              <button v-for="emoji in emojisComuns" :key="emoji" type="button" @click="inserirEmoji(emoji)">
                {{ emoji }}
              </button>
            </div>
          </div>

          <!-- Seção: Anexos -->
          <div class="acao-wrapper">
            <button type="button" class="btn-icone" title="Anexar" @click.stop="alternarAnexo">
              <i class="bi bi-paperclip"></i>
            </button>
            <div v-if="menuAnexoAberto" class="menu-anexo" @click.stop>
              <button type="button" @click="abrirSeletor('documento')">
                <span class="icone-item documento"><i class="bi bi-file-earmark-text"></i></span> Documento
              </button>
              <button type="button" @click="abrirSeletor('foto')">
                <span class="icone-item foto"><i class="bi bi-image"></i></span> Foto
              </button>
              <button type="button" @click="abrirSeletor('audio')">
                <span class="icone-item audio"><i class="bi bi-music-note"></i></span> Áudio
              </button>
            </div>
          </div>

          <input ref="inputDocumento" type="file" accept="application/pdf" @change="aoSelecionarArquivo" hidden />
          <input ref="inputFoto" type="file" accept="image/*" @change="aoSelecionarArquivo" hidden />
          <input ref="inputAudio" type="file" accept="audio/*" @change="aoSelecionarArquivo" hidden />

          <!-- Gravador de Áudio -->
          <AudioRecorder v-if="!texto.trim()" @gravado="aoGravarAudio" />
        </template>

        <!-- Campo de Digitação Ajustável -->
        <textarea
          ref="textareaRef"
          v-model="texto"
          rows="1"
          class="campo-texto"
          :placeholder="editando ? 'Editar mensagem...' : 'Digite uma mensagem...'"
          @keydown.enter.exact.prevent="aoEnviar"
          @input="ajustarAltura"
        ></textarea>

        <button type="submit" class="btn-enviar" :disabled="!texto.trim()">
          <i class="bi bi-send-fill"></i>
        </button>
      </form>

      <!-- ==================== ESTADO 2: OUTRO ATENDENTE ==================== -->
      <div v-else-if="estado === 'bloqueado'" key="bloqueado" class="rodape-info bloqueado">
        <i class="bi bi-lock-fill icone-rodape"></i>
        <p class="titulo-rodape">Este chamado está sendo atendido por outro colaborador.</p>
        <p class="descricao-rodape">
          Você pode visualizar toda a conversa, porém não pode enviar mensagens
          enquanto o atendimento estiver em andamento.
        </p>
        <div class="botoes-rodape">
          <button type="button" class="btn btn-primary btn-sm" @click="aoClicarBotaoPrincipal">
            {{ podeAssumir ? 'Assumir Atendimento' : 'Solicitar Transferência' }}
          </button>
          <button type="button" class="btn btn-link btn-sm" @click="$emit('voltarParaFila')">
            Voltar para fila
          </button>
        </div>
      </div>

      <!-- ==================== ESTADO 3: AGUARDANDO CLIENTE ==================== -->
      <div v-else-if="estado === 'aguardandoCliente'" key="aguardandoCliente" class="rodape-info aguardando">
        <i class="bi bi-hourglass-split icone-rodape"></i>
        <p class="titulo-rodape">Aguardando resposta do cliente</p>
        <p class="descricao-rodape">
          O envio de novas mensagens foi bloqueado até que o cliente responda
          ou o atendimento seja retomado.
        </p>
        <div class="botoes-rodape">
          <button type="button" class="btn btn-primary btn-sm" @click="$emit('retomarChamado')">
            Retomar Atendimento
          </button>
        </div>
      </div>

      <!-- ==================== ESTADO 4: ENCERRADO ==================== -->
      <div v-else-if="estado === 'encerrado'" key="encerrado" class="rodape-info encerrado">
        <i class="bi bi-check-circle-fill icone-rodape"></i>
        <p class="titulo-rodape">Chamado encerrado</p>
        <p class="descricao-rodape">Este atendimento foi finalizado. Não é possível enviar novas mensagens.</p>
        <div class="botoes-rodape">
          <button v-if="podeReabrir" type="button" class="btn btn-primary btn-sm" @click="$emit('reabrirChamado')">
            Reabrir Chamado
          </button>
          <button type="button" class="btn btn-link btn-sm" @click="$emit('visualizarHistorico')">
            Visualizar Histórico
          </button>
        </div>
      </div>

    </Transition>

    <!-- ==================== PRÉVIA DO ARQUIVO ANTES DE ENVIAR ==================== -->
    <AttachPreview
      v-if="arquivoPendente"
      :arquivo="arquivoPendente"
      @cancelar="arquivoPendente = null"
      @enviar="confirmarEnvioArquivo"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import ReplyPreview from './ReplyPreview.vue'
import AudioRecorder from './AudioRecorder.vue'
import AttachPreview from './AttachPreview.vue'

const props = defineProps({
  usuario: { type: Object, default: () => ({}) },
  chamado: { type: Object, default: () => ({}) },
  status: { type: String, default: '' },
  podeAssumir: { type: Boolean, default: false },
  podeReabrir: { type: Boolean, default: true },

  respondendoA: { type: Object, default: null },
  editando: { type: Boolean, default: false },
  textoInicial: { type: String, default: '' }
})

const emit = defineEmits([
  'enviarMensagem', 'gravarAudio', 'anexarArquivo', 'abrirEmoji',
  'assumirChamado', 'solicitarTransferencia', 'retomarChamado', 'reabrirChamado',
  'voltarParaFila', 'visualizarHistorico',
  'confirmar-edicao', 'cancelar-edicao', 'cancelar-resposta'
])

const texto = ref('')
const textareaRef = ref(null)
const footerRef = ref(null)

const estado = computed(() => {
  if (props.status === 'FECHADO') return 'encerrado'
  if (props.status === 'AGUARDANDO_CLIENTE') return 'aguardandoCliente'

  if (props.status === 'EM_ATENDIMENTO') {
    const souDono = props.chamado?.atendente_id === props.usuario?.id
    const souAdmin = props.usuario?.perfil === 'ADM'
    if (souDono || souAdmin) return 'liberado'
    return 'bloqueado'
  }

  return 'liberado'
})

function aoClicarBotaoPrincipal() {
  if (props.podeAssumir) {
    emit('assumirChamado')
  } else {
    emit('solicitarTransferencia')
  }
}

// Sincroniza o texto de edição vindo do componente pai
watch(() => props.textoInicial, (novoValor) => { 
  texto.value = novoValor || '' 
  nextTick(ajustarAltura)
})

function resumoTexto(t) {
  if (!t) return ''
  return t.length > 60 ? t.slice(0, 60) + '...' : t
}

function aoEnviar(evento) {
  if (evento?.shiftKey) return // Permite quebra de linha com Shift+Enter
  if (!texto.value.trim()) return

  if (props.editando) {
    emit('confirmar-edicao', texto.value)
  } else {
    emit('enviarMensagem', texto.value)
  }
  
  texto.value = ''
  nextTick(ajustarAltura) // Reduz a caixa de volta para o tamanho padrão de uma única linha
}

// ------------------------------------------------------------
// AJUSTE DINÂMICO DE ALTURA (UX WhatsApp):
// ------------------------------------------------------------
function ajustarAltura() {
  const textarea = textareaRef.value
  if (!textarea) return
  textarea.style.height = 'auto'
  // Permite expansão até uma altura máxima confortável (120px) antes de habilitar a rolagem
  textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
}

// ------------------------------------------------------------
// EMOJI
// ------------------------------------------------------------
const emojiAberto = ref(false)
const emojisComuns = ['😀', '😂', '😊', '😍', '👍', '🙏', '🎉', '❤️', '😢', '🔥']

function alternarEmoji() {
  emojiAberto.value = !emojiAberto.value
  emit('abrirEmoji')
}
function inserirEmoji(emoji) {
  texto.value += emoji
  emojiAberto.value = false
  nextTick(ajustarAltura)
}

// ------------------------------------------------------------
// ANEXO
// ------------------------------------------------------------
const menuAnexoAberto = ref(false)
const inputDocumento = ref(null)
const inputFoto = ref(null)
const inputAudio = ref(null)
const arquivoPendente = ref(null)

function alternarAnexo() {
  menuAnexoAberto.value = !menuAnexoAberto.value
}

function abrirSeletor(tipo) {
  menuAnexoAberto.value = false
  if (tipo === 'documento') inputDocumento.value.click()
  if (tipo === 'foto') inputFoto.value.click()
  if (tipo === 'audio') inputAudio.value.click()
}

function aoSelecionarArquivo(evento) {
  const arquivo = evento.target.files[0]
  if (arquivo) arquivoPendente.value = arquivo
  evento.target.value = ''
}

// Dentro do ChatFooter.vue
function confirmarEnvioArquivo(legenda) {
  emit('anexarArquivo', { arquivo: arquivoPendente.value, legenda })
  arquivoPendente.value = null
}
function aoGravarAudio(arquivoAudio) {
  emit('gravarAudio', arquivoAudio)
}

// ⚡ PERFORMANCE E ACESSIBILIDADE:
// Só roda lógica pesada de fechamento por fora se um menu estiver de fato aberto!
function fecharMenusAoClicarFora(event) {
  if (!emojiAberto.value && !menuAnexoAberto.value) return

  // Se o clique não foi dentro de nenhuma parte do footer, recolhe os dropdowns
  if (footerRef.value && !footerRef.value.contains(event.target)) {
    emojiAberto.value = false
    menuAnexoAberto.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', fecharMenusAoClicarFora, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', fecharMenusAoClicarFora, true)
})

function limpar() {
  texto.value = ''
  nextTick(ajustarAltura)
}
defineExpose({ limpar })
</script>

<style scoped>
.chat-footer-container {
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
  border-top: 1px solid #e2e8f0;
}

.campo-envio {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 10px 16px;
  background: #f0f2f5;
}

.btn-icone {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 6px;
  color: #54656f;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s;
}
.btn-icone:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.acao-wrapper {
  position: relative;
}

.menu-emoji {
  position: absolute;
  bottom: 48px;
  left: 0;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 100;
  animation: scaleIn 0.1s ease-out;
}
.menu-emoji button {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: transform 0.1s;
}
.menu-emoji button:hover {
  transform: scale(1.15);
  background: #f1f5f9;
}

.menu-anexo {
  position: absolute;
  bottom: 48px;
  left: 0;
  background: #2b2b3d;
  border-radius: 12px;
  padding: 8px 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  min-width: 190px;
  z-index: 100;
  animation: scaleIn 0.1s ease-out;
}
.menu-anexo button {
  background: none;
  border: none;
  color: #fff;
  text-align: left;
  padding: 10px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.15s;
}
.menu-anexo button:hover {
  background: rgba(255, 255, 255, 0.08);
}
.icone-item {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #fff;
}
.icone-item.documento { background: #6c5ce7; }
.icone-item.foto { background: #1e88e5; }
.icone-item.audio { background: #ff8f00; }

.campo-texto {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #fff;
  border-radius: 20px;
  resize: none;
  max-height: 120px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.4;
  outline: none;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: border-color 0.2s;
}
.campo-texto:focus {
  border-color: #cbd5e1;
}

.btn-enviar {
  background: #1a3c6e;
  color: #fff;
  border: none;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color 0.15s, transform 0.1s;
}
.btn-enviar:hover:not(:disabled) {
  background-color: #11294a;
  transform: scale(1.05);
}
.btn-enviar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.rodape-info {
  padding: 24px;
  background: #fff;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.02);
}
.icone-rodape {
  font-size: 28px;
  margin-bottom: 4px;
}
.titulo-rodape {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}
.descricao-rodape {
  margin: 0;
  font-size: 13px;
  color: #64748b;
  max-width: 460px;
  line-height: 1.5;
}
.botoes-rodape {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border-radius: 20px;
  padding: 8px 18px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
}
.btn-sm {
  padding: 6px 14px;
  font-size: 12px;
}
.btn-primary {
  background-color: #1a3c6e;
  border-color: #1a3c6e;
  color: #fff;
}
.btn-primary:hover {
  background-color: #11294a;
  border-color: #11294a;
}
.btn-link {
  background: none;
  border: none;
  color: #64748b;
  text-decoration: none;
}
.btn-link:hover {
  color: #1a3c6e;
  text-decoration: underline;
}

.rodape-info.bloqueado .icone-rodape { color: #ef4444; }
.rodape-info.aguardando .icone-rodape { color: #f59e0b; }
.rodape-info.encerrado .icone-rodape { color: #10b981; }

.footer-fade-enter-active,
.footer-fade-leave-active {
  transition: opacity 0.15s ease;
}
.footer-fade-enter-from,
.footer-fade-leave-to {
  opacity: 0;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>