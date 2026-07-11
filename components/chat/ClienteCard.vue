<template>
  <div class="cliente-card">
    <div class="avatar">{{ inicial }}</div>

    <div v-if="!editando" class="dados-cliente">
      <h5 class="nome">{{ cliente.cliente_nome }}</h5>
      <p class="linha"><i class="bi bi-building"></i> {{ cliente.empresa || '—' }}</p>
      <p class="linha"><i class="bi bi-telephone"></i> {{ cliente.telefone }}</p>
      <p class="linha"><i class="bi bi-envelope"></i> {{ cliente.email || '—' }}</p>

      <button class="btn btn-sm btn-outline-primary mt-2" @click="iniciarEdicao">
        <i class="bi bi-pencil"></i> Editar cliente
      </button>
    </div>

    <form v-else class="form-edicao" @submit.prevent="salvar">
      <input v-model="form.nome" class="form-control form-control-sm mb-2" placeholder="Nome" />
      <input v-model="form.empresa" class="form-control form-control-sm mb-2" placeholder="Empresa" />
      <input v-model="form.telefone" class="form-control form-control-sm mb-2" placeholder="Telefone" />
      <input v-model="form.email" class="form-control form-control-sm mb-2" placeholder="E-mail" type="email" />

      <div class="d-flex gap-2">
        <button type="button" class="btn btn-sm btn-secondary" @click="editando = false">Cancelar</button>
        <button type="submit" class="btn btn-sm btn-primary">Salvar</button>
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
const form = ref({})

const inicial = computed(() => (props.cliente.cliente_nome || '?').charAt(0).toUpperCase())

function iniciarEdicao() {
  form.value = {
    nome: props.cliente.cliente_nome,
    empresa: props.cliente.empresa,
    telefone: props.cliente.telefone,
    email: props.cliente.email
  }
  editando.value = true
}

async function salvar() {
  await atualizarContato(props.cliente.cliente_id, form.value)
  editando.value = false
  emit('atualizado')
}
</script>

<style scoped>
.cliente-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 16px;
  border-bottom: 1px solid #eee;
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
  margin-bottom: 12px;
}
.dados-cliente {
  width: 100%;
}
.nome {
  margin-bottom: 8px;
}
.linha {
  font-size: 13px;
  color: #555;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
}
.form-edicao {
  width: 100%;
  text-align: left;
}
</style>