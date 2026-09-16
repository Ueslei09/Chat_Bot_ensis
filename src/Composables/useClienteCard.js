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
    const nome = props.cliente?.cliente_nome || props.cliente?.nome || '?'
    return nome.charAt(0).toUpperCase()
  })

  const iniciarEdicao = () => {

    console.log("=== OBJETO RECEBIDO ===", JSON.stringify(props.cliente))
    erro.value = ''
    form.value = {
      nome: props.cliente?.cliente_nome || props.cliente?.nome || '',
      empresa: props.cliente?.empresa || '',
      telefone: props.cliente?.cliente_telefone || props.cliente?.telefone || '',
      email: props.cliente?.email || '',
      conexao: props.cliente?.conexao || 'whatsapp',
      eh_grupo: props.cliente?.eh_grupo || false
    }
    editando.value = true
  }

  const salvar = async () => {
    if (!form.value.nome.trim() || !form.value.telefone.trim()) {
      erro.value = 'Nome e Telefone são campos obrigatórios.'
      return
    }

    // Busca o ID real do cliente, evitando pegar o ID do chamado (props.cliente.id)
    const idContato = props.cliente?.cliente_id || props.cliente?.id_cliente || props.cliente?.contato_id
     console.log("--> ID que VAI SER ENVIADO para o backend:", idContato)
    console.log("--> Objeto props.cliente completo:", props.cliente)
    if (!idContato) {
      erro.value = 'ID do cliente não encontrado neste chamado.'
      console.error('Objeto cliente/chamado recebido nas props:', props.cliente)
      return
    }

    salvando.value = true
    erro.value = ''

    try {
      await atualizarContato(idContato, {
        nome: form.value.nome,
        empresa: form.value.empresa,
        cliente_telefone: form.value.telefone, // Mapeia para a coluna correta do banco
        email: form.value.email,
        conexao: form.value.conexao,
        eh_grupo: form.value.eh_grupo
      })
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