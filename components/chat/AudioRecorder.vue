<template>
  <div class="audio-recorder">
    <!-- Estado normal: só o botão de microfone -->
    <button
      v-if="!gravando"
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
      <button class="btn-cancelar-gravacao" title="Cancelar" @click="cancelarGravacao">✕</button>
      <button class="btn-enviar-gravacao" title="Enviar áudio" @click="pararEEnviar">✔</button>
    </div>

    <p v-if="erro" class="erro-microfone">{{ erro }}</p>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'

// Emite 'gravado' com um objeto File (mesmo formato que o input de
// upload de arquivo já usa), pra reaproveitar o mesmo fluxo de envio.
const emit = defineEmits(['gravado'])

const gravando = ref(false)
const erro = ref('')
const tempoSegundos = ref(0)

let mediaRecorder = null
let pedacos = []
let streamAtual = null
let intervaloTempo = null

const tempoFormatado = ref('00:00')

function atualizarTempo() {
  tempoSegundos.value++
  const minutos = String(Math.floor(tempoSegundos.value / 60)).padStart(2, '0')
  const segundos = String(tempoSegundos.value % 60).padStart(2, '0')
  tempoFormatado.value = `${minutos}:${segundos}`
}

async function iniciarGravacao() {
  erro.value = ''
  try {
    streamAtual = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(streamAtual)
    pedacos = []

    mediaRecorder.ondataavailable = (evento) => {
      if (evento.data.size > 0) pedacos.push(evento.data)
    }

    mediaRecorder.start()
    gravando.value = true
    tempoSegundos.value = 0
    tempoFormatado.value = '00:00'
    intervaloTempo = setInterval(atualizarTempo, 1000)
  } catch (err) {
    console.error('Erro ao acessar microfone:', err)
    erro.value = 'Não foi possível acessar o microfone. Verifique a permissão do navegador.'
  }
}

function encerrarStream() {
  if (streamAtual) {
    streamAtual.getTracks().forEach(track => track.stop())
    streamAtual = null
  }
  clearInterval(intervaloTempo)
  gravando.value = false
}

function cancelarGravacao() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
  pedacos = []
  encerrarStream()
}

function pararEEnviar() {
  if (!mediaRecorder) return

  mediaRecorder.onstop = () => {
    const blob = new Blob(pedacos, { type: 'audio/webm' })
    // Transforma o Blob num File, com nome único, pra reaproveitar
    // o mesmo fluxo de upload que já existe pra imagem/PDF
    const arquivo = new File([blob], `audio-${Date.now()}.webm`, { type: 'audio/webm' })
    emit('gravado', arquivo)
    encerrarStream()
  }

  mediaRecorder.stop()
}

// Garante que o microfone é liberado se o componente for destruído no meio da gravação
onBeforeUnmount(() => {
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
}

.gravando-barra {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fdecea;
  padding: 6px 12px;
  border-radius: 20px;
}
.ponto-vermelho {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c0392b;
  animation: piscar 1s infinite;
}
@keyframes piscar {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.tempo {
  font-size: 13px;
  color: #c0392b;
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
}
.btn-cancelar-gravacao {
  background: #eee;
  color: #666;
}
.btn-enviar-gravacao {
  background: #27ae60;
  color: #fff;
}

.erro-microfone {
  font-size: 11px;
  color: #c0392b;
  margin: 4px 0 0;
}
</style>