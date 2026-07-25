// src/composables/useHistoricoChamados.js
export function useHistoricoChamados() {
  // ⚡ FORMATADOR SEGURO DE DATA: Previne falhas de runtime e 'Invalid Date'
  const formatarData = (dataString) => {
    if (!dataString) return '--/--/----'
    try {
      const data = new Date(dataString)
      if (isNaN(data.getTime())) return '--/--/----'
      return data.toLocaleDateString('pt-BR')
    } catch {
      return '--/--/----'
    }
  }

  // ⚡ TRATAMENTO DE STATUS DESCONHECIDOS (Escalabilidade):
  const classeStatus = (status) => {
    if (!status) return 'badge-padrao'
    const statusFormatado = status.toLowerCase()
    const conhecidos = ['aberto', 'em_atendimento', 'fechado']
    return conhecidos.includes(statusFormatado) ? `badge-${statusFormatado}` : 'badge-padrao'
  }

  // Substitui underscores por espaços e deixa legível
  const formatarStatus = (status) => {
    if (!status) return '-'
    return status.replace(/_/g, ' ')
  }

  return {
    formatarData,
    classeStatus,
    formatarStatus
  }
}