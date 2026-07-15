<template>
  <!-- Fundo escurecido, clicar fora fecha o drawer -->
  <div class="drawer-overlay" :class="{ aberto }" @click="$emit('fechar')"></div>

  <aside class="drawer" :class="{ aberto }" role="dialog" aria-modal="true">
    <div class="drawer-topo">
      <strong>Detalhes do chamado</strong>
      <button type="button" class="btn-fechar" aria-label="Fechar painel" @click="$emit('fechar')">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>

  <!-- CÓDIGO CORRIGIDO (Limpo e sem diretivas inválidas) -->
<div v-if="carregando" class="drawer-carregando">
  <div class="spinner-border text-primary spinner-sm mb-2" role="status"></div>
  <p class="text-muted mb-0">Buscando informações...</p>
</div>

    <div v-else-if="detalhes" class="drawer-conteudo">
      <!-- Mapeia o chamado para o ClienteCard que já refatoramos -->
      <ClienteCard :cliente="detalhes.chamado" @atualizado="$emit('recarregar')" />

      <!-- Seções do chamado em si -->
      <div class="secao">
        <div class="linha-info">
          <span class="rotulo">Status</span>
          <span class="badge" :class="classeStatus(detalhes.chamado.status)">
            {{ formatarStatus(detalhes.chamado.status) }}
          </span>
        </div>
        <div class="linha-info">
          <span class="rotulo">Prioridade</span>
          <span class="badge-prioridade" :class="`prioridade-${(detalhes.chamado.prioridade || 'MEDIA').toLowerCase()}`">
            {{ detalhes.chamado.prioridade || 'MÉDIA' }}
          </span>
        </div>
        <div class="linha-info">
          <span class="rotulo">Atendente</span>
          <strong>{{ detalhes.chamado.atendente_nome || 'Ninguém ainda' }}</strong>
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
          :disabled="salvando"
          @blur="salvarDetalhes"
          @keydown.enter="salvarDetalhes"
        />
        <div class="tags-lista" v-if="tagsEditaveis">
          <span v-for="tag in tagsColecao" :key="tag" class="tag-badge">
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Observações -->
      <div class="secao">
        <label class="rotulo-secao"><i class="bi bi-journal-text"></i> Observações</label>
        <textarea
          v-model="observacoesEditaveis"
          class="form-control form-control-sm"
          rows="3"
          placeholder="Adicione notas internas sobre o caso..."
          :disabled="salvando"
          @blur="salvarDetalhes"
        ></textarea>
        <div v-if="salvando" class="salvando-status">
          <span class="spinner-border spinner-mini text-primary"></span> Salvando alterações...
        </div>
      </div>

      <!-- Importação de arquivos com Case-Sensitive corrigido para evitar falha em Linux/Production Build -->
      <HistoricoChamados :historico="detalhes.historico" />
      <ArquivosCliente :arquivos="detalhes.arquivos" />

      <!-- Ações -->
      <div class="secao acoes-drawer">
        <button type="button" class="btn btn-outline-primary btn-sm w-100 mb-2" @click="$emit('transferir')">
          <i class="bi bi-arrow-left-right"></i> Transferir chamado
        </button>
        <button type="button" class="btn btn-outline-danger btn-sm w-100" @click="$emit('encerrar')">
          <i class="bi bi-check-lg"></i> Encerrar chamado
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ClienteCard from './ClienteCard.vue'
import HistoricoChamados from './HistoricoChamados.vue' // Corrigido Case-Sensitive 'Historicochamados' -> 'HistoricoChamados'
import ArquivosCliente from './ArquivosCliente.vue' // Corrigido de 'ArquivoClientes' para 'ArquivosCliente' para corresponder ao padrão do projeto
import { atualizarDetalhesChamado } from '@/services/chamadoServices.js'

const props = defineProps({
  aberto: { type: Boolean, default: false },
  detalhes: { type: Object, default: null },
  carregando: { type: Boolean, default: false }
})

defineEmits(['fechar', 'recarregar', 'transferir', 'encerrar'])

const tagsEditaveis = ref('')
const observacoesEditaveis = ref('')
const salvando = ref(false)

// Guarda cópia do estado atual para só salvar se houver mudança de fato (Evita requisições à toa no blur)
let copiaTagsOriginais = ''
let copiaObsOriginais = ''

// Sincroniza dados com o chamado atual
watch(
  () => props.detalhes,
  (novo) => {
    if (novo?.chamado) {
      tagsEditaveis.value = novo.chamado.tags || ''
      observacoesEditaveis.value = novo.chamado.observacoes || ''
      copiaTagsOriginais = novo.chamado.tags || ''
      copiaObsOriginais = novo.chamado.observacoes || ''
    } else {
      tagsEditaveis.value = ''
      observacoesEditaveis.value = ''
      copiaTagsOriginais = ''
      copiaObsOriginais = ''
    }
  },
  { immediate: true }
)

// Computed que gera o array de badges reativas a partir da string digitada pelo operador
const tagsColecao = computed(() => {
  if (!tagsEditaveis.value) return []
  return tagsEditaveis.value.split(',').map(t => t.trim()).filter(Boolean)
})

// ⚡ SALVAMENTO SEGURO (Performance & Resiliência):
// Evita requisições à API se o operador clicar no campo e sair sem alterar nada
async function salvarDetalhes() {
  if (!props.detalhes?.chamado?.id) return
  
  const tagsMudaram = tagsEditaveis.value.trim() !== copiaTagsOriginais.trim()
  const obsMudaram = observacoesEditaveis.value.trim() !== copiaObsOriginais.trim()
  
  if (!tagsMudaram && !obsMudaram) return // Nenhuma alteração real, cancela request

  salvando.value = true
  try {
    await atualizarDetalhesChamado(props.detalhes.chamado.id, {
      tags: tagsEditaveis.value,
      observacoes: observacoesEditaveis.value
    })
    // Atualiza cópias locais após salvamento bem-sucedido
    copiaTagsOriginais = tagsEditaveis.value
    copiaObsOriginais = observacoesEditaveis.value
  } catch (err) {
    console.error('Erro ao atualizar detalhes adicionais:', err)
  } finally {
    salvando.value = false
  }
}

const tempoEmAtendimento = computed(() => {
  if (!props.detalhes?.chamado) return '—'
  const inicio = new Date(props.detalhes.chamado.criado_em)
  const fim = props.detalhes.chamado.fechado_em ? new Date(props.detalhes.chamado.fechado_em) : new Date()
  const diffMs = fim - inicio
  
  if (isNaN(diffMs) || diffMs < 0) return '—'
  
  const horas = Math.floor(diffMs / 3600000)
  const minutos = Math.floor((diffMs % 3600000) / 60000)
  return `${horas}h ${minutos}min`
})

function formatarData(dataString) {
  if (!dataString) return '--/--/---- --:--'
  try {
    const data = new Date(dataString)
    if (isNaN(data.getTime())) return '--/--/---- --:--'
    return data.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  } catch {
    return '--/--/---- --:--'
  }
}

function formatarStatus(status) {
  if (!status) return ''
  const mapeamento = {
    'EM_ATENDIMENTO': 'Conversando',
    'ABERTO': 'Fila',
    'FECHADO': 'Finalizado'
  }
  return mapeamento[status] || status
}

function classeStatus(status) {
  if (!status) return 'badge-padrao'
  const statusFormatado = status.toLowerCase()
  const conhecidos = ['aberto', 'em_atendimento', 'fechado']
  return conhecidos.includes(statusFormatado) ? `badge-${statusFormatado}` : 'badge-padrao'
}
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4); /* Fundo com tom escurecido mais contemporâneo */
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
  box-shadow: -6px 0 24px rgba(0, 0, 0, 0.08);
  transform: translateX(100%);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1); /* Curva de movimento mais natural */
  z-index: 200;
  display: flex;
  flex-direction: column;
}
.drawer.aberto {
  transform: translateX(0);
}

.drawer-topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid #e2e8f0;
}
.drawer-topo strong {
  color: #1e293b;
  font-size: 16px;
}
.btn-fechar {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #64748b;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-fechar:hover {
  background-color: #f1f5f9;
}

.drawer-conteudo {
  flex: 1;
  overflow-y: auto;
}

.drawer-carregando {
  padding: 60px 40px;
  text-align: center;
  color: #64748b;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.secao {
  padding: 18px 20px;
  border-bottom: 1px solid #e2e8f0;
}
.linha-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  margin-bottom: 10px;
}
.linha-info:last-child {
  margin-bottom: 0;
}
.rotulo {
  color: #64748b;
}
.rotulo-secao {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #1e293b;
  margin-bottom: 8px;
  font-weight: 600;
}
.rotulo-secao i {
  color: #1a3c6e;
}
.badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  color: #fff;
  text-transform: uppercase;
}
.badge-aberto { background: #f0ad4e; }
.badge-em_atendimento { background: #1a3c6e; }
.badge-fechado { background: #718096; }
.badge-padrao { background: #a0aec0; }

.badge-prioridade {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: #f1f5f9;
}
.badge-prioridade.prioridade-alta {
  background-color: #fee2e2;
  color: #ef4444;
}
.badge-prioridade.prioridade-baixa {
  background-color: #f0fdf4;
  color: #22c55e;
}

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
  font-weight: 500;
}

.salvando-status {
  font-size: 11px;
  color: #1a3c6e;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.acoes-drawer {
  border-bottom: none;
  padding-bottom: 24px;
}

.form-control {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 6px 12px;
  font-family: inherit;
  outline: none;
}
.form-control:focus {
  border-color: #1a3c6e;
}

/* Spinner animado nativo */
.spinner-border {
  display: inline-block;
  width: 1.5rem;
  height: 1.5rem;
  vertical-align: text-bottom;
  border: 0.18em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border .75s linear infinite;
}
.spinner-sm {
  width: 1.2rem;
  height: 1.2rem;
  border-width: 0.15em;
}
.spinner-mini {
  width: 0.85rem;
  height: 0.85rem;
  border-width: 0.1em;
}
@keyframes spinner-border {
  to { transform: rotate(360deg); }
}
</style>