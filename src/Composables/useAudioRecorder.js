// src/composables/useAudioRecorder.js
import { ref, onBeforeUnmount } from 'vue'

export function useAudioRecorder(emit) {
  const gravando = ref(false)
  const erro = ref('')
  const tempoSegundos = ref(0)
  const tempoFormatado = ref('00:00')

  let mediaRecorder = null
  let pedacos = []
  let streamAtual = null
  let intervaloTempo = null
  let deveEnviar = false

  const atualizarTempo = () => {
    tempoSegundos.value++
    const minutos = String(Math.floor(tempoSegundos.value / 60)).padStart(2, '0')
    const segundos = String(tempoSegundos.value % 60).padStart(2, '0')
    tempoFormatado.value = `${minutos}:${segundos}`
  }

  const iniciarGravacao = async () => {
    erro.value = ''
    pedacos = []
    deveEnviar = false

    try {
      streamAtual = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      let options = { mimeType: 'audio/webm' }
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/ogg')) {
          options = { mimeType: 'audio/ogg' }
        } else {
          options = { mimeType: 'audio/mp4' }
        }
      }

      mediaRecorder = new MediaRecorder(streamAtual, options)

      mediaRecorder.ondataavailable = (evento) => {
        if (evento.data && evento.data.size > 0) {
          pedacos.push(evento.data)
        }
      }

      mediaRecorder.onstop = () => {
        if (deveEnviar && pedacos.length > 0) {
          const mimeType = mediaRecorder.mimeType || 'audio/webm'
          const ext = mimeType.split(';')[0].split('/')[1] || 'webm'
          
          const blob = new Blob(pedacos, { type: mimeType })
          const arquivo = new File([blob], `audio-${Date.now()}.${ext}`, { type: mimeType })
          
          emit('gravado', arquivo)
        }
        encerrarStream()
      }

      mediaRecorder.start(250)
      
      gravando.value = true
      tempoSegundos.value = 0
      tempoFormatado.value = '00:00'
      intervaloTempo = setInterval(atualizarTempo, 1000)
    } catch (err) {
      console.error('Erro ao acessar microfone:', err)
      erro.value = 'Não foi possível acessar o microfone. Verifique a permissão do seu navegador.'
    }
  }

  const encerrarStream = () => {
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

  const cancelarGravacao = () => {
    deveEnviar = false
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
    } else {
      encerrarStream()
    }
  }

  const pararEEnviar = () => {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') return
    deveEnviar = true
    mediaRecorder.stop()
  }

  onBeforeUnmount(() => {
    deveEnviar = false
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
    }
    encerrarStream()
  })

  return {
    gravando,
    erro,
    tempoFormatado,
    iniciarGravacao,
    cancelarGravacao,
    pararEEnviar
  }
}