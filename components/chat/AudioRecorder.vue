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
import { useAudioRecorder } from '@/Composables/useAudioRecorder'

const emit = defineEmits(['gravado'])

const {
  gravando,
  erro,
  tempoFormatado,
  iniciarGravacao,
  cancelarGravacao,
  pararEEnviar
} = useAudioRecorder(emit)
</script>

<style scoped>
.audio-recorder {
  display: flex;
  align-items: center;
  position: relative;
  box-sizing: border-box;
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
  flex-shrink: 0;
}

.btn-mic:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.gravando-barra {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fdecea;
  padding: 6px 12px;
  border-radius: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  max-width: 100%;
}

@media (min-width: 768px) {
  .gravando-barra {
    padding: 6px 14px;
    gap: 10px;
  }
}

.ponto-vermelho {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c0392b;
  animation: piscar 1.2s infinite;
  flex-shrink: 0;
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
  white-space: nowrap;
}

.btn-cancelar-gravacao,
.btn-enviar-gravacao {
  border: none;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s;
  flex-shrink: 0;
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
  word-break: break-word;
}
</style>