// src/composables/useAudioPlayer.js
import { ref, computed, onBeforeUnmount } from 'vue'

export function useAudioPlayer() {
  const audioRef = ref(null)
  const barraProgresso = ref(null)

  const estaTocando = ref(false)
  const tempoAtual = ref(0)
  const duracao = ref(0)
  const arrastando = ref(false)

  const progressoPercentual = computed(() => {
    if (!duracao.value) return 0
    return (tempoAtual.value / duracao.value) * 100
  })

  const alternarReproducao = () => {
    if (!audioRef.value) return
    if (estaTocando.value) {
      audioRef.value.pause()
      estaTocando.value = false
    } else {
      audioRef.value.play().catch(err => {
        console.warn("Erro ao reproduzir áudio:", err)
      })
      estaTocando.value = true
    }
  }

  const aoAtualizarTempo = () => {
    if (!audioRef.value || arrastando.value) return
    tempoAtual.value = audioRef.value.currentTime
  }

  const aoCarregarMetadados = () => {
    if (!audioRef.value) return
    duracao.value = audioRef.value.duration || 0
  }

  const aoFinalizar = () => {
    estaTocando.value = false
    tempoAtual.value = 0
  }

  const formatarTempo = (segundos) => {
    if (isNaN(segundos) || segundos === Infinity) return '00:00'
    const min = String(Math.floor(segundos / 60)).padStart(2, '0')
    const seg = String(Math.floor(segundos % 60)).padStart(2, '0')
    return `${min}:${seg}`
  }

  const buscarNovoTempo = (event) => {
    if (!audioRef.value || !barraProgresso.value || !duracao.value) return
    
    const rect = barraProgresso.value.getBoundingClientRect()
    const cliqueX = event.clientX - rect.left
    const larguraTotal = rect.width
    
    const porcentagem = Math.max(0, Math.min(1, cliqueX / larguraTotal))
    tempoAtual.value = porcentagem * duracao.value
    
    if (!arrastando.value) {
      audioRef.value.currentTime = tempoAtual.value
    }
  }

  const iniciarArraste = (event) => {
    arrastando.value = true
    buscarNovoTempo(event)
    
    window.addEventListener('mousemove', buscarNovoTempo)
    window.addEventListener('mouseup', finalizarArraste)
  }

  const finalizarArraste = () => {
    if (arrastando.value) {
      if (audioRef.value) {
        audioRef.value.currentTime = tempoAtual.value
      }
      arrastando.value = false
      window.removeEventListener('mousemove', buscarNovoTempo)
      window.removeEventListener('mouseup', finalizarArraste)
    }
  }

  onBeforeUnmount(() => {
    window.removeEventListener('mousemove', buscarNovoTempo)
    window.removeEventListener('mouseup', finalizarArraste)
  })

  return {
    audioRef,
    barraProgresso,
    estaTocando,
    tempoAtual,
    duracao,
    progressoPercentual,
    alternarReproducao,
    aoAtualizarTempo,
    aoCarregarMetadados,
    aoFinalizar,
    formatarTempo,
    iniciarArraste
  }
}