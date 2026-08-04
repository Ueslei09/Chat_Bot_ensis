import { ref, onMounted } from 'vue'
import { api } from '@/services/api'

export function useDashboard() {
  const metricas = ref({
    meusChamados: 0,
    filaEspera: 0,
    whatsappStatus: 'Offline'
  })

  const buscarDadosPainel = async () => {
    try {
      const resposta = await api.get('/app/dashboard/metricas')
      metricas.value = resposta.data
    } catch (err) {
      console.error('Erro ao buscar estatísticas do painel:', err)
    }
  }

  onMounted(() => {
    buscarDadosPainel()
  })

  return {
    metricas,
    buscarDadosPainel
  }
}