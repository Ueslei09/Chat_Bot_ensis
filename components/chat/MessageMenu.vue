<template>
  <div class="chat-context-menu">
    <!-- Barra de Reações Rápidas (Estilo WhatsApp) -->
    <div class="reaction-bar">
      <span class="reaction-emoji" @click="$emit('reagir', '👍')">👍</span>
      <span class="reaction-emoji" @click="$emit('reagir', '❤️')">❤️</span>
      <span class="reaction-emoji" @click="$emit('reagir', '😂')">😂</span>
      <span class="reaction-emoji" @click="$emit('reagir', '😮')">😮</span>
      <span class="reaction-emoji" @click="$emit('reagir', '😢')">😢</span>
      <span class="reaction-emoji" @click="$emit('reagir', '🙏')">🙏</span>
      <span class="reaction-add-btn">+</span>
    </div>

    <!-- Lista de Ações -->
    <div class="context-menu-list">
      <button class="context-menu-item" @click="$emit('responder')">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>
        </svg>
        Responder
      </button>

      <button class="context-menu-item" @click="$emit('copiar')">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
        </svg>
        Copiar
      </button>

      <button class="context-menu-item" @click="$emit('encaminhar')">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M14 8.586V4L22 12l-8 8v-4.586c-7.07 0-11.314 2.172-14 7.07 1.414-7.07 5.656-11.314 14-11.484z"/>
        </svg>
        Encaminhar
      </button>

      <button v-if="podeEditar" class="context-menu-item" @click="$emit('editar')">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
        </svg>
        Editar
      </button>

      <div class="context-menu-divider"></div>

      <button v-if="podeApagar" class="context-menu-item danger" @click="$emit('apagar')">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
        </svg>
        Apagar
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  podeEditar: { type: Boolean, default: false },
  podeApagar: { type: Boolean, default: false },
  alinhamento: { type: String, default: 'esquerda' }
})

defineEmits(['responder', 'copiar', 'encaminhar', 'editar', 'apagar', 'reagir'])
</script>

<style scoped>
/* Container principal do menu de contexto (Estilo Escuro) */
.chat-context-menu {
  background-color: #181818;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  width: 220px;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.4);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow: hidden;
}

/* Barra de Reações Rápidas (Topo) */
.reaction-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 6px;
  border-bottom: 1px solid #2a2a2a;
  background-color: #1f1f1f;
}

.reaction-emoji {
  font-size: 18px;
  cursor: pointer;
  transition: transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.reaction-emoji:hover {
  transform: scale(1.35); /* Efeito de zoom clássico */
}

.reaction-add-btn {
  font-size: 16px;
  color: #8c8c8c;
  cursor: pointer;
  user-select: none;
}

/* Lista de Opções */
.context-menu-list {
  display: flex;
  flex-direction: column;
  padding: 4px 0;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 14px;
  color: #e3e3e3;
  font-size: 13.5px;
  cursor: pointer;
  background: none;
  border: none;
  text-align: left;
  width: 100%;
  transition: background-color 0.15s ease;
}

.context-menu-item:hover {
  background-color: #2a2a2a;
}

/* Ícones nativos SVG */
.context-menu-item svg {
  color: #a0a0a0;
  flex-shrink: 0;
}

/* Divisor de seções */
.context-menu-divider {
  height: 1px;
  background-color: #2a2a2a;
  margin: 4px 0;
}

/* Item de perigo (Apagar) */
.context-menu-item.danger {
  color: #ff5252;
}
.context-menu-item.danger svg {
  color: #ff5252;
}
</style>