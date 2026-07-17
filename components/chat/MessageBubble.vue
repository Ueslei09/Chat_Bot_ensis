<template>
  <!-- Mensagens automáticas do sistema -->
  <div v-if="mensagem.autor_tipo === 'SISTEMA'" class="faixa-sistema">
    {{ mensagem.conteudo }} — {{ formatarHora(mensagem.criada_em) }}
  </div>

  <!-- Mensagens comuns (Cliente / Atendente) -->
  <div v-else class="bolha-wrapper" :class="[mensagem.autor_tipo === 'CLIENTE' ? 'recebida' : 'enviada']">
    <div class="bolha">
      
      <!-- 🔽 Botão de Setinha com SVG Nativo (Substituído o <i> por <svg> que funciona sempre!) -->
      <button class="message-menu-btn" @click.stop="toggleMenu" title="Opções">
        <svg viewBox="0 0 24 24">
          <path d="M12 15.25a.74.74 0 0 1-.53-.22l-5-5a.75.75 0 0 1 1.06-1.06L12 13.44l4.47-4.47a.75.75 0 1 1 1.06 1.06l-5 5a.74.74 0 0 1-.53.22z"/>
        </svg>
      </button>

      <!-- Selo de Encaminhada -->
      <div v-if="mensagem.encaminhada_de" class="selo-encaminhada">↪️ Encaminhada</div>

      <!-- Preview de resposta com tratamento de texto e mídias -->
      <ReplyPreview v-if="mensagem.resposta_a" modo="citacao" :texto="textoMensagemOriginal" />

      <!-- 📦 Corpo envelopado para respeitar o padding de segurança do botão -->
      <div class="corpo-mensagem">
        <!-- Renderização dinâmica por tipo de arquivo -->
        <p v-if="mensagem.tipo === 'TEXTO'" class="conteudo-texto">{{ mensagem.conteudo }}</p>
        <ImageViewer v-else-if="mensagem.tipo === 'IMAGEM'" :url="urlArquivo(mensagem.conteudo)" />
        <AudioPlayer v-else-if="mensagem.tipo === 'AUDIO'" :url="urlArquivo(mensagem.conteudo)" />
        <PdfViewer v-else-if="mensagem.tipo === 'PDF'" :url="urlArquivo(mensagem.conteudo)" />
      </div>

      <!-- Container de Reação por Emoji -->
      <div v-if="reacao" class="emoji-reacao-container">
        {{ reacao }}
      </div>

      <!-- Rodapé da bolha com hora e status de edição -->
      <div class="rodape-bolha">
        <span v-if="mensagem.editada_em" class="editado-label">editado</span>
        <span class="hora">{{ formatarHora(mensagem.criada_em) }}</span>
      </div>
    </div>

    <!-- ⚡ Menu contextual flutuante -->
    <MessageMenu
      v-if="menuAberto"
      :pode-editar="podeEditar"
      :pode-apagar="podeApagar"
      :alinhamento="mensagem.autor_tipo === 'CLIENTE' ? 'direita' : 'esquerda'"
      class="menu-flutuante"
      @responder="emitirAcao('responder')"
      @encaminhar="emitirAcao('encaminhar')"
      @editar="emitirAcao('editar')"
      @apagar="emitirAcao('apagar')"
      @reagir="salvarReacao"
    />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
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
  souAdmin: { type: Boolean, default: false },
  podeApagarGeral: { type: Boolean, default: false }
})

const emit = defineEmits(['responder', 'encaminhar', 'editar', 'apagar', 'reagir'])

const reacao = ref('')
const menuAberto = ref(false)

function salvarReacao(emoji) {
  reacao.value = emoji
  menuAberto.value = false
}

function toggleMenu() {
  menuAberto.value = !menuAberto.value
}

function emitirAcao(evento) {
  menuAberto.value = false
  if (evento === 'apagar') {
    emit('apagar', props.mensagem.id)
  } else if (evento === 'editar') {
    emit('editar', props.mensagem)
  } else {
    emit(evento, props.mensagem)
  }
}

const fecharMenuExterno = () => {
  menuAberto.value = false
}

onMounted(() => {
  document.addEventListener('click', fecharMenuExterno)
})

onUnmounted(() => {
  document.removeEventListener('click', fecharMenuExterno)
})

const podeEditar = computed(() => props.mensagem.tipo === 'TEXTO' && props.souAutor)
const podeApagar = computed(() => props.souAdmin || props.podeApagarGeral)

const textoMensagemOriginal = computed(() => {
  const original = props.todasMensagens.find(m => m.id === props.mensagem.resposta_a)
  if (!original) return 'Mensagem original'
  
  if (original.tipo === 'IMAGEM') return '📷 Foto'
  if (original.tipo === 'AUDIO') return '🎵 Áudio'
  if (original.tipo === 'PDF') return '📄 Documento PDF'
  
  return original.conteudo.length > 60 
    ? original.conteudo.substring(0, 60).trim() + '...' 
    : original.conteudo
})

function formatarHora(dataString) {
  if (!dataString) return '--:--'
  try {
    const data = new Date(dataString)
    if (isNaN(data.getTime())) return '--:--'
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return '--:--'
  }
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
  margin: 8px auto;
  text-align: center;
  width: fit-content;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.bolha-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 65%;
  position: relative;
  margin-bottom: 4px;
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
  background: #ffffff;
  min-width: 120px;
  max-width: 100%;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  position: relative; /* Crucial para prender o botão no canto superior direito */
}

.bolha-wrapper.enviada .bolha {
  background: #d9fdd3;
  border-top-right-radius: 0;
}

.bolha-wrapper.recebida .bolha {
  border-top-left-radius: 0;
}

/* 🌟 BOTÃO DA SETINHA (Elegante, estilo WhatsApp) */
.message-menu-btn {
  position: absolute !important;
  top: 4px !important;
  right: 6px !important;
  background: transparent !important;
  border: none !important;
  border-radius: 50% !important;
  width: 24px !important;
  height: 24px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  outline: none !important;
  box-shadow: none !important;
  
  /* Começa invisível e surge suave no hover da bolha */
  opacity: 0 !important; 
  transition: opacity 0.15s ease, background-color 0.15s ease !important;
  z-index: 10 !important;
}

/* Mostra o botão ao passar o mouse na bolha */
.bolha:hover .message-menu-btn {
  opacity: 1 !important;
}

/* Efeito de hover circular sutil */
.message-menu-btn:hover {
  background-color: rgba(0, 0, 0, 0.06) !important;
}

/* Estilo do SVG interno */
.message-menu-btn svg {
  fill: #667781 !important;
  width: 16px !important;
  height: 16px !important;
  display: block !important;
  transition: fill 0.15s ease;
}

.message-menu-btn:hover svg {
  fill: #111b21 !important;
}

/* Container do corpo que respeita o espaço para o botão não sobrepor textos */
.corpo-mensagem {
  padding-right: 18px !important;
}

.conteudo-texto {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 14px;
  line-height: 1.42;
  color: #111;
}

/* Menu flutuante */
.menu-flutuante {
  position: absolute;
  top: 100%;
  z-index: 100;
  margin-top: 4px;
}

.bolha-wrapper.enviada .menu-flutuante {
  right: 0;
}

.bolha-wrapper.recebida .menu-flutuante {
  left: 0;
}

.selo-encaminhada {
  font-size: 10px;
  color: #777;
  margin-bottom: 4px;
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 2px;
}

.rodape-bolha {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 4px;
}

.editado-label {
  font-size: 9px;
  color: #888;
  font-style: italic;
}

.hora {
  font-size: 10px;
  color: #777;
}

/* Emoji de reação fixado no rodapé da bolha */
.emoji-reacao-container {
  position: absolute;
  bottom: -10px;
  right: 12px;
  background: #1f1f1f;
  border: 1px solid #2a2a2a;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  z-index: 5;
  user-select: none;
  color: white;
}

.bolha-wrapper.enviada .emoji-reacao-container {
  right: auto;
  left: 12px;
}
</style>