<template>
  <div class="image-viewer">
    <img :src="url" alt="Imagem enviada" class="miniatura" @click="aberta = true" />
    <a :href="url" download class="link-download">⬇️ Baixar imagem</a>

    <!-- Modal em tela cheia, abre ao clicar na miniatura -->
    <div v-if="aberta" class="modal-imagem" @click="aberta = false">
      <img :src="url" alt="Imagem em tela cheia" />
      <button class="btn-fechar" @click.stop="aberta = false">✕</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  url: { type: String, required: true }
})

const aberta = ref(false)
</script>

<style scoped>
.image-viewer {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.miniatura {
  max-width: 240px;
  border-radius: 6px;
  cursor: zoom-in;
}
.link-download {
  font-size: 12px;
  color: #1a3c6e;
  text-decoration: none;
}
.link-download:hover {
  text-decoration: underline;
}

.modal-imagem {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  cursor: zoom-out;
}
.modal-imagem img {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 6px;
}
.btn-fechar {
  position: absolute;
  top: 20px;
  right: 24px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #fff;
  font-size: 20px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
}
</style>