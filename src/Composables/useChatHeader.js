// src/composables/useChatHeader.js
import { computed } from 'vue'

export function useChatHeader(props) {
  // Extrai a inicial do cliente com segurança
  const inicial = computed(() => {
    const nome = props.chamado.cliente_nome
    return nome ? nome.charAt(0).toUpperCase() : '?'
  })

  // Converte o status técnico em descrições amigáveis
  const formatarStatus = (status) => {
    if (!status) return ''
    const mapeamento = {
      'EM_ATENDIMENTO': 'Conversando',
      'ABERTO': 'Fila de espera',
      'FECHADO': 'Finalizado'
    }
    return mapeamento[status] || status
  }

  return {
    inicial,
    formatarStatus
  }
}