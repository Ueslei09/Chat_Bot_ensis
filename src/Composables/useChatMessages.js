// src/composables/useChatMessages.js
import { ref } from 'vue'

export function useChatMessages(props, emit) {
  const scrollContainer = ref(null)

  // Repassa o evento de rolagem para o componente pai
  const lidarComScroll = (e) => {
    emit('scroll-monitor', e)
  }

  // Verifica se a mensagem atual pertence a um dia diferente da mensagem anterior
  const deveMostrarSeparador = (index) => {
    if (index === 0) return true
    
    const dataAtual = obterDataFormatada(props.mensagens[index].criada_em)
    const dataAnterior = obterDataFormatada(props.mensagens[index - 1].criada_em)
    
    return dataAtual !== dataAnterior
  }

  // Formata a data retornando "Hoje", "Ontem" ou a data real
  const obterDataFormatada = (dataString) => {
    if (!dataString) return ''
    try {
      const dataMsg = new Date(dataString)
      const hoje = new Date()
      const ontem = new Date()
      ontem.setDate(hoje.getDate() - 1)

      const msgZeroHora = new Date(dataMsg.getFullYear(), dataMsg.getMonth(), dataMsg.getDate()).getTime()
      const hojeZeroHora = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).getTime()
      const ontemZeroHora = new Date(ontem.getFullYear(), ontem.getMonth(), ontem.getDate()).getTime()

      if (msgZeroHora === hojeZeroHora) {
        return 'Hoje'
      } else if (msgZeroHora === ontemZeroHora) {
        return 'Ontem'
      } else {
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

  return {
    scrollContainer,
    lidarComScroll,
    deveMostrarSeparador,
    obterDataFormatada
  }
}