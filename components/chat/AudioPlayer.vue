<template>
  <div class="audio-player">
    <audio controls :src="url"></audio>
    <a :href="url" download class="link-download">⬇️ Baixar áudio</a>
  </div>
</template>

<script setup>
defineProps({
  url: { type: String, required: true }
})
</script>

<style scoped>
.audio-player {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.audio-player audio {
  max-width: 240px;
}
.link-download {
  font-size: 12px;
  color: #1a3c6e;
  text-decoration: none;
}
.link-download:hover {
  text-decoration: underline;
}
</style>