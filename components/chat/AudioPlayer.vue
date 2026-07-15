<template>
  <div class="audio-container">
    <div class="audio-player-custom">
      <!-- Botão Play / Pause -->
      <button 
        type="button" 
        class="btn-play-pause" 
        :aria-label="estaTocando ? 'Pausar áudio' : 'Tocar áudio'"
        @click="alternarReproducao"
      >
        <i class="bi" :class="estaTocando ? 'bi-pause-fill' : 'bi-play-fill'"></i>
      </button>

      <!-- Barra de Progresso Interativa -->
      <div class="progresso-wrapper" @mousedown="iniciarArraste">
        <div class="barra-total" ref="barraProgresso">
          <div class="barra-atual" :style="{ width: `${progressoPercentual}%` }"></div>
          <div class="ponto-arraste" :style="{ left: `${progressoPercentual}%` }"></div>
        </div>
        
        <!-- Marcadores de Tempo -->
        <div class="tempos">
          <span class="tempo-atual">{{ formatarTempo(tempoAtual) }}</span>
          <span class="tempo-total">{{ formatarTempo(duracao) }}</span>
        </div>
      </div>
    </div>

    <!-- Elemento de Áudio Oculto -->
    <audio 
      ref="audioRef" 
      :src="url" 
      preload="metadata"
      @timeupdate="aoAtualizarTempo"
      @loadedmetadata="aoCarregarMetadados"
      @ended="aoFinalizar"
    ></audio>

    <!-- Link de Download Limpo -->
    <a :href="url" target="_blank" download class="link-download">
      ⬇️ Baixar áudio
    </a>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'

const props = defineProps({
  url: { type: String, required: true }
})

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

function alternarReproducao() {
  if (!audioRef.value) return
  if (estaTocando.value) {
    audioRef.value.pause()
    estaTocando.value = false
  } else {
    // Tenta reproduzir o áudio tratando possíveis bloqueios de autoplay do navegador
    audioRef.value.play().catch(err => {
      console.warn("Erro ao reproduzir áudio:", err)
    })
    estaTocando.value = true
  }
}

function aoAtualizarTempo() {
  if (!audioRef.value || arrastando.value) return
  tempoAtual.value = audioRef.value.currentTime
}

function aoCarregarMetadados() {
  if (!audioRef.value) return
  duracao.value = audioRef.value.duration || 0
}

function aoFinalizar() {
  estaTocando.value = false
  tempoAtual.value = 0
}

function formatarTempo(segundos) {
  if (isNaN(segundos) || segundos === Infinity) return '00:00'
  const min = String(Math.floor(segundos / 60)).padStart(2, '0')
  const seg = String(Math.floor(segundos % 60)).padStart(2, '0')
  return `${min}:${seg}`
}

// ------------------------------------------------------------
// LÓGICA DE CONTROLE DE ARRASTE (Scrubbing)
// ------------------------------------------------------------
function iniciarArraste(event) {
  arrastando.value = true
  buscarNovoTempo(event)
  
  window.addEventListener('mousemove', buscarNovoTempo)
  window.addEventListener('mouseup', finalizarArraste)
}

function buscarNovoTempo(event) {
  if (!audioRef.value || !barraProgresso.value || !duracao.value) return
  
  const rect = barraProgresso.value.getBoundingClientRect()
  const cliqueX = event.clientX - rect.left
  const larguraTotal = rect.width
  
  // Limita a porcentagem entre 0% e 100%
  const porcentagem = Math.max(0, Math.min(1, cliqueX / larguraTotal))
  tempoAtual.value = porcentagem * duracao.value
  
  if (!arrastando.value) {
    audioRef.value.currentTime = tempoAtual.value
  }
}

function finalizarArraste(event) {
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
  // Limpeza de listeners globais de segurança
  window.removeEventListener('mousemove', buscarNovoTempo)
  window.removeEventListener('mouseup', finalizarArraste)
})
</script>

<style scoped>
.audio-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 240px;
}

.audio-player-custom {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f1f5f9;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.btn-play-pause {
  background: #1a3c6e;
  border: none;
  color: #fff;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  flex-shrink: 0;
  transition: transform 0.1s, background-color 0.15s;
}
.btn-play-pause:hover {
  background-color: #11294a;
  transform: scale(1.05);
}

/* Barra de Progresso */
.progresso-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  padding: 4px 0;
}

.barra-total {
  position: relative;
  height: 4px;
  background: #cbd5e1;
  border-radius: 2px;
  width: 100%;
}

.barra-atual {
  height: 100%;
  background: #1a3c6e;
  border-radius: 2px;
  width: 0;
}

.ponto-arraste {
  position: absolute;
  top: 50%;
  width: 10px;
  height: 10px;
  background: #1a3c6e;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.15s;
}

.progresso-wrapper:hover .ponto-arraste {
  opacity: 1;
}

/* Tempos */
.tempos {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #64748b;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
}

.link-download {
  font-size: 11px;
  color: #1a3c6e;
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  padding-left: 4px;
}
.link-download:hover {
  text-decoration: underline;
}
</style>