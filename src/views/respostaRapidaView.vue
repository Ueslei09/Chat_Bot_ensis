<template>
  <div class="container-fluid py-3 px-2 px-md-4 animate-fade-in">

    <!-- Cabeçalho -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
      <div>
        <h2 class="fw-bold text-dark fs-4 mb-1">Respostas Rápidas</h2>
     
      </div>
      <div class="d-flex flex-column flex-sm-row gap-2">
        <input 
          v-model="busca" 
          type="text" 
          placeholder="Pesquisar por nome..." 
          @input="buscarComDebounce" 
          class="form-control form-control-sm"
        />
        <button class="btn btn-primary btn-sm text-nowrap fw-bold py-2" @click="abrirModalNova">+ Nova resposta</button>
      </div>
    </div>

    <!-- Tabela Responsiva com Scroll Horizontal Suave -->
    <div class="card border-0 shadow-sm rounded-3 overflow-hidden mb-3">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0 text-nowrap">
          <thead class="table-light text-uppercase fs-7 text-muted">
            <tr>
              <th class="py-3 ps-3">Nome</th>
              <th class="py-3">Texto</th>
              <th class="py-3">Departamento</th>
              <th class="py-3">Categoria</th>
              <th class="py-3 text-end pe-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="carregando">
              <td colspan="5" class="text-center py-4 text-muted">Carregando dados...</td>
            </tr>
            <tr v-else-if="respostas.length === 0">
              <td colspan="5" class="text-center py-4 text-muted">Nenhuma resposta rápida cadastrada.</td>
            </tr>
            <tr v-else v-for="resposta in respostas" :key="resposta.id">
              <td class="ps-3 fw-semibold text-dark">
                {{ resposta.nome }}
              </td>
              <td class="text-secondary text-truncate" style="max-width: 250px;" :title="resposta.texto">
                {{ resposta.texto }}
              </td>
              <td class="text-muted">
                {{ resposta.departamento || '-' }}
              </td>
              <td>
                <span v-if="resposta.categoria" class="badge bg-primary-subtle text-primary border border-primary-subtle">
                  {{ resposta.categoria }}
                </span>
                <span v-else class="text-muted">-</span>
              </td>
              <td class="text-end pe-3">
                <div class="d-inline-flex gap-1">
                  <button class="btn btn-sm btn-light border py-1 px-2 fs-7 text-secondary fw-semibold" @click="editar(resposta)">
                    Editar
                  </button>
                  <button class="btn btn-sm btn-outline-danger py-1 px-2 fs-7" @click="excluir(resposta.id)">
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="text-muted small mb-4">
      Mostrando {{ respostas.length }} resultados
    </div>

    <!-- Modal: Nova / Editar Resposta -->
    <div v-if="modalAberto" class="modal-backdrop show"></div>
    <div v-if="modalAberto" class="modal fade show d-block" tabindex="-1" @click.self="fecharModal">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow rounded-4">
          <div class="modal-header border-bottom-0 pb-0">
            <h5 class="modal-title fw-bold text-dark">
              {{ editandoId ? 'Editar resposta rápida' : 'Nova resposta rápida' }}
            </h5>
            <button type="button" class="btn-close" @click="fecharModal"></button>
          </div>
          
          <div class="modal-body">
            <form @submit.prevent="salvar">
              <div class="mb-3">
                <label class="form-label small fw-bold text-muted">Nome *</label>
                <input 
                  v-model="form.nome" 
                  type="text" 
                  class="form-control form-control-sm" 
                  placeholder="Ex: Msg Inicial - Bom dia" 
                  required 
                />
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold text-muted">Texto *</label>
                <textarea 
                  v-model="form.texto" 
                  rows="4" 
                  class="form-control form-control-sm" 
                  placeholder="Texto que será enviado" 
                  required
                ></textarea>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold text-muted">Departamento</label>
                <input 
                  v-model="form.departamento" 
                  type="text" 
                  class="form-control form-control-sm" 
                  placeholder="Ex: Suporte" 
                />
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold text-muted">Categoria</label>
                <input 
                  v-model="form.categoria" 
                  type="text" 
                  class="form-control form-control-sm" 
                  placeholder="Opcional" 
                />
              </div>

              <div v-if="erro" class="alert alert-danger py-2 small mb-3">{{ erro }}</div>

              <div class="d-flex justify-content-end gap-2 pt-2">
                <button type="button" class="btn btn-secondary btn-sm px-3" @click="fecharModal">Cancelar</button>
                <button type="submit" class="btn btn-primary btn-sm px-4 fw-bold">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { useRespostasRapidas } from '@/Composables/useRespostasRapidas'

const {
  respostas,
  carregando,
  busca,
  modalAberto,
  editandoId,
  erro,
  form,
  buscarComDebounce,
  abrirModalNova,
  editar,
  fecharModal,
  salvar,
  excluir
} = useRespostasRapidas()
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.fs-7 {
  font-size: 0.75rem;
}
</style>