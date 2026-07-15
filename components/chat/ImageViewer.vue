<template>
  <div class="image-viewer">
    <!-- Miniatura inteligente com Lazy Loading para evitar lentidão no chat -->
    <img 
      :src="url" 
      alt="Imagem enviada" 
      class="miniatura" 
      loading="lazy"
      @click="abrirModal" 
    />
    
    <div class="acoes-imagem">
      <a :href="url" target="_blank" rel="noopener noreferrer" download class="link-download">
        ⬇️ Baixar imagem
      </a>
    </div>

    <!-- Modal em tela cheia -->
    <div 
      v-if="aberta" 
      class="modal-imagem" 
      role="dialog" 
      aria-modal="true"
      @click="fecharModal"
    >
      <img :src="url" alt="Imagem em tela cheia" @click.stop />
      
      <button 
        type="button"
        class="btn-fechar" 
        aria-label="Fechar visualização"
        @click.stop="fecharModal"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'

defineProps({
  url: { type: String, required: true }
})

const aberta = ref(false)

// Fecha o modal ao apertar a tecla ESC do teclado
function escHandler(e) {
  if (e.key === 'Escape') {
    fecharModal()
  }
}

function abrirModal() {
  aberta.value = true
  document.addEventListener('keydown', escHandler)
  // Bloqueia o scroll do chat ao fundo enquanto visualiza a imagem em tela cheia
  document.body.style.overflow = 'hidden'
}

function fecharModal() {
  aberta.value = false
  document.removeEventListener('keydown', escHandler)
  // Restaura o scroll do site
  document.body.style.overflow = ''
}

// Limpeza preventiva em caso de destruição do componente com o modal ainda aberto
onBeforeUnmount(() => {
  document.removeEventListener('keydown', escHandler)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.image-viewer {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 240px;
}
.miniatura {
  width: 100%;
  max-height: 180px;
  object-fit: cover; /* Recorta a imagem elegantemente na miniatura sem distorcer */
  border-radius: 6px;
  cursor: zoom-in;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: opacity 0.2s;
}
.miniatura:hover {
  opacity: 0.95;
}
.acoes-imagem {
  display: flex;
  justify-content: flex-start;
}
.link-download {
  font-size: 11px;
  color: #1a3c6e;
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}
.link-download:hover {
  text-decoration: underline;
}

.modal-imagem {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  /* Garante que fique por cima de tudo no sistema, incluindo cabeçalhos do layout */
  z-index: 9999; 
  cursor: zoom-out;
  animation: fadeIn 0.15s ease-out;
}
.modal-imagem img {
  max-width: 92vw;
  max-height: 92vh;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  user-select: none; /* Impede arrastar a imagem em tela cheia acidentalmente */
}
.btn-fechar {
  position: absolute;
  top: 20px;
  right: 24px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #fff;
  font-size: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s;
}
.btn-fechar:hover {
  background: rgba(255, 255, 255, 0.3);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>