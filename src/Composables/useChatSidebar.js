// src/composables/useChatSidebar.js
export function useChatSidebar() {
  // Retorna a inicial do nome do cliente de forma segura
  const obterInicial = (nome) => {
    if (!nome) return '?'
    return nome.trim().charAt(0).toUpperCase()
  }

  // Substitui termos técnicos por legíveis
  const formatarStatus = (status) => {
    if (!status) return ''
    const mapeamento = {
      'EM_ATENDIMENTO': 'Conversando',
      'ABERTO': 'Aguardando',
      'FECHADO': 'Fechado'
    }
    return mapeamento[status] || status
  }

  // Formata a última atualização para horas ou data simplificada
  const formatarData = (dataString) => {
    if (!dataString) return ''
    try {
      const data = new Date(dataString)
      if (isNaN(data.getTime())) return ''
      
      const hoje = new Date()
      if (data.toDateString() === hoje.toDateString()) {
        return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }
      return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    } catch {
      return ''
    }
  }

  return {
    obterInicial,
    formatarStatus,
    formatarData
  }
}