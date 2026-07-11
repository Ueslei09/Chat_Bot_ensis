<template>
  <div class="topo" @click="$emit('abrir-detalhes')">
    <div class="titulo">
      <span class="avatar-contato" :class="{ grupo: chamado.eh_grupo }">
        <i v-if="chamado.eh_grupo" class="bi bi-people-fill"></i>
        <template v-else>{{ inicial }}</template>
      </span>

      <div class="info-contato">
        <strong>{{ chamado.cliente_nome || `Chamado #${chamado.id}` }}</strong>
        <span class="status-badge">{{ chamado.status }}</span>
      </div>
    </div>

    <div class="icones-acao" @click.stop>
      <button v-if="abaAtual === 'ABERTO'" class="icone-btn" title="Assumir chamado" @click="$emit('assumir')">
        <i class="bi bi-check-circle"></i>
      </button>

      <template v-if="abaAtual === 'EM_ATENDIMENTO'">
        <button class="icone-btn" title="Transferir chamado" @click="$emit('abrir-transferir')">
          <i class="bi bi-arrow-repeat"></i>
        </button>
        <button class="icone-btn" title="Fechar chamado" @click="$emit('abrir-fechar')">
          <i class="bi bi-scissors"></i>
        </button>
      </template>

      <button v-if="abaAtual === 'FECHADO'" class="icone-btn" title="Reabrir chamado" @click="$emit('reabrir')">
        <i class="bi bi-arrow-counterclockwise"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  chamado: { type: Object, required: true },
  abaAtual: { type: String, required: true }
})

defineEmits(['assumir', 'abrir-transferir', 'abrir-fechar', 'reabrir', 'abrir-detalhes'])

const inicial = computed(() => {
  const nome = props.chamado.cliente_nome
  return nome ? nome.charAt(0).toUpperCase() : '?'
})
</script>

<style scoped>
.topo {
  background: #fff;
  padding: 12px 20px;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}
.topo:hover {
  background: #fafbfc;
}
.titulo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-contato {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #1a3c6e;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: bold;
  flex-shrink: 0;
}
.avatar-contato.grupo {
  background: #6c5ce7;
  font-size: 14px;
}

.info-contato {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.status-badge {
  font-size: 11px;
  color: #666;
  background: #f0f0f0;
  padding: 1px 8px;
  border-radius: 10px;
  width: fit-content;
}

.icones-acao {
  display: flex;
  gap: 6px;
}
.icone-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 6px;
  line-height: 1;
  color: #333;
}
.icone-btn:hover {
  background: #f0f0f0;
}
</style>