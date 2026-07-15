<template>
  <div class="audio-recorder">
    <!-- Estado normal: só o botão de microfone -->
    <button
      v-if="!gravando"
      type="button"
      class="btn-mic"
      title="Gravar áudio"
      @click="iniciarGravacao"
    >
      🎙️
    </button>

    <!-- Estado gravando: mostra o tempo e os botões de cancelar/enviar -->
    <div v-else class="gravando-barra">
      <span class="ponto-vermelho"></span>
      <span class="tempo">{{ tempoFormatado }}</span>
      <button type="button" class="btn-cancelar-gravacao" title="Cancelar" @click="cancelarGravacao">✕</button>
      <button type="button" class="btn-enviar-gravacao" title="Enviar áudio" @click="pararEEnviar">✔</button>
    </div>

    <p v-if="erro" class="erro-microfone">{{ erro }}</p>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'

const emit = defineEmits(['gravado'])

const gravando = ref(false)
const erro = ref('')
const tempoSegundos = ref(0)
const tempoFormatado = ref('00:00')

let mediaRecorder = null
let pedacos = []
let streamAtual = null
let intervaloTempo = null
let deveEnviar = false // Flag de controle de fluxo seguro para o evento onstop

function atualizarTempo() {
  tempoSegundos.value++
  const minutos = String(Math.floor(tempoSegundos.value / 60)).padStart(2, '0')
  const segundos = String(tempoSegundos.value % 60).padStart(2, '0')
  tempoFormatado.value = `${minutos}:${segundos}`
}

async function iniciarGravacao() {
  erro.value = ''
  pedacos = []
  deveEnviar = false

  try {
    streamAtual = await navigator.mediaDevices.getUserMedia({ audio: true })
    
    // ⚡ SUPORTE AO SAFARI (iOS/macOS): Detecta qual codec de áudio é nativamente aceito pelo dispositivo
    let options = { mimeType: 'audio/webm' }
    if (!MediaRecorder.isTypeSupported('audio/webm')) {
      if (MediaRecorder.isTypeSupported('audio/ogg')) {
        options = { mimeType: 'audio/ogg' }
      } else {
        options = { mimeType: 'audio/mp4' } // Fallback para Safari/Apple devices
      }
    }

    mediaRecorder = new MediaRecorder(streamAtual, options)

    // ⚡ FLUXO CENTRALIZADO: Ouvintes configurados na montagem do fluxo
    mediaRecorder.ondataavailable = (evento) => {
      if (evento.data && evento.data.size > 0) {
        pedacos.push(evento.data)
      }
    }

    mediaRecorder.onstop = () => {
      if (deveEnviar && pedacos.length > 0) {
        // Usa o mimeType dinâmico suportado pelo dispositivo
        const mimeType = mediaRecorder.mimeType || 'audio/webm'
        const ext = mimeType.split(';')[0].split('/')[1] || 'webm'
        
        const blob = new Blob(pedacos, { type: mimeType })
        const arquivo = new File([blob], `audio-${Date.now()}.${ext}`, { type: mimeType })
        
        emit('gravado', arquivo)
      }
      // Limpa os recursos sempre ao parar, independente de ter enviado ou descartado
      encerrarStream()
    }

    mediaRecorder.start(250) // Captura em blocos curtos e constantes de 250ms (mais estável)
    
    gravando.value = true
    tempoSegundos.value = 0
    tempoFormatado.value = '00:00'
    intervaloTempo = setInterval(atualizarTempo, 1000)
  } catch (err) {
    console.error('Erro ao acessar microfone:', err)
    erro.value = 'Não foi possível acessar o microfone. Verifique a permissão do seu navegador.'
  }
}

function encerrarStream() {
  if (streamAtual) {
    streamAtual.getTracks().forEach(track => track.stop())
    streamAtual = null
  }
  if (intervaloTempo) {
    clearInterval(intervaloTempo)
    intervaloTempo = null
  }
  gravando.value = false
}

function cancelarGravacao() {
  deveEnviar = false
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  } else {
    encerrarStream()
  }
}

function pararEEnviar() {
  if (!mediaRecorder || mediaRecorder.state === 'inactive') return
  deveEnviar = true
  mediaRecorder.stop()
}

// Limpeza de recursos rigorosa ao destruir o componente para evitar a luz de "microfone ativo" no navegador
onBeforeUnmount(() => {
  deveEnviar = false
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
  encerrarStream()
})
</script>

<style scoped>
.audio-recorder {
  display: flex;
  align-items: center;
}
.btn-mic {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  transition: background-color 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}
.btn-mic:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.gravando-barra {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fdecea;
  padding: 6px 14px;
  border-radius: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.ponto-vermelho {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c0392b;
  animation: piscar 1.2s infinite;
}
@keyframes piscar {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(0.9); }
}
.tempo {
  font-size: 13px;
  color: #c0392b;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.btn-cancelar-gravacao,
.btn-enviar-gravacao {
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s;
}
.btn-cancelar-gravacao:hover,
.btn-enviar-gravacao:hover {
  transform: scale(1.1);
}
.btn-cancelar-gravacao {
  background: #eaeaea;
  color: #444;
}
.btn-enviar-gravacao {
  background: #27ae60;
  color: #fff;
}

.erro-microfone {
  font-size: 11px;
  color: #c0392b;
  margin: 0 0 0 8px;
  font-weight: 500;
}
</style>