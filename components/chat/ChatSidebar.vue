<template>
  <aside class="sidebar animate-fade-in">
    <!-- Abas de Navegação -->
    <nav class="abas">
      <button 
        type="button"
        :class="{ ativa: abaAtual === 'EM_ATENDIMENTO' }" 
        @click="$emit('trocar-aba', 'EM_ATENDIMENTO')"
      >
        Conversando
      </button>
      <button 
        type="button"
        :class="{ ativa: abaAtual === 'ABERTO' }" 
        @click="$emit('trocar-aba', 'ABERTO')"
      >
        Fila
      </button>
      <button 
        type="button"
        :class="{ ativa: abaAtual === 'FECHADO' }" 
        @click="$emit('trocar-aba', 'FECHADO')"
      >
        Finalizados
      </button>
    </nav>

    <!-- Lista Lateral de Conversas/Chamados -->
    <ul class="lista-chamados">
      <li v-if="carregando" class="vazio">
        <div class="spinner-border text-primary spinner-sm" role="status"></div>
        <span>Carregando conversas...</span>
      </li>
      <li v-else-if="chamados.length === 0" class="vazio">
        Nenhum chamado nesta aba.
      </li>
      <li
        v-else
        v-for="chamado in chamados"
        :key="chamado.id"
        class="item-chamado"
        :class="{ 
          selecionado: chamadoSelecionado?.id === chamado.id,
          'nao-lido': chamado.nao_lidas > 0 
        }"
        @click="$emit('selecionar', chamado)"
      >
        <!-- Avatar com Inicial do Cliente -->
        <div class="avatar-mini">
          {{ obterInicial(chamado.cliente_nome || chamado.contato?.nome) }}
        </div>

        <div class="conteudo-chamado">
          <div class="linha-topo">
            <!-- Exibe o nome amigável do cliente com fallback para o ID do chamado -->
            <strong class="nome-cliente">
              {{ chamado.cliente_nome || chamado.contato?.nome || `Chamado #${chamado.id}` }}
            </strong>
            <span class="data-ultimo">
              {{ formatarData(chamado.atualizado_em || chamado.criado_em) }}
            </span>
          </div>

          <div class="linha-base">
            <!-- Resumo do Chamado (Número, última mensagem ou status formatado) -->
            <span class="detalhe">
              #{{ chamado.id }} • {{ chamado.numero_cliente || chamado.contato?.telefone || 'Sem número' }}
            </span>

            <!-- Badge de Notificação Não Lida ou Status amigável -->
            <span v-if="chamado.nao_lidas > 0" class="badge-notificacao">
              {{ chamado.nao_lidas }}
            </span>
            <span v-else class="status-badge" :class="chamado.status.toLowerCase()">
              {{ formatarStatus(chamado.status) }}
            </span>
          </div>
        </div>
      </li>
    </ul>
  </aside>
</template>

<script setup>
import { useChatSidebar } from '@/Composables/useChatSidebar'

defineProps({
  chamados: { type: Array, required: true },
  carregando: { type: Boolean, default: false },
  abaAtual: { type: String, required: true },
  chamadoSelecionado: { type: Object, default: null }
})

defineEmits(['trocar-aba', 'selecionar'])

const {
  obterInicial,
  formatarStatus,
  formatarData
} = useChatSidebar()
</script>

<style scoped>
.sidebar {
  width: 100%; /* 🎯 Ocupa 100% do container pai, eliminando a sobra à direita */
  max-width: 100%; /* Remove qualquer restrição rígida de largura no mobile */
  background: #fff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
}

/* Em telas maiores (Desktop), limitamos com elegância para manter o padrão de chat */
@media (min-width: 768px) {
  .sidebar {
    max-width: 340px;
  }
}

.abas {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.abas button {
  flex: 1;
  padding: 14px 4px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.abas button:hover {
  color: #1e293b;
}

.abas button.ativa {
  border-bottom: 3px solid #1a3c6e;
  font-weight: 600;
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
  padding: 32px 16px;
  color: #94a3b8;
  font-size: 13px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.item-chamado {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background-color 0.15s ease;
}

.item-chamado:hover {
  background: #f8fafc;
}

.item-chamado.selecionado {
  background: #e2e8f0;
}

/* Avatar do contato */
.avatar-mini {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #3b82f6;
  color: #fff;
  font-weight: bold;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-chamado.selecionado .avatar-mini {
  background: #1a3c6e;
}

/* Conteúdo interno da linha */
.conteudo-chamado {
  flex: 1;
  min-width: 0; 
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.linha-topo, .linha-base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nome-cliente {
  font-size: 14px;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: 8px;
}

.item-chamado.nao-lido .nome-cliente {
  font-weight: 700;
}

.data-ultimo {
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
  flex-shrink: 0;
}

.detalhe {
  font-size: 12px;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: 8px;
}

/* Notificação não lida */
.badge-notificacao {
  background-color: #25d366; 
  color: #fff;
  font-size: 10px;
  font-weight: bold;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Status visuais amigáveis */
.status-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
  flex-shrink: 0;
}

.status-badge.aberto {
  color: #d97706;
}

.status-badge.em_atendimento {
  color: #1a3c6e;
}

.status-badge.fechado {
  color: #64748b;
}

/* Spinner */
.spinner-sm {
  width: 1.2rem;
  height: 1.2rem;
  border-width: 0.15em;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>