<template>
  <div v-if="mensagem.autor_tipo === 'SISTEMA'" class="faixa-sistema">
    {{ mensagem.conteudo }} — {{ formatarHora(mensagem.criada_em) }}
  </div>

  <div v-else class="bolha-wrapper" :class="mensagem.autor_tipo === 'CLIENTE' ? 'recebida' : 'enviada'">
    <div class="bolha">
      <div v-if="mensagem.encaminhada_de" class="selo-encaminhada">↪️ Encaminhada</div>

      <ReplyPreview v-if="mensagem.resposta_a" modo="citacao" :texto="textoMensagemOriginal" />

      <p v-if="mensagem.tipo === 'TEXTO'" class="conteudo-texto">{{ mensagem.conteudo }}</p>

      <ImageViewer v-else-if="mensagem.tipo === 'IMAGEM'" :url="urlArquivo(mensagem.conteudo)" />

      <AudioPlayer v-else-if="mensagem.tipo === 'AUDIO'" :url="urlArquivo(mensagem.conteudo)" />

      <PdfViewer v-else-if="mensagem.tipo === 'PDF'" :url="urlArquivo(mensagem.conteudo)" />

      <div class="rodape-bolha">
        <span v-if="mensagem.editada_em" class="editado-label">editado</span>
        <span class="hora">{{ formatarHora(mensagem.criada_em) }}</span>
      </div>
    </div>

    <MessageMenu
      :pode-editar="podeEditar"
      :pode-apagar="podeApagar"
      :alinhamento="mensagem.autor_tipo === 'CLIENTE' ? 'direita' : 'esquerda'"
      @responder="$emit('responder', mensagem)"
      @encaminhar="$emit('encaminhar', mensagem)"
      @editar="$emit('editar', mensagem)"
      @apagar="$emit('apagar', mensagem.id)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MessageMenu from './MessageMenu.vue'
import ReplyPreview from './ReplyPreview.vue'
import AudioPlayer from './AudioPlayer.vue'
import ImageViewer from './ImageViewer.vue'
import PdfViewer from './PdfViewer.vue'
import { urlArquivo } from '@/services/mensagensServices.js'

const props = defineProps({
  mensagem: { type: Object, required: true },
  todasMensagens: { type: Array, default: () => [] },
  souAutor: { type: Boolean, default: false },
  souAdmin: { type: Boolean, default: false }
})

defineEmits(['responder', 'encaminhar', 'editar', 'apagar'])

const podeEditar = computed(() => props.mensagem.tipo === 'TEXTO' && (props.souAdmin || props.souAutor))
const podeApagar = computed(() => props.souAdmin)

const textoMensagemOriginal = computed(() => {
  const original = props.todasMensagens.find(m => m.id === props.mensagem.resposta_a)
  if (!original) return 'Mensagem original'
  return original.conteudo.length > 60 ? original.conteudo.slice(0, 60) + '...' : original.conteudo
})

function formatarHora(dataString) {
  return new Date(dataString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.faixa-sistema {
  align-self: center;
  background: #dbe3ee;
  color: #444;
  font-size: 12px;
  padding: 6px 14px;
  border-radius: 12px;
  margin: 6px auto;
  text-align: center;
  width: fit-content;
}
.bolha-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  max-width: 65%;
  position: relative;
}
.bolha-wrapper.enviada {
  align-self: flex-end;
  flex-direction: row-reverse;
}
.bolha-wrapper.recebida {
  align-self: flex-start;
}
.bolha {
  padding: 8px 12px;
  border-radius: 8px;
  background: #fff;
  min-width: 80px;
}
.bolha-wrapper.enviada .bolha {
  background: #d9fdd3;
}
.selo-encaminhada {
  font-size: 10px;
  color: #888;
  margin-bottom: 2px;
}
.conteudo-texto {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
.rodape-bolha {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 4px;
}
.editado-label {
  font-size: 10px;
  color: #999;
  font-style: italic;
}
.hora {
  font-size: 10px;
  color: #888;
}
</style>