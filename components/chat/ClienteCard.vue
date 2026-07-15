<template>
  <div class="cliente-card">
    <div class="avatar">{{ inicial }}</div>

    <div v-if="!editando" class="dados-cliente">
      <h5 class="nome">{{ cliente.cliente_nome || 'Sem Nome' }}</h5>
      <p class="linha" title="Empresa"><i class="bi bi-building"></i> {{ cliente.empresa || '—' }}</p>
      <p class="linha" title="Telefone"><i class="bi bi-telephone"></i> {{ cliente.telefone || '—' }}</p>
      <p class="linha" title="E-mail"><i class="bi bi-envelope"></i> {{ cliente.email || '—' }}</p>

      <button type="button" class="btn btn-sm btn-outline-primary mt-2" @click="iniciarEdicao">
        <i class="bi bi-pencil"></i> Editar cliente
      </button>
    </div>

    <!-- Formulário de Edição -->
    <form v-else class="form-edicao" @submit.prevent="salvar">
      <div class="mb-2">
        <label class="rotulo-campo">Nome *</label>
        <input v-model="form.nome" class="form-control form-control-sm" placeholder="Nome do cliente" required />
      </div>
      
      <div class="mb-2">
        <label class="rotulo-campo">Empresa</label>
        <input v-model="form.empresa" class="form-control form-control-sm" placeholder="Empresa" />
      </div>

      <div class="mb-2">
        <label class="rotulo-campo">Telefone *</label>
        <input v-model="form.telefone" class="form-control form-control-sm" placeholder="Telefone" required />
      </div>

      <div class="mb-2">
        <label class="rotulo-campo">E-mail</label>
        <input v-model="form.email" class="form-control form-control-sm" placeholder="E-mail" type="email" />
      </div>

      <p v-if="erro" class="erro-mensagem">{{ erro }}</p>

      <div class="d-flex gap-2 mt-3">
        <button 
          type="button" 
          class="btn btn-sm btn-secondary flex-grow-1" 
          :disabled="salvando" 
          @click="editando = false"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          class="btn btn-sm btn-primary flex-grow-1" 
          :disabled="salvando"
        >
          {{ salvando ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { atualizarContato } from '@/services/contatoServices.js'

const props = defineProps({
  cliente: { type: Object, required: true }
})

const emit = defineEmits(['atualizado'])

const editando = ref(false)
const salvando = ref(false)
const erro = ref('')
const form = ref({ nome: '', empresa: '', telefone: '', email: '' })

// Extrai a inicial do nome com segurança
const inicial = computed(() => {
  const nome = props.cliente.cliente_nome || props.cliente.nome || '?'
  return nome.charAt(0).toUpperCase()
})

function iniciarEdicao() {
  erro.value = ''
  // Mapeia os dados do objeto 'cliente' para o formulário padrão esperado pelos 'contatoServices'
  form.value = {
    nome: props.cliente.cliente_nome || props.cliente.nome || '',
    empresa: props.cliente.empresa || '',
    telefone: props.cliente.telefone || '',
    email: props.cliente.email || '',
    // Garante que preserva campos como conexão para a API não perder a referência do canal
    conexao: props.cliente.conexao || 'whatsapp',
    eh_grupo: props.cliente.eh_grupo || false
  }
  editando.value = true
}

async function salvar() {
  // Validação preventiva simples
  if (!form.value.nome.trim() || !form.value.telefone.trim()) {
    erro.value = 'Nome e Telefone são campos obrigatórios.'
    return
  }

  // Encontra o ID correto do cliente, independente do mapeamento da query (cliente_id ou id)
  const idContato = props.cliente.cliente_id || props.cliente.id
  if (!idContato) {
    erro.value = 'ID do contato não encontrado.'
    return
  }

  salvando.value = true
  erro.value = ''

  try {
    // Atualiza via camada de serviço dedicada do Axios
    await atualizarContato(idContato, form.value)
    editando.value = false
    emit('atualizado') // Notifica o componente pai (ex: ChatDrawer) para recarregar os dados na tela
  } catch (err) {
    console.error('Erro ao salvar dados do cliente:', err)
    erro.value = err.response?.data?.erro || 'Não foi possível atualizar as informações.'
  } finally {
    salvando.value = false
  }
}
</script>

<style scoped>
.cliente-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px 16px;
  border-bottom: 1px solid #edf2f7;
  background-color: #fff;
}
.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #1a3c6e;
  color: #fff;
  font-size: 26px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 4px 6px rgba(26, 60, 110, 0.2);
}
.dados-cliente {
  width: 100%;
}
.nome {
  margin-bottom: 12px;
  color: #2d3748;
  font-weight: 600;
}
.linha {
  font-size: 13px;
  color: #4a5568;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}
.linha i {
  color: #1a3c6e;
}
.form-edicao {
  width: 100%;
  text-align: left;
}
.rotulo-campo {
  font-size: 11px;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 2px;
}
.erro-mensagem {
  color: #e53e3e;
  font-size: 12px;
  margin-top: 8px;
  margin-bottom: 0;
}
</style>