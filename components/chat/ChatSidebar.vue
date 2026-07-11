<template>
  <aside class="sidebar">
    <nav class="abas">
      <button :class="{ ativa: abaAtual === 'EM_ATENDIMENTO' }" @click="$emit('trocar-aba', 'EM_ATENDIMENTO')">
        Conversando
      </button>
      <button :class="{ ativa: abaAtual === 'ABERTO' }" @click="$emit('trocar-aba', 'ABERTO')">
        Fila
      </button>
      <button :class="{ ativa: abaAtual === 'FECHADO' }" @click="$emit('trocar-aba', 'FECHADO')">
        Chamados
      </button>
    </nav>

    <ul class="lista-chamados">
      <li v-if="carregando" class="vazio">Carregando...</li>
      <li v-else-if="chamados.length === 0" class="vazio">Nenhum chamado aqui.</li>
      <li
        v-for="chamado in chamados"
        :key="chamado.id"
        class="item-chamado"
        :class="{ selecionado: chamadoSelecionado?.id === chamado.id }"
        @click="$emit('selecionar', chamado)"
      >
        <span class="nome">Chamado #{{ chamado.id }}</span>
        <span class="status">{{ chamado.status }}</span>
      </li>
    </ul>
  </aside>
</template>

<script setup>
// Props recebidas do componente pai (ChamadosView, que orquestra tudo)
defineProps({
  chamados: { type: Array, required: true },
  carregando: { type: Boolean, default: false },
  abaAtual: { type: String, required: true },
  chamadoSelecionado: { type: Object, default: null }
})

// Eventos que este componente dispara pro pai:
// - 'trocar-aba' (status: string)
// - 'selecionar' (chamado: object)
defineEmits(['trocar-aba', 'selecionar'])
</script>

<style scoped>
.sidebar {
  width: 300px;
  background: #fff;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
}
.abas {
  display: flex;
  border-bottom: 1px solid #eee;
}
.abas button {
  flex: 1;
  padding: 12px 8px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 13px;
  color: #555;
}
.abas button.ativa {
  border-bottom: 2px solid #1a3c6e;
  font-weight: bold;
  color: #1a3c6e;
}
.lista-chamados {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  flex: 1;
}
.vazio {
  padding: 16px;
  color: #999;
  font-size: 13px;
  text-align: center;
}
.item-chamado {
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}
.item-chamado:hover {
  background: #f7f9fc;
}
.item-chamado.selecionado {
  background: #e8f0fe;
}
.item-chamado .status {
  font-size: 11px;
  color: #888;
}
</style>