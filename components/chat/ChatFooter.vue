<template>
  <div>
    <ReplyPreview
      v-if="respondendoA"
      modo="resposta"
      rotulo="Respondendo"
      :texto="resumoTexto(respondendoA.conteudo)"
      @cancelar="$emit('cancelar-resposta')"
    />

    <ReplyPreview
      v-if="editando"
      modo="edicao"
      rotulo="Editando"
      texto="mensagem"
      @cancelar="$emit('cancelar-edicao')"
    />

    <form class="campo-envio" @submit.prevent="aoEnviar">
      <template v-if="!editando">
        <!-- Botão "+" que abre o menu de anexos -->
        <div class="anexo-wrapper">
          <button type="button" class="btn-mais" @click.stop="menuAberto = !menuAberto">+</button>

          <div v-if="menuAberto" class="menu-anexo" @click.stop>
            <button type="button" @click="abrirSeletor('documento')">
              <span class="icone-item documento">📄</span> Documento
            </button>
            <button type="button" @click="abrirSeletor('foto')">
              <span class="icone-item foto">🖼️</span> Foto
            </button>
            <button type="button" @click="abrirSeletor('audio')">
              <span class="icone-item audio">🎵</span> Áudio
            </button>
          </div>
        </div>

        <!-- Inputs escondidos, um por tipo, pra já abrir o seletor certo -->
        <input ref="inputDocumento" type="file" accept="application/pdf" @change="aoSelecionarArquivo" hidden />
        <input ref="inputFoto" type="file" accept="image/*" @change="aoSelecionarArquivo" hidden />
        <input ref="inputAudio" type="file" accept="audio/*" @change="aoSelecionarArquivo" hidden />

        <!-- Gravar áudio direto (só aparece se não estiver digitando nada) -->
        <AudioRecorder v-if="!texto.trim()" @gravado="aoGravarAudio" />
      </template>

      <input
        v-model="texto"
        type="text"
        :placeholder="editando ? 'Editar mensagem...' : 'Digite uma mensagem...'"
      />

      <button type="submit" :disabled="!texto.trim()">
        {{ editando ? 'Salvar' : 'Enviar' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import ReplyPreview from './ReplyPreview.vue'
import AudioRecorder from './AudioRecorder.vue'

const props = defineProps({
  respondendoA: { type: Object, default: null },
  editando: { type: Boolean, default: false },
  textoInicial: { type: String, default: '' }
})

const emit = defineEmits(['enviar', 'enviar-arquivo', 'confirmar-edicao', 'cancelar-edicao', 'cancelar-resposta'])

const texto = ref('')
const menuAberto = ref(false)

const inputDocumento = ref(null)
const inputFoto = ref(null)
const inputAudio = ref(null)

watch(
  () => props.textoInicial,
  (novoValor) => { texto.value = novoValor }
)

function resumoTexto(t) {
  if (!t) return ''
  return t.length > 60 ? t.slice(0, 60) + '...' : t
}

function aoEnviar() {
  if (!texto.value.trim()) return
  if (props.editando) {
    emit('confirmar-edicao', texto.value)
  } else {
    emit('enviar', texto.value)
  }
  texto.value = ''
}

// Abre o seletor de arquivo certo, conforme a opção clicada no menu "+"
function abrirSeletor(tipo) {
  menuAberto.value = false
  if (tipo === 'documento') inputDocumento.value.click()
  if (tipo === 'foto') inputFoto.value.click()
  if (tipo === 'audio') inputAudio.value.click()
}

function aoSelecionarArquivo(evento) {
  const arquivo = evento.target.files[0]
  if (arquivo) emit('enviar-arquivo', arquivo)
  evento.target.value = ''
}

function aoGravarAudio(arquivoAudio) {
  emit('enviar-arquivo', arquivoAudio)
}

// Fecha o menu "+" se clicar em qualquer lugar fora dele
function fecharMenuAoClicarFora() {
  menuAberto.value = false
}
onMounted(() => document.addEventListener('click', fecharMenuAoClicarFora))
onBeforeUnmount(() => document.removeEventListener('click', fecharMenuAoClicarFora))

function limpar() {
  texto.value = ''
}
defineExpose({ limpar })
</script>

<style scoped>
.campo-envio {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fff;
  border-top: 1px solid #ddd;
}

.anexo-wrapper {
  position: relative;
}
.btn-mais {
  background: #1a3c6e;
  color: #fff;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  line-height: 1;
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
  font-size: 13px;
}
.icone-item.documento { background: #6c5ce7; }
.icone-item.foto { background: #1e88e5; }
.icone-item.audio { background: #ff8f00; }

.campo-envio input[type='text'] {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #ccc;
  border-radius: 20px;
}
.campo-envio button[type='submit'] {
  background: #1a3c6e;
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 20px;
  cursor: pointer;
}
.campo-envio button[type='submit']:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>