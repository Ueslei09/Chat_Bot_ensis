<template>
  <div class="mensagens" ref="areaMensagens">
    <div v-if="carregando" class="mensagens-vazio">Carregando mensagens...</div>
    <div v-else-if="mensagens.length === 0" class="mensagens-vazio">Nenhuma mensagem ainda.</div>

    <MessageBubble
      v-for="msg in mensagens"
      :key="msg.id"
      :mensagem="msg"
      :todas-mensagens="mensagens"
      :sou-autor="msg.autor_id === meuId"
      :sou-admin="souAdmin"
      @responder="$emit('responder', $event)"
      @encaminhar="$emit('encaminhar', $event)"
      @editar="$emit('editar', $event)"
      @apagar="$emit('apagar', $event)"
    />
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import MessageBubble from './MessageBubble.vue'

const props = defineProps({
  mensagens: { type: Array, required: true },
  carregando: { type: Boolean, default: false },
  meuId: { type: [Number, String], default: null },
  souAdmin: { type: Boolean, default: false }
})

defineEmits(['responder', 'encaminhar', 'editar', 'apagar'])

const areaMensagens = ref(null)

function rolarParaFinal() {
  if (areaMensagens.value) {
    areaMensagens.value.scrollTop = areaMensagens.value.scrollHeight
  }
}

// Toda vez que a lista de mensagens mudar (nova mensagem, troca de chamado),
// rola automaticamente pro final — igual qualquer app de chat de verdade
watch(
  () => props.mensagens.length,
  async () => {
    await nextTick()
    rolarParaFinal()
  }
)

defineExpose({ rolarParaFinal })
</script>

<style scoped>
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
</style>