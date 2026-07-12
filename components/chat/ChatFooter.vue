<template>
  <div>
    <ReplyPreview
      v-if="respondendoA && estado === 'liberado'"
      modo="resposta"
      rotulo="Respondendo"
      :texto="resumoTexto(respondendoA.conteudo)"
      @cancelar="$emit('cancelar-resposta')"
    />
    <ReplyPreview
      v-if="editando && estado === 'liberado'"
      modo="edicao"
      rotulo="Editando"
      texto="mensagem"
      @cancelar="$emit('cancelar-edicao')"
    />

    <Transition name="footer-fade" mode="out-in">

      <!-- ==================== ESTADO 1: ATENDIMENTO LIBERADO ==================== -->
      <form v-if="estado === 'liberado'" key="liberado" class="campo-envio" @submit.prevent="aoEnviar">
        <template v-if="!editando">
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

          <!-- Áudio gravado ao vivo já tem confirmação própria (✔/✕), não passa pela prévia -->
          <AudioRecorder v-if="!texto.trim()" @gravado="aoGravarAudio" />
        </template>

        <textarea
          v-model="texto"
          rows="1"
          class="campo-texto"
          :placeholder="editando ? 'Editar mensagem...' : 'Digite uma mensagem...'"
          @keydown.enter.exact.prevent="aoEnviar"
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
          <button class="btn btn-primary btn-sm" @click="aoClicarBotaoPrincipal">
            {{ podeAssumir ? 'Assumir Atendimento' : 'Solicitar Transferência' }}
          </button>
          <button class="btn btn-link btn-sm" @click="$emit('voltarParaFila')">
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
          <button class="btn btn-primary btn-sm" @click="$emit('retomarChamado')">
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
          <button v-if="podeReabrir" class="btn btn-primary btn-sm" @click="$emit('reabrirChamado')">
            Reabrir Chamado
          </button>
          <button class="btn btn-link btn-sm" @click="$emit('visualizarHistorico')">
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
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
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

const texto = ref('')

watch(() => props.textoInicial, (novoValor) => { texto.value = novoValor })

function resumoTexto(t) {
  if (!t) return ''
  return t.length > 60 ? t.slice(0, 60) + '...' : t
}

function aoEnviar(evento) {
  if (evento?.shiftKey) return
  if (!texto.value.trim()) return

  if (props.editando) {
    emit('confirmar-edicao', texto.value)
  } else {
    emit('enviarMensagem', texto.value)
  }
  texto.value = ''
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
}

// ------------------------------------------------------------
// ANEXO — agora não envia direto, guarda o arquivo pra mostrar a prévia
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

// Ao escolher o arquivo, NÃO envia ainda — abre a prévia
function aoSelecionarArquivo(evento) {
  const arquivo = evento.target.files[0]
  if (arquivo) arquivoPendente.value = arquivo
  evento.target.value = ''
}

// Confirmado na tela de prévia (com ou sem legenda) -> agora sim envia
function confirmarEnvioArquivo(legenda) {
  emit('anexarArquivo', { arquivo: arquivoPendente.value, legenda })
  arquivoPendente.value = null
}

// Áudio gravado ao vivo já teve confirmação própria no AudioRecorder (✔/✕),
// então vai direto, sem passar pela tela de prévia de novo
function aoGravarAudio(arquivoAudio) {
  emit('gravarAudio', arquivoAudio)
}

function fecharMenusAoClicarFora() {
  emojiAberto.value = false
  menuAnexoAberto.value = false
}
onMounted(() => document.addEventListener('click', fecharMenusAoClicarFora))
onBeforeUnmount(() => document.removeEventListener('click', fecharMenusAoClicarFora))

function limpar() {
  texto.value = ''
}
defineExpose({ limpar })
</script>

<style scoped>
.campo-envio {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  padding: 12px;
  background: #fff;
  border-top: 1px solid #ddd;
}
.btn-icone {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 6px;
  color: #555;
}
.acao-wrapper {
  position: relative;
}
.menu-emoji {
  position: absolute;
  bottom: 42px;
  left: 0;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 8px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 30;
}
.menu-emoji button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
}
.menu-emoji button:hover {
  background: #f0f0f0;
}
.menu-anexo {
  position: absolute;
  bottom: 42px;
  left: 0;
  background: #2b2b3d;
  border-radius: 10px;
  padding: 8px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  min-width: 180px;
  z-index: 30;
}
.menu-anexo button {
  background: none;
  border: none;
  color: #fff;
  text-align: left;
  padding: 10px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}
.menu-anexo button:hover {
  background: rgba(255, 255, 255, 0.08);
}
.icone-item {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #fff;
}
.icone-item.documento { background: #6c5ce7; }
.icone-item.foto { background: #1e88e5; }
.icone-item.audio { background: #ff8f00; }

.campo-texto {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #ccc;
  border-radius: 20px;
  resize: none;
  max-height: 100px;
  font-family: inherit;
  line-height: 1.4;
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
}
.btn-enviar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.rodape-info {
  padding: 18px 24px;
  background: #fff;
  border-top: 1px solid #ddd;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.icone-rodape {
  font-size: 24px;
  margin-bottom: 4px;
}
.titulo-rodape {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}
.descricao-rodape {
  margin: 0;
  font-size: 12px;
  color: #777;
  max-width: 420px;
}
.botoes-rodape {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}
.rodape-info.bloqueado .icone-rodape { color: #c0392b; }
.rodape-info.aguardando .icone-rodape { color: #f0ad4e; }
.rodape-info.encerrado .icone-rodape { color: #27ae60; }

.footer-fade-enter-active,
.footer-fade-leave-active {
  transition: opacity 0.25s ease;
}
.footer-fade-enter-from,
.footer-fade-leave-to {
  opacity: 0;
}
</style>