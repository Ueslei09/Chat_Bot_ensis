// src/composables/useClienteCard.js
import { ref, computed } from 'vue'
import { atualizarContato } from '@/services/contatoServices.js'

export function useClienteCard(props, emit) {
  const editando = ref(false)
  const salvando = ref(false)
  const erro = ref('')
  const form = ref({ nome: '', empresa: '', telefone: '', email: '' })

  // Extrai a inicial do nome com segurança
  const inicial = computed(() => {
    const nome = props.cliente.cliente_nome || props.cliente.nome || '?'
    return nome.charAt(0).toUpperCase()
  })

  const iniciarEdicao = () => {
    erro.value = ''
    form.value = {
      nome: props.cliente.cliente_nome || props.cliente.nome || '',
      empresa: props.cliente.empresa || '',
      telefone: props.cliente.telefone || '',
      email: props.cliente.email || '',
      conexao: props.cliente.conexao || 'whatsapp',
      eh_grupo: props.cliente.eh_grupo || false
    }
    editando.value = true
  }

  const salvar = async () => {
    if (!form.value.nome.trim() || !form.value.telefone.trim()) {
      erro.value = 'Nome e Telefone são campos obrigatórios.'
      return
    }

    const idContato = props.cliente.cliente_id || props.cliente.id
    if (!idContato) {
      erro.value = 'ID do contato não encontrado.'
      return
    }

    salvando.value = true
    erro.value = ''

    try {
      await atualizarContato(idContato, form.value)
      editando.value = false
      emit('atualizado')
    } catch (err) {
      console.error('Erro ao salvar dados do cliente:', err)
      erro.value = err.response?.data?.erro || 'Não foi possível atualizar as informações.'
    } finally {
      salvando.value = false
    }
  }

  return {
    editando,
    salvando,
    erro,
    form,
    inicial,
    iniciarEdicao,
    salvar
  }
}