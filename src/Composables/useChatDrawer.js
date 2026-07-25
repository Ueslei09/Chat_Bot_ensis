// src/composables/useChatDrawer.js
import { ref, computed, watch } from 'vue'
import { atualizarDetalhesChamado } from '@/services/chamadoServices.js'

export function useChatDrawer(props) {
  const tagsEditaveis = ref('')
  const observacoesEditaveis = ref('')
  const salvando = ref(false)

  let copiaTagsOriginais = ''
  let copiaObsOriginais = ''

  // Sincroniza dados com o chamado atual
  watch(
    () => props.detalhes,
    (novo) => {
      if (novo?.chamado) {
        tagsEditaveis.value = novo.chamado.tags || ''
        observacoesEditaveis.value = novo.chamado.observacoes || ''
        copiaTagsOriginais = novo.chamado.tags || ''
        copiaObsOriginais = novo.chamado.observacoes || ''
      } else {
        tagsEditaveis.value = ''
        observacoesEditaveis.value = ''
        copiaTagsOriginais = ''
        copiaObsOriginais = ''
      }
    },
    { immediate: true }
  )

  // Computed que gera o array de badges reativas a partir da string digitada pelo operador
  const tagsColecao = computed(() => {
    if (!tagsEditaveis.value) return []
    return tagsEditaveis.value.split(',').map(t => t.trim()).filter(Boolean)
  })

  // Salvamento seguro: evita requisições à API se não houver alteração
  const salvarDetalhes = async () => {
    if (!props.detalhes?.chamado?.id) return
    
    const tagsMudaram = tagsEditaveis.value.trim() !== copiaTagsOriginais.trim()
    const obsMudaram = observacoesEditaveis.value.trim() !== copiaObsOriginais.trim()
    
    if (!tagsMudaram && !obsMudaram) return

    salvando.value = true
    try {
      await atualizarDetalhesChamado(props.detalhes.chamado.id, {
        tags: tagsEditaveis.value,
        observacoes: observacoesEditaveis.value
      })
      copiaTagsOriginais = tagsEditaveis.value
      copiaObsOriginais = observacoesEditaveis.value
    } catch (err) {
      console.error('Erro ao atualizar detalhes adicionais:', err)
    } finally {
      salvando.value = false
    }
  }

  const tempoEmAtendimento = computed(() => {
    if (!props.detalhes?.chamado) return '—'
    const inicio = new Date(props.detalhes.chamado.criado_em)
    const fim = props.detalhes.chamado.fechado_em ? new Date(props.detalhes.chamado.fechado_em) : new Date()
    const diffMs = fim - inicio
    
    if (isNaN(diffMs) || diffMs < 0) return '—'
    
    const horas = Math.floor(diffMs / 3600000)
    const minutos = Math.floor((diffMs % 3600000) / 60000)
    return `${horas}h ${minutos}min`
  })

  const formatarData = (dataString) => {
    if (!dataString) return '--/--/---- --:--'
    try {
      const data = new Date(dataString)
      if (isNaN(data.getTime())) return '--/--/---- --:--'
      return data.toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    } catch {
      return '--/--/---- --:--'
    }
  }

  const formatarStatus = (status) => {
    if (!status) return ''
    const mapeamento = {
      'EM_ATENDIMENTO': 'Conversando',
      'ABERTO': 'Fila',
      'FECHADO': 'Finalizado'
    }
    return mapeamento[status] || status
  }

  const classeStatus = (status) => {
    if (!status) return 'badge-padrao'
    const statusFormatado = status.toLowerCase()
    const conhecidos = ['aberto', 'em_atendimento', 'fechado']
    return conhecidos.includes(statusFormatado) ? `badge-${statusFormatado}` : 'badge-padrao'
  }

  return {
    tagsEditaveis,
    observacoesEditaveis,
    salvando,
    tagsColecao,
    salvarDetalhes,
    tempoEmAtendimento,
    formatarData,
    formatarStatus,
    classeStatus
  }
}