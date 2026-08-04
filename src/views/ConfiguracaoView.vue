<template>
  <div class="container py-4 animate-fade-in" style="max-width: 1100px;">

    <!-- Cabeçalho -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold text-dark mb-1">Configurações do Sistema</h2>
      
      </div>
      <button class="btn btn-outline-secondary rounded-pill px-3 btn-sm d-flex align-items-center gap-1" @click="voltarParaLogin">
        <span>←</span> <span class="d-none d-sm-inline">Sair / Login</span>
      </button>
    </div>

    <!-- Seção: Configurações Globais -->
    <div class="card border-0 shadow-sm p-4 mb-4 bg-white rounded-4">
      <h5 class="fw-bold text-dark mb-3">Parâmetros de Mensagens</h5>

      <p v-if="carregando" class="text-muted">Carregando configurações...</p>

      <form v-else @submit.prevent="salvarConfiguracoes">
        <div v-if="configuracoes.length === 0" class="text-muted small mb-3">
          Nenhuma configuração encontrada.
        </div>

        <div v-for="config in configuracoes" :key="config.chaves" class="mb-3">
          <label class="form-label small fw-bold text-muted">{{ rotuloConfiguracao(config.chaves) }}</label>
          <textarea v-model="config.valor" rows="2" class="form-control form-control-sm"></textarea>
        </div>

        <div v-if="mensagem" class="alert alert-success py-2 small" role="alert">{{ mensagem }}</div>
        <div v-if="erro" class="alert alert-danger py-2 small" role="alert">{{ erro }}</div>

        <button type="submit" class="btn btn-primary btn-sm fw-bold px-4 py-2" :disabled="salvando">
          {{ salvando ? 'Salvando...' : 'Salvar alterações' }}
        </button>
      </form>
    </div>

    <hr class="text-muted opacity-25 my-4" />

    <!-- Seção: Cadastrar Novo Usuário -->
    <div class="card border-0 shadow-sm p-4 mb-4 bg-white rounded-4">
      <h5 class="fw-bold text-dark mb-3">Cadastrar Novo Usuário</h5>

      <form @submit.prevent="cadastrarNovoUsuario" class="row g-3">
        <div class="col-12 col-md-6">
          <label class="form-label small fw-bold text-muted">Nome</label>
          <input v-model="novoUsuario.nome" type="text" class="form-control form-control-sm" placeholder="Nome completo" required />
        </div>
        
        <div class="col-12 col-md-6">
          <label class="form-label small fw-bold text-muted">E-mail</label>
          <input v-model="novoUsuario.email" type="email" class="form-control form-control-sm" placeholder="usuario@email.com" required />
        </div>

        <div class="col-12 col-md-4">
          <label class="form-label small fw-bold text-muted">Senha</label>
          <input v-model="novoUsuario.senha" type="password" class="form-control form-control-sm" placeholder="Mínimo 6 caracteres" minlength="6" required />
        </div>

        <div class="col-12 col-md-4">
          <label class="form-label small fw-bold text-muted">Perfil</label>
          <select v-model="novoUsuario.perfil_id" class="form-select form-select-sm" required>
            <option value="" disabled>Selecione...</option>
            <option v-for="perfil in perfis" :key="perfil.id" :value="perfil.id">
              {{ perfil.nome }}
            </option>
          </select>
        </div>

        <div class="col-12 col-md-4">
          <label class="form-label small fw-bold text-muted">Departamento</label>
          <select v-model="novoUsuario.departamento_id" class="form-select form-select-sm">
            <option value="">Selecione o departamento (opcional)...</option>
            <option v-for="dept in departamentos" :key="dept.id" :value="dept.id">
              {{ dept.nome }}
            </option>
          </select>
        </div>

        <div class="col-12">
          <div v-if="mensagemUsuario" class="alert alert-success py-2 small" role="alert">{{ mensagemUsuario }}</div>
          <div v-if="erroUsuario" class="alert alert-danger py-2 small" role="alert">{{ erroUsuario }}</div>

          <button type="submit" class="btn btn-primary btn-sm fw-bold px-4 py-2" :disabled="cadastrando">
            {{ cadastrando ? 'Cadastrando...' : 'Cadastrar usuário' }}
          </button>
        </div>
      </form>
    </div>

    <hr class="text-muted opacity-25 my-4" />

    <!-- Seção: Usuários Cadastrados -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="fw-bold text-dark mb-0">Usuários Cadastrados</h5>
    </div>

    <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0 text-nowrap">
          <thead class="table-light text-uppercase fs-7 text-muted">
            <tr>
              <th class="py-3 ps-3">Nome</th>
              <th class="py-3">E-mail</th>
              <th class="py-3">Perfil</th>
              <th class="py-3">Status</th>
              <th class="py-3">Apagar mensagens</th>
              <th class="py-3 text-end pe-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="usuarios.length === 0">
              <td colspan="6" class="text-center py-4 text-muted">Nenhum usuário encontrado.</td>
            </tr>
            <tr v-for="usuario in usuarios" :key="usuario.id">
              <td class="ps-3 fw-semibold text-dark">{{ usuario.nome }}</td>
              <td class="text-secondary">{{ usuario.email }}</td>
              <td>
                <span class="badge bg-secondary-subtle text-dark border">{{ usuario.perfil }}</span>
              </td>
              <td>
                <span class="badge" :class="usuario.ativo ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'">
                  {{ usuario.ativo ? 'Ativo' : 'Bloqueado' }}
                </span>
              </td>
         
              <td>
                <span v-if="usuario.perfil === 'ADM'" class="text-muted small">Sempre permitido</span>
         
                <button
                  v-else-if="usuario.podeapagarmensagens"
                  class="btn btn-sm btn-outline-danger py-1 px-2 fs-7"
                  @click="bloquearApagar(usuario)"
                >
                  Bloquear apagar
                </button>
                <button
                  v-else
                  class="btn btn-sm btn-outline-success py-1 px-2 fs-7"
                  @click="permitirApagar(usuario)"
                >
                  Permitir apagar
                </button>
              </td>
         
              <td class="text-end pe-3">
                <button
                  v-if="usuario.ativo"
                  class="btn btn-sm btn-outline-danger py-1 px-2 fs-7"
                  @click="bloquearConta(usuario.id)"
                >
                  Bloquear conta
                </button>
                <button
                  v-else
                  class="btn btn-sm btn-outline-success py-1 px-2 fs-7"
                  @click="desbloquearConta(usuario.id)"
                >
                  Desbloquear conta
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Voltar -->
    <button class="btn btn-light border btn-sm px-3 py-2 text-secondary" @click="voltarParaLogin">
      ← Voltar para o login
    </button>

  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { logout } from '@/services/authServices.js'
import { useConfiguracoes } from '@/composables/useConfiguracoes.js'
import { useUsuarios } from '@/composables/useUsuarios.js'

const router = useRouter()

// Usando o seu composable existente
const {
  configuracoes,
  carregando,
  salvando,
  mensagem,
  erro,
  carregarConfiguracoes,
  salvarConfiguracoes,
  rotuloConfiguracao
} = useConfiguracoes()

// Usando o novo composable criado para usuários
const {
  perfis,
  usuarios,
  departamentos,
  cadastrando,
  mensagemUsuario,
  erroUsuario,
  novoUsuario,
  carregarPerfis,
  carregarUsuarios,
  carregarDepartamentos,
  cadastrarNovoUsuario,
  bloquearConta,
  desbloquearConta,
  permitirApagar,
  bloquearApagar
} = useUsuarios()

function voltarParaLogin() {
  logout()
  router.push('/')
}

onMounted(() => {
  carregarConfiguracoes()
  carregarPerfis()
  carregarUsuarios()
  carregarDepartamentos()
})
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