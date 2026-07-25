// src/Composables/useRespostasRapidas.js
import { ref, onMounted, onUnmounted } from 'vue'
import {
  listarRespostasRapidas,
  criarRespostaRapida,
  atualizarRespostaRapida,
  excluirRespostaRapida
} from '@/services/respostaRapidasServices.js'

// ⚠️ Note a palavra "function" logo após "export"
export function useRespostasRapidas() {
  const respostas = ref([])
  const carregando = ref(false)
  const busca = ref('')

  const modalAberto = ref(false)
  const editandoId = ref(null)
  const erro = ref('')
  const form = ref({ nome: '', texto: '', departamento: '', categoria: '' })

  let timeoutBusca = null

  const carregar = async () => {
    carregando.value = true
    try {
      respostas.value = await listarRespostasRapidas(busca.value)
    } catch (err) {
      console.error('Erro ao carregar respostas rápidas:', err)
    } finally {
      carregando.value = false
    }
  }

  const buscarComDebounce = () => {
    if (timeoutBusca) clearTimeout(timeoutBusca)
    timeoutBusca = setTimeout(() => { carregar() }, 300)
  }

  const abrirModalNova = () => {
    editandoId.value = null
    form.value = { nome: '', texto: '', departamento: '', categoria: '' }
    erro.value = ''
    modalAberto.value = true
  }

  const editar = (resposta) => {
    editandoId.value = resposta.id
    form.value = {
      nome: resposta.nome,
      texto: resposta.texto,
      departamento: resposta.departamento || '',
      categoria: resposta.categoria || ''
    }
    erro.value = ''
    modalAberto.value = true
  }

  const fecharModal = () => {
    modalAberto.value = false
  }

  const salvar = async () => {
    erro.value = ''
    if (!form.value.nome.trim() || !form.value.texto.trim()) {
      erro.value = 'Os campos Nome e Texto são obrigatórios.'
      return
    }
    try {
      if (editandoId.value) {
        await atualizarRespostaRapida(editandoId.value, form.value)
      } else {
        await criarRespostaRapida(form.value)
      }
      fecharModal()
      await carregar()
    } catch (err) {
      erro.value = err.response?.data?.erro || 'Erro ao salvar resposta rápida'
    }
  }

  const excluir = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta resposta rápida?')) return
    try {
      await excluirRespostaRapida(id)
      await carregar()
    } catch (err) {
      console.error('Erro ao excluir resposta rápida:', err)
    }
  }

  onMounted(carregar)

  onUnmounted(() => {
    if (timeoutBusca) clearTimeout(timeoutBusca)
  })

  return {
    respostas,
    carregando,
    busca,
    modalAberto,
    editandoId,
    erro,
    form,
    buscarComDebounce,
    abrirModalNova,
    editar,
    fecharModal,
    salvar,
    excluir
  }
}