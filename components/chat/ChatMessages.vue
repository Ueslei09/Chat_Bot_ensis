<template>
  <!-- Escutamos o evento de scroll para controlar o estado visual se necessário -->
  <div class="mensagens" ref="areaMensagens" @scroll="aoDarScroll">
    <div v-if="carregando" class="mensagens-vazio">
      <div class="spinner-border spinner-sm text-primary" role="status"></div>
      <span>Carregando mensagens...</span>
    </div>
    <div v-else-if="mensagens.length === 0" class="mensagens-vazio">
      Nenhuma mensagem ainda. Comece a conversa!
    </div>

    <MessageBubble
      v-else
      v-for="msg in mensagens"
      :key="msg.id"
      :mensagem="msg"
      :todas-mensagens="mensagens"
      :sou-autor="msg.autor_id === meuId"
      :sou-admin="souAdmin"
      :pode-apagar-geral="podeApagarGeral" 
      @responder="$emit('responder', $event)"
      @encaminhar="$emit('encaminhar', $event)"
      @editar="$emit('editar', $event)"
      @apagar="$emit('apagar', $event)"
    />

    <!-- Botão flutuante sutil se houver novas mensagens abaixo da rolagem atual (UX de WhatsApp) -->
    <button 
      v-if="mostrarBotaoDescer" 
      type="button" 
      class="btn-ir-para-fim" 
      aria-label="Rolar para o final"
      @click="rolarParaFinal"
    >
      ↓
    </button>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import MessageBubble from './MessageBubble.vue'

const props = defineProps({
  mensagens: { type: Array, required: true },
  carregando: { type: Boolean, default: false },
  meuId: { type: [Number, String], default: null },
  souAdmin: { type: Boolean, default: false },
  // ⚡ Crucial para a Regra de Negócio: Herda a flag de permissão para repassar ao MessageBubble
  podeApagarGeral: { type: Boolean, default: false }
})

defineEmits(['responder', 'encaminhar', 'editar', 'apagar'])

const areaMensagens = ref(null)
const mostrarBotaoDescer = ref(false)

/**
 * Rola a área de mensagens até o fundo de forma suave
 */
function rolarParaFinal() {
  if (areaMensagens.value) {
    areaMensagens.value.scrollTo({
      top: areaMensagens.value.scrollHeight,
      behavior: 'smooth' // Rola de maneira fluida e elegante
    })
  }
}

/**
 * Avalia se o usuário está ou não próximo ao final da tela para decidir se exibe o botão
 */
function aoDarScroll() {
  if (!areaMensagens.value) return
  const { scrollTop, scrollHeight, clientHeight } = areaMensagens.value
  
  // Se o usuário subiu mais de 300px do fundo da tela, mostra o botão sutil de descer
  const distanciaDoFundo = scrollHeight - scrollTop - clientHeight
  mostrarBotaoDescer.value = distanciaDoFundo > 300
}

// Monitora a chegada de novas mensagens
watch(
  () => props.mensagens.length,
  async (novoTamanho, antigoTamanho) => {
    if (novoTamanho === 0) return
    
    await nextTick()
    
    if (!areaMensagens.value) return
    const { scrollTop, scrollHeight, clientHeight } = areaMensagens.value
    const distanciaDoFundo = scrollHeight - scrollTop - clientHeight

    // ⚡ ROLAGEM INTELIGENTE (UX):
    // 1. Se for a primeira carga de mensagens do chamado (antigoTamanho era 0 ou menor), rola obrigatoriamente.
    // 2. Se a última mensagem adicionada foi enviada por MIM, força a rolagem.
    // 3. Se a última mensagem foi enviada pelo CLIENTE, só rola se eu já estiver perto do fim (evita roubar a leitura se eu subir a tela).
    const ultimaMsg = props.mensagens[props.mensagens.length - 1]
    const enviadaPorMim = ultimaMsg && ultimaMsg.autor_id === props.meuId
    const carregandoNovoChamado = antigoTamanho === 0

    if (carregandoNovoChamado || enviadaPorMim || distanciaDoFundo < 250) {
      rolarParaFinal()
    }
  }
)

defineExpose({ rolarParaFinal })
</script>

<style scoped>
.mensagens {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  /* Visual clássico texturizado de chat de suporte */
  background-color: #f4f6f9;
}
.mensagens-vazio {
  margin: auto;
  color: #64748b;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
}

/* Botão flutuante para descer com design moderno */
.btn-ir-para-fim {
  position: absolute;
  bottom: 20px;
  right: 24px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  color: #1a3c6e;
  z-index: 10;
  transition: transform 0.2s, background-color 0.2s;
}

.btn-ir-para-fim:hover {
  transform: scale(1.08);
  background-color: #f8fafc;
}

/* Spinner animado nativo */
.spinner-border {
  display: inline-block;
  width: 1.5rem;
  height: 1.5rem;
  vertical-align: text-bottom;
  border: 0.2em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border .75s linear infinite;
}
@keyframes spinner-border {
  to { transform: rotate(360deg); }
}
.spinner-sm {
  width: 1rem;
  height: 1rem;
  border-width: 0.15em;
}
</style>