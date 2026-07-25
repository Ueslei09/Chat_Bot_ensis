<template>
  <div class="cliente-card">
    <div class="avatar">{{ inicial }}</div>

    <div v-if="!editando" class="dados-cliente">
      <h5 class="nome">{{ cliente.cliente_nome || 'Sem Nome' }}</h5>
      <p class="linha" title="Empresa"><i class="bi bi-building"></i> <span>{{ cliente.empresa || '—' }}</span></p>
      <p class="linha" title="Telefone"><i class="bi bi-telephone"></i> <span>{{ cliente.telefone || '—' }}</span></p>
      <p class="linha" title="E-mail"><i class="bi bi-envelope"></i> <span class="email-texto">{{ cliente.email || '—' }}</span></p>

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
import { useClienteCard } from '@/composables/useClienteCard'

const props = defineProps({
  cliente: { type: Object, required: true }
})

const emit = defineEmits(['atualizado'])

const {
  editando,
  salvando,
  erro,
  form,
  inicial,
  iniciarEdicao,
  salvar
} = useClienteCard(props, emit)
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
  width: 100%;
  box-sizing: border-box;
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
  flex-shrink: 0;
}

.dados-cliente {
  width: 100%;
}

.nome {
  margin-bottom: 12px;
  color: #2d3748;
  font-weight: 600;
  font-size: 1.1rem;
  word-break: break-word;
}

.linha {
  font-size: 13px;
  color: #4a5568;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  text-align: left;
}

.linha span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
}

.linha i {
  color: #1a3c6e;
  flex-shrink: 0;
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
  word-break: break-word;
}
</style>