<template>
  <!-- Mensagens automáticas do sistema -->
  <div v-if="mensagem.autor_tipo === 'SISTEMA'" class="faixa-sistema">
    {{ mensagem.conteudo }} — {{ formatarHora(mensagem.criada_em) }}
  </div>

  <!-- Mensagens comuns (Cliente / Atendente) -->
  <div v-else class="bolha-wrapper" :class="[mensagem.autor_tipo === 'CLIENTE' ? 'recebida' : 'enviada']">
    <div class="bolha">
      <!-- Selo de Encaminhada -->
      <div v-if="mensagem.encaminhada_de" class="selo-encaminhada">↪️ Encaminhada</div>

      <!-- Preview de resposta com tratamento de texto e mídias -->
      <ReplyPreview v-if="mensagem.resposta_a" modo="citacao" :texto="textoMensagemOriginal" />

      <!-- Renderização dinâmica por tipo de arquivo -->
      <p v-if="mensagem.tipo === 'TEXTO'" class="conteudo-texto">{{ mensagem.conteudo }}</p>

      <ImageViewer v-else-if="mensagem.tipo === 'IMAGEM'" :url="urlArquivo(mensagem.conteudo)" />

      <AudioPlayer v-else-if="mensagem.tipo === 'AUDIO'" :url="urlArquivo(mensagem.conteudo)" />

      <PdfViewer v-else-if="mensagem.tipo === 'PDF'" :url="urlArquivo(mensagem.conteudo)" />

      <!-- Rodapé da bolha com hora e status de edição -->
      <div class="rodape-bolha">
        <span v-if="mensagem.editada_em" class="editado-label">editado</span>
        <span class="hora">{{ formatarHora(mensagem.criada_em) }}</span>
      </div>
    </div>

    <!-- Menu contextual de opções de mensagem com permissões inteligentes -->
    <MessageMenu
      :pode-editar="podeEditar"
      :pode-apagar="podeApagar"
      :alinhamento="mensagem.autor_tipo === 'CLIENTE' ? 'direita' : 'esquerda'"
      @responder="$emit('responder', mensagem)"
      @encaminhar="$emit('encaminhar', mensagem)"
      @editar="$emit('editar', message || mensagem)"
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
  souAdmin: { type: Boolean, default: false },
  // Controla se o atendente logado recebeu permissão administrativa de remoção
  podeApagarGeral: { type: Boolean, default: false }
})

defineEmits(['responder', 'encaminhar', 'editar', 'apagar'])

// Apenas o autor pode editar suas próprias mensagens de texto
const podeEditar = computed(() => props.mensagem.tipo === 'TEXTO' && props.souAutor)

// Admins sempre apagam, usuários comuns apagam apenas se a permissão foi concedida pelo ADM
const podeApagar = computed(() => props.souAdmin || props.podeApagarGeral)

// ⚡ FORMATADOR INTELIGENTE DE CITAÇÃO (UX & Escalabilidade):
// Se a mensagem original for uma mídia, avisa visualmente o operador!
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

// ⚡ FORMATADOR SEGURO DE DATA:
// Impede NaN:NaN e falhas de runtime na tela do usuário
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
  align-items: center; /* Menu centralizado na altura da mensagem, igual ao WhatsApp */
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
  background: #fff;
  min-width: 100px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.08);
}
.bolha-wrapper.enviada .bolha {
  background: #d9fdd3;
  border-top-right-radius: 0; /* Charme estético clássico de WhatsApp */
}
.bolha-wrapper.recebida .bolha {
  border-top-left-radius: 0;
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
.conteudo-texto {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 14px;
  line-height: 1.42;
  color: #111;
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
</style>