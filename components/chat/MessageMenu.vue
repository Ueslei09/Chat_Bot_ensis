<template>
  <div class="menu-wrapper">
    <button class="btn-menu-msg" @click.stop="aberto = !aberto">⋮</button>

    <div v-if="aberto" class="menu-mensagem" :class="{ inverte: alinhamento === 'esquerda' }" @click.stop>
      <button @click="disparar('responder')">↩ Responder</button>
      <button @click="disparar('encaminhar')">↪ Encaminhar</button>
      <button v-if="podeEditar" @click="disparar('editar')">✏ Editar</button>
      <button v-if="podeApagar" @click="disparar('apagar')">🗑 Apagar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

defineProps({
  podeEditar: { type: Boolean, default: false },
  podeApagar: { type: Boolean, default: false },
  // 'direita' (padrão) ou 'esquerda' — controla pra que lado o menu abre
  alinhamento: { type: String, default: 'direita' }
})

// Eventos: 'responder', 'encaminhar', 'editar', 'apagar'
const emit = defineEmits(['responder', 'encaminhar', 'editar', 'apagar'])

const aberto = ref(false)

function disparar(nomeEvento) {
  emit(nomeEvento)
  aberto.value = false
}

// Fecha o menu se clicar em qualquer lugar fora dele
function fecharAoClicarFora() {
  aberto.value = false
}

onMounted(() => {
  document.addEventListener('click', fecharAoClicarFora)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', fecharAoClicarFora)
})
</script>

<style scoped>
.menu-wrapper {
  position: relative;
}
.btn-menu-msg {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px 6px;
  color: #666;
  line-height: 1;
}
.btn-menu-msg:hover {
  background: rgba(0, 0, 0, 0.06);
  border-radius: 4px;
}
.menu-mensagem {
  position: absolute;
  top: 24px;
  right: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  font-size: 12px;
  white-space: nowrap;
  z-index: 20;
}
.menu-mensagem.inverte {
  right: auto;
  left: 0;
}
.menu-mensagem button {
  background: none;
  border: none;
  text-align: left;
  padding: 6px 12px;
  cursor: pointer;
}
.menu-mensagem button:hover {
  background: #f5f5f5;
}
</style>