<template>
  <div class="area-mensagens" ref="scrollContainer" @scroll="lidarComScroll">
    
    <!-- 🔄 Botão "Carregar" no topo da lista -->
    <div class="container-carregar-historico">
      <button 
        class="btn-carregar-historico" 
        @click="$emit('carregar-mais')"
        type="button"
      >
        <svg class="icone-carregar" viewBox="0 0 24 24" width="16" height="16">
          <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" fill="currentColor"/>
        </svg>
        ( CARREGAR ANTERIORES )
      </button>
    </div>

    <!-- Lista de Mensagens com Divisor de Datas -->
    <div 
      v-for="(msg, index) in mensagens" 
      :key="msg.id" 
      class="wrapper-mensagem-item"
    >
      <!-- 📅 Separador de Data Inteligente (Ontem, Hoje, ou Data do Dia) -->
      <div v-if="deveMostrarSeparador(index)" class="separador-data-container">
        <span class="separador-data-texto">
          {{ obterDataFormatada(msg.criada_em) }}
        </span>
      </div>

      <MessageBubble 
        :mensagem="msg" 
        :todas-mensagens="mensagens"
        :sou-autor="msg.autor_id === meuId"
        :sou-admin="souAdmin"
        @responder="$emit('responder', msg)"
        @encaminhar="$emit('encaminhar', msg)"
        @editar="$emit('editar', msg)"
        @apagar="$emit('apagar', msg.id)"
        @reagir="(emoji) => $emit('reagir', { mensagemId: msg.id, emoji })"
      />
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import MessageBubble from './MessageBubble.vue'

const props = defineProps({
  mensagens: { type: Array, default: () => [] },
  carregando: { type: Boolean, default: false },
  meuId: { type: [String, Number], required: true },
  souAdmin: { type: Boolean, default: false }
})

const emit = defineEmits([
  'responder', 
  'encaminhar', 
  'editar', 
  'apagar', 
  'reagir', 
  'carregar-mais', 
  'scroll-monitor'
])

const scrollContainer = ref(null)

// Repassa o evento de rolagem para o componente pai
function lidarComScroll(e) {
  emit('scroll-monitor', e)
}

// ------------------------------------------------------------
// LÓGICA DE AGRUPAMENTO DE DATAS (Igual ao WhatsApp)
// ------------------------------------------------------------

// Verifica se a mensagem atual pertence a um dia diferente da mensagem anterior
function deveMostrarSeparador(index) {
  if (index === 0) return true
  
  const dataAtual = obterDataFormatada(props.mensagens[index].criada_em)
  const dataAnterior = obterDataFormatada(props.mensagens[index - 1].criada_em)
  
  return dataAtual !== dataAnterior
}

// Formata a data retornando "Hoje", "Ontem" ou a data real
function obterDataFormatada(dataString) {
  if (!dataString) return ''
  try {
    const dataMsg = new Date(dataString)
    const hoje = new Date()
    const ontem = new Date()
    ontem.setDate(hoje.getDate() - 1)

    // Normaliza as horas para comparar apenas os dias (Ano, Mês, Dia)
    const msgZeroHora = new Date(dataMsg.getFullYear(), dataMsg.getMonth(), dataMsg.getDate()).getTime()
    const hojeZeroHora = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).getTime()
    const ontemZeroHora = new Date(ontem.getFullYear(), ontem.getMonth(), ontem.getDate()).getTime()

    if (msgZeroHora === hojeZeroHora) {
      return 'Hoje'
    } else if (msgZeroHora === ontemZeroHora) {
      return 'Ontem'
    } else {
      // Exemplo de retorno: 15/07/2026
      return dataMsg.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      })
    }
  } catch {
    return ''
  }
}

defineExpose({
  scrollContainer
})
</script>

<style scoped>
.area-mensagens {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #eae6df;
}

/* 🌟 DESIGN DO SEPARADOR DE DATA ESTILO WHATSAPP */
.separador-data-container {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  width: 100% !important;
  margin: 14px 0 !important;
  user-select: none !important;
}

.separador-data-texto {
  background-color: rgba(24, 24, 24, 0.85) !important; /* Cinza escuro translúcido */
  color: #e9edef !important; /* Branco suave de leitura fácil */
  font-size: 11.5px !important;
  font-weight: 500 !important;
  padding: 5px 14px !important;
  border-radius: 8px !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15) !important;
  text-transform: capitalize;
}

/* Centralização do botão Carregar */
.container-carregar-historico {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  width: 100% !important;
  padding: 10px 0 20px 0 !important;
  background-color: transparent !important;
}

.btn-carregar-historico {
  background-color: rgba(0, 168, 132, 0.08) !important;
  border: 1px solid rgba(0, 168, 132, 0.2) !important;
  color: #00a884 !important;
  font-size: 11px !important;
  font-weight: bold !important;
  letter-spacing: 1.5px !important;
  padding: 8px 20px !important;
  border-radius: 20px !important;
  cursor: pointer !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  outline: none !important;
}

.btn-carregar-historico:hover {
  background-color: #00a884 !important;
  color: #ffffff !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(0, 168, 132, 0.25) !important;
}

.icone-carregar {
  transition: transform 0.3s ease !important;
}

.btn-carregar-historico:hover .icone-carregar {
  transform: rotate(180deg) !important;
}

.wrapper-mensagem-item {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>