<template>
  <!-- Fundo escurecido, clicar fora fecha o drawer -->
  <div class="drawer-overlay" :class="{ aberto }" @click="$emit('fechar')"></div>

  <aside class="drawer" :class="{ aberto }">
    <div class="drawer-topo">
      <strong>Detalhes do chamado</strong>
      <button class="btn-fechar" @click="$emit('fechar')">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>

    <div v-if="carregando" class="drawer-carregando">Carregando...</div>

    <div v-else-if="detalhes" class="drawer-conteudo">
      <ClienteCard :cliente="detalhes.chamado" @atualizado="$emit('recarregar')" />

      <!-- Seções do chamado em si -->
      <div class="secao">
        <div class="linha-info">
          <span class="rotulo">Status</span>
          <span class="badge" :class="`badge-${detalhes.chamado.status.toLowerCase()}`">
            {{ detalhes.chamado.status }}
          </span>
        </div>
        <div class="linha-info">
          <span class="rotulo">Prioridade</span>
          <span>{{ detalhes.chamado.prioridade || 'MEDIA' }}</span>
        </div>
        <div class="linha-info">
          <span class="rotulo">Atendente</span>
          <span>{{ detalhes.chamado.atendente_nome || 'Ninguém ainda' }}</span>
        </div>
        <div class="linha-info">
          <span class="rotulo">Aberto em</span>
          <span>{{ formatarData(detalhes.chamado.criado_em) }}</span>
        </div>
        <div class="linha-info">
          <span class="rotulo">Tempo em atendimento</span>
          <span>{{ tempoEmAtendimento }}</span>
        </div>
      </div>

      <!-- Tags -->
      <div class="secao">
        <label class="rotulo-secao"><i class="bi bi-tag"></i> Tags</label>
        <input
          v-model="tagsEditaveis"
          class="form-control form-control-sm"
          placeholder="separadas por vírgula"
          @blur="salvarDetalhes"
        />
        <div class="tags-lista" v-if="tagsEditaveis">
          <span v-for="tag in tagsEditaveis.split(',').map(t => t.trim()).filter(Boolean)" :key="tag" class="tag-badge">
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Observações -->
      <div class="secao">
        <label class="rotulo-secao">Observações</label>
        <textarea
          v-model="observacoesEditaveis"
          class="form-control form-control-sm"
          rows="3"
          @blur="salvarDetalhes"
        ></textarea>
      </div>

      <HistoricoChamados :historico="detalhes.historico" />
      <ArquivosCliente :arquivos="detalhes.arquivos" />

      <!-- Ações -->
      <div class="secao acoes-drawer">
        <button class="btn btn-outline-primary btn-sm w-100 mb-2" @click="$emit('transferir')">
          <i class="bi bi-arrow-repeat"></i> Transferir
        </button>
        <button class="btn btn-outline-danger btn-sm w-100" @click="$emit('encerrar')">
          <i class="bi bi-scissors"></i> Encerrar chamado
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ClienteCard from './ClienteCard.vue'
import HistoricoChamados from './Historicochamados.vue'
import ArquivosCliente from './ArquivoClientes.vue'
import { atualizarDetalhesChamado } from '@/services/chamadoServices.js'

const props = defineProps({
  aberto: { type: Boolean, default: false },
  detalhes: { type: Object, default: null },
  carregando: { type: Boolean, default: false }
})

defineEmits(['fechar', 'recarregar', 'transferir', 'encerrar'])

const tagsEditaveis = ref('')
const observacoesEditaveis = ref('')

// Sempre que os detalhes mudarem (trocou de chamado), atualiza os campos editáveis
watch(
  () => props.detalhes,
  (novo) => {
    tagsEditaveis.value = novo?.chamado?.tags || ''
    observacoesEditaveis.value = novo?.chamado?.observacoes || ''
  },
  { immediate: true }
)

async function salvarDetalhes() {
  if (!props.detalhes) return
  await atualizarDetalhesChamado(props.detalhes.chamado.id, {
    tags: tagsEditaveis.value,
    observacoes: observacoesEditaveis.value
  })
}

const tempoEmAtendimento = computed(() => {
  if (!props.detalhes) return '—'
  const inicio = new Date(props.detalhes.chamado.criado_em)
  const fim = props.detalhes.chamado.fechado_em ? new Date(props.detalhes.chamado.fechado_em) : new Date()
  const diffMs = fim - inicio
  const horas = Math.floor(diffMs / 3600000)
  const minutos = Math.floor((diffMs % 3600000) / 60000)
  return `${horas}h ${minutos}min`
})

function formatarData(dataString) {
  return new Date(dataString).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
  z-index: 150;
}
.drawer-overlay.aberto {
  opacity: 1;
  pointer-events: auto;
}

.drawer {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 380px;
  background: #fff;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  z-index: 200;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
.drawer.aberto {
  transform: translateX(0);
}

.drawer-topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}
.btn-fechar {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #555;
}
.drawer-carregando {
  padding: 40px;
  text-align: center;
  color: #999;
}

.secao {
  padding: 16px;
  border-bottom: 1px solid #eee;
}
.linha-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  margin-bottom: 8px;
}
.rotulo {
  color: #888;
}
.rotulo-secao {
  display: block;
  font-size: 13px;
  color: #333;
  margin-bottom: 6px;
  font-weight: 500;
}
.badge {
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 10px;
  color: #fff;
}
.badge-aberto { background: #f0ad4e; }
.badge-em_atendimento { background: #1a3c6e; }
.badge-fechado { background: #999; }

.tags-lista {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tag-badge {
  background: #e0ecff;
  color: #1a3c6e;
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 10px;
}

.acoes-drawer {
  border-bottom: none;
}
</style>