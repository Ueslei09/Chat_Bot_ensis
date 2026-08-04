<template>
  <div class="container py-4 animate-fade-in" style="max-width: 1200px;">

    <!-- Cabeçalho -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold text-dark mb-1">Contatos</h2>
   
      </div>
      <div class="d-flex gap-2">
        <!-- Botão de importar menor e discreto -->
        <label class="btn btn-outline-primary btn-sm px-3 rounded-pill d-flex align-items-center gap-1 cursor-pointer">
          <span>📥</span> <span class="d-none d-sm-inline">Importar CSV</span>
          <input type="file" accept=".csv" @change="importarArquivo" hidden />
        </label>
        <button class="btn btn-outline-secondary rounded-pill px-3 btn-sm d-flex align-items-center gap-1" @click="voltarParaChat">
          <span>←</span> <span class="d-none d-sm-inline">Voltar ao chat</span>
        </button>
      </div>
    </div>

    <div v-if="mensagemImportacao" class="text-success small mb-3 text-end">{{ mensagemImportacao }}</div>

    <!-- Formulário: Novo/Editar Contato -->
    <div class="card border-0 shadow-sm p-3 mb-4 bg-light rounded-4">
      <form class="row g-3 align-items-end" @submit.prevent="salvarContato">
        <div class="col-12 col-md-3">
          <label class="form-label small fw-bold text-muted">Nome</label>
          <input v-model="form.nome" type="text" class="form-control form-control-sm" placeholder="Nome do contato" required />
        </div>

        <div class="col-12 col-md-3">
          <label class="form-label small fw-bold text-muted">Número</label>
          <input  
            v-model="form.telefone"
            type="text"
            class="form-control form-control-sm"
            :placeholder="form.eh_grupo ? 'ID do grupo' : '5511999999999'"
            required 
          />
        </div>

        <div class="col-6 col-md-2">
          <label class="form-label small fw-bold text-muted">Conexão</label>
          <select v-model="form.conexao" class="form-select form-select-sm" required>
            <option value="whatsapp">WhatsApp</option>
            <option value="chat">Chat</option>
            <option value="helpdesk">Helpdesk</option>
          </select>
        </div>

        <div class="col-6 col-md-2 d-flex align-items-center">
          <div class="form-check mt-md-4">
            <input class="form-check-input" type="checkbox" v-model="form.eh_grupo" id="checkGrupo" />
            <label class="form-check-label small fw-bold text-muted" for="checkGrupo">
              É grupo?
            </label>
          </div>
        </div>

        <div class="col-12 col-md-2 d-flex gap-2">
          <button type="submit" class="btn btn-primary btn-sm w-100 fw-bold">
            {{ editandoId ? 'Salvar' : 'Adicionar' }}
          </button>
          <button v-if="editandoId" type="button" class="btn btn-secondary btn-sm" @click="cancelarEdicao">
            X
          </button>
        </div>
      </form>
    </div>

    <!-- Alertas -->
    <div v-if="mensagem" class="alert alert-success py-2 small" role="alert">{{ mensagem }}</div>
    <div v-if="erro" class="alert alert-danger py-2 small" role="alert">{{ erro }}</div>

    <!-- Filtros -->
    <div class="row g-2 mb-4 align-items-center">
      <div class="col-12 col-md-4">
        <input
          v-model="filtroBusca"
          type="text"
          placeholder="Buscar nome ou número..."
          @input="buscarComFiltro"
          class="form-control form-control-sm"
        />
      </div>

      <div class="col-6 col-md-2">
        <select v-model="filtroConexao" @change="buscarComFiltro" class="form-select form-select-sm">
          <option value="">Todas conexões</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="chat">Chat</option>
          <option value="helpdesk">Helpdesk</option>
        </select>
      </div>

      <div class="col-6 col-md-2">
        <select v-model="filtroTipo" @change="buscarComFiltro" class="form-select form-select-sm">
          <option value="">Todos os tipos</option>
          <option value="false">Pessoas</option>
          <option value="true">Grupos</option>
        </select>
      </div>

      <div class="col-auto">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" v-model="mostrarArquivados" @change="buscarComFiltro" id="checkArq" />
          <label class="form-check-label small text-muted" for="checkArq">
            Ver arquivados
          </label>
        </div>
      </div>

      <div class="col-auto ms-auto">
        <button class="btn btn-light btn-sm border" @click="carregarContatos" title="Atualizar">🔄</button>
      </div>
    </div>

    <!-- Tabela Responsiva com Bootstrap -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div class="table-responsive">

       
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light text-uppercase small text-muted">
            <tr>
              <th class="py-3 ps-3" style="width: 30%;">Nome</th>
              <th class="py-3" style="width: 25%;">Número</th>
              <th class="py-3" style="width: 15%;">Conexão</th>
              <th class="py-3 text-end pe-3" style="width: 30%;">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="carregando">
              <td colspan="4" class="text-center py-4 text-muted">Carregando contatos...</td>
            </tr>
            <tr v-else-if="contatos.length === 0">
              <td colspan="4" class="text-center py-4 text-muted">Nenhum contato encontrado.</td>
            </tr>
            <tr v-else v-for="contato in contatos" :key="contato.id">
              <td class="ps-3 fw-semibold text-dark">
                <span v-if="contato.eh_grupo" class="badge bg-secondary me-1 font-monospace">Grupo</span>
                {{ contato.nome }}
              </td>
              <td class="text-secondary font-monospace">
              {{ contato.telefoneFormatado }}
              </td>
              <td>
                <span class="badge" :class="{
                  'bg-success-subtle text-success': contato.conexao === 'whatsapp',
                  'bg-primary-subtle text-primary': contato.conexao === 'chat',
                  'bg-warning-subtle text-warning-emphasis': contato.conexao === 'helpdesk'
                }">
                  {{ contato.conexao }}
                </span>
              </td>
              <td class="text-end pe-3">
                <div class="d-inline-flex gap-1">
                  <button class="btn btn-sm btn-primary py-1 px-2 fs-7 fw-semibold" @click="abrirChamado(contato)" title="Abrir Chamado">
                    💬 Chamado
                  </button>
                  <button class="btn btn-sm btn-light border py-1 px-2 fs-7 text-secondary" @click="editarContato(contato)">
                    Editar
                  </button>
                  <button
                    v-if="!contato.arquivado"
                    class="btn btn-sm btn-outline-warning py-1 px-2 fs-7"
                    @click="arquivar(contato.id)"
                  >
                    Arquivar
                  </button>
                  <button
                    v-else
                    class="btn btn-sm btn-outline-success py-1 px-2 fs-7"
                    @click="desarquivar(contato.id)"
                  >
                    Desarquivar
                  </button>
                  <button class="btn btn-sm btn-outline-danger py-1 px-2 fs-7" @click="excluir(contato.id)">
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { useContatos } from '@/composables/useContatos'

const {
  contatos,
  carregando,
  mensagem,
  erro,
  mensagemImportacao,
  filtroBusca,
  filtroConexao,
  filtroTipo,
  mostrarArquivados,
  editandoId,
  form,
  carregarContatos,
  buscarComFiltro,
  salvarContato,
  editarContato,
  cancelarEdicao,
  excluir,
  arquivar,
  desarquivar,
  importarArquivo,
  voltarParaChat,
  abrirChamado
} = useContatos()

// Função auxiliar robusta para capturar o número independente da chave enviada pelo backend
const obterNumero = (contato) => {
  return contato.telefone || contato.numero || contato.whatsapp || contato.phone || contato.remoteJid || '—';
}
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
.cursor-pointer {
  cursor: pointer;
}
</style>