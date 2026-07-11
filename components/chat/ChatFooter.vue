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
        <label class="btn-anexo" title="Anexar arquivo">
          📎
          <input type="file" accept="image/*,audio/*,application/pdf" @change="aoSelecionarArquivo" hidden />
        </label>

        <!-- Botão de gravar áudio (só aparece se não estiver digitando nada) -->
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
import { ref, watch } from 'vue'
import ReplyPreview from './ReplyPreview.vue'
import AudioRecorder from './AudioRecorder.vue'

const props = defineProps({
  respondendoA: { type: Object, default: null },
  editando: { type: Boolean, default: false },
  textoInicial: { type: String, default: '' }
})

// Eventos: 'enviar' (texto), 'enviar-arquivo' (File), 'confirmar-edicao' (texto),
// 'cancelar-edicao', 'cancelar-resposta'
const emit = defineEmits(['enviar', 'enviar-arquivo', 'confirmar-edicao', 'cancelar-edicao', 'cancelar-resposta'])

const texto = ref('')

watch(
  () => props.textoInicial,
  (novoValor) => {
    texto.value = novoValor
  }
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

function aoSelecionarArquivo(evento) {
  const arquivo = evento.target.files[0]
  if (arquivo) emit('enviar-arquivo', arquivo)
  evento.target.value = ''
}

// Chamado quando o AudioRecorder termina uma gravação —
// reaproveita o mesmo evento 'enviar-arquivo' do upload normal
function aoGravarAudio(arquivoAudio) {
  emit('enviar-arquivo', arquivoAudio)
}

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
.btn-anexo {
  font-size: 20px;
  cursor: pointer;
  padding: 6px;
}
.campo-envio input[type='text'] {
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
</style>