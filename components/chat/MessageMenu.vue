<template>
  <div ref="menuRef" class="menu-wrapper">
    <!-- Removido o .stop para permitir que cliques em outros menus fechem os anteriores -->
    <button 
      type="button" 
      class="btn-menu-msg" 
      aria-label="Opções da mensagem"
      @click="alternarMenu"
    >
      ⋮
    </button>

    <div 
      v-if="aberto" 
      class="menu-mensagem" 
      :class="{ inverte: alinhamento === 'esquerda' }"
    >
      <button type="button" @click="disparar('responder')">↩ Responder</button>
      <button type="button" @click="disparar('encaminhar')">↪ Encaminhar</button>
      <button v-if="podeEditar" type="button" @click="disparar('editar')">✏ Editar</button>
      <button v-if="podeApagar" type="button" class="btn-perigo" @click="disparar('apagar')">🗑 Apagar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

defineProps({
  podeEditar: { type: Boolean, default: false },
  podeApagar: { type: Boolean, default: false },
  // 'direita' (padrão) ou 'esquerda' — controla para que lado o menu abre
  alinhamento: { type: String, default: 'direita' }
})

const emit = defineEmits(['responder', 'encaminhar', 'editar', 'apagar'])

const aberto = ref(false)
const menuRef = ref(null) // Referência ao wrapper do menu para checar cliques

function alternarMenu() {
  aberto.value = !aberto.value
}

function disparar(nomeEvento) {
  emit(nomeEvento)
  aberto.value = false
}

// ⚡ LEVE E INTELIGENTE: Só roda a lógica de fechamento se este menu específico estiver aberto
function fecharAoClicarFora(event) {
  if (!aberto.value) return // Evita processamento desnecessário de menus fechados!
  
  // Se o clique foi fora deste componente específico, fecha ele
  if (menuRef.value && !menuRef.value.contains(event.target)) {
    aberto.value = false
  }
}

onMounted(() => {
  // Captura o clique na fase de captura para garantir consistência
  document.addEventListener('click', fecharAoClicarFora, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', fecharAoClicarFora, true)
})
</script>

<style scoped>
.menu-wrapper {
  position: relative;
  display: inline-block;
}
.btn-menu-msg {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px 8px;
  color: #666;
  line-height: 1;
  border-radius: 50%;
  transition: background-color 0.15s;
}
.btn-menu-msg:hover {
  background: rgba(0, 0, 0, 0.08);
}
.menu-mensagem {
  position: absolute;
  top: 26px;
  right: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  font-size: 13px;
  white-space: nowrap;
  z-index: 50;
  animation: fadeIn 0.1s ease-out;
}
.menu-mensagem.inverte {
  right: auto;
  left: 0;
}
.menu-mensagem button {
  background: none;
  border: none;
  text-align: left;
  padding: 8px 16px;
  cursor: pointer;
  color: #333;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.1s;
}
.menu-mensagem button:hover {
  background: #f5f7fb;
}
.menu-mensagem button.btn-perigo {
  color: #c0392b;
}
.menu-mensagem button.btn-perigo:hover {
  background: #fdecea;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>