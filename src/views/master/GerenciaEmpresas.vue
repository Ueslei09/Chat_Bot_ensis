<template>
  <div class="container py-3 py-md-4 animate-fade-in" style="max-width: 1200px;">
    
    <!-- Cabeçalho & Ações do Topo -->
    <div class="d-flex flex-column gap-3 mb-4">
      
      <!-- Título -->
      <div>
        <h2 class="fw-bold text-white mb-1 fs-3">🏢 Painel Master</h2>
      </div>
      
      <!-- Linha de Controles: Abas e Botões (Totalmente Responsivo) -->
      <div class="d-flex flex-column flex-lg-row justify-content-between align-stretch align-lg-center gap-3 bg-dark bg-opacity-50 p-3 rounded-4 border border-secondary border-opacity-25">
        
        <!-- Abas com rolagem suave no mobile -->
        <div class="d-flex overflow-x-auto gap-1 pb-1 pb-lg-0 scrollbar-none">
          <button @click="abaAtiva = 'empresas'" :class="['btn btn-sm fw-bold px-3 py-2 text-nowrap d-flex align-items-center gap-1', abaAtiva === 'empresas' ? 'btn-light text-primary shadow-sm' : 'text-light bg-transparent border-0']">
            <span>🏢</span> Ativas
          </button>
          <button @click="abaAtiva = 'comercial'" :class="['btn btn-sm fw-bold px-3 py-2 text-nowrap d-flex align-items-center gap-1', abaAtiva === 'comercial' ? 'btn-light text-primary shadow-sm' : 'text-light bg-transparent border-0']">
            <span>📈</span> Leads
          </button>
          <button @click="abaAtiva = 'inadimplencia'" :class="['btn btn-sm fw-bold px-3 py-2 text-nowrap d-flex align-items-center gap-1', abaAtiva === 'inadimplencia' ? 'btn-light text-primary shadow-sm' : 'text-light bg-transparent border-0']">
            <span>🚨</span> Alertas
          </button>
          <button @click="abaAtiva = 'extrato'" :class="['btn btn-sm fw-bold px-3 py-2 text-nowrap d-flex align-items-center gap-1', abaAtiva === 'extrato' ? 'btn-light text-primary shadow-sm' : 'text-light bg-transparent border-0']">
            <span>📊</span> Extrato
          </button>
        </div>

        <!-- Botões de Ação do Lado Direito (Empilhados no celular, lado a lado no PC) -->
        <div class="d-flex flex-column flex-sm-row gap-2">
          <!-- ⚡ BOTÃO DINÂMICO DE MANUTENÇÃO GLOBAL -->
          <button 
            @click="alternarModoManutencaoGlobal" 
            :class="['btn btn-sm fw-bold px-3 py-2 text-nowrap', modoManutencaoAtivo ? 'btn-danger pulse-animation' : 'btn-outline-light']"
          >
            {{ modoManutencaoAtivo ? '🛑 Desligar Manutenção' : '⚡ Ligar Manutenção' }}
          </button>

          <button v-if="abaAtiva === 'empresas'" @click="abrirModalEmpresa = true" class="btn btn-primary btn-sm fw-bold px-3 text-nowrap">➕ Nova Empresa</button>
          <button v-if="abaAtiva === 'comercial'" @click="abrirModalLead = true" class="btn btn-primary btn-sm fw-bold px-3 text-nowrap">➕ Novo Lead</button>
        </div>

      </div>
    </div>

    <!-- ABA 1: EMPRESAS CADASTRADAS (LAYOUT EM CARDS MODERNOS UX) -->
    <div v-if="abaAtiva === 'empresas'">
      
      <div v-if="empresas.length === 0" class="text-center text-muted py-5 bg-white rounded-4 shadow-sm">
        <p class="mb-0">Nenhuma empresa cadastrada.</p>
      </div>

      <div class="row g-3">
        <div v-for="empresa in empresas" :key="empresa.id" class="col-12 col-md-6 col-xl-4">
          <div class="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white d-flex flex-column justify-content-between transition-card">
            
            <!-- Topo do Card: ID e Status -->
            <div>
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="badge bg-light text-secondary border font-monospace">#{{ templateIdFix(empresa.id) }}</span>
                <span :class="['badge px-2 py-1', empresa.ativo ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle']">
                  ● {{ empresa.ativo ? 'Ativa' : 'Bloqueada' }}
                </span>
              </div>

              <!-- Nome da Empresa e Data -->
              <h5 class="fw-bold text-dark mb-1 text-truncate" :title="empresa.nome">{{ empresa.nome }}</h5>
              <p class="small text-muted mb-3">Cadastrada em: {{ new Date(empresa.criado_em).toLocaleDateString('pt-BR') }}</p>
            </div>

            <!-- Rodapé do Card: Ações Claras e Espaçadas -->
            <div class="pt-3 border-top d-flex gap-2">
              <button @click="prepararProvisao(empresa)" class="btn btn-sm btn-outline-primary flex-fill fw-semibold py-2">
                💰 Parcela
              </button>
              <button @click="alternarStatus(empresa)" :class="['btn btn-sm flex-fill fw-semibold py-2', empresa.ativo ? 'btn-outline-danger' : 'btn-outline-success']">
                {{ empresa.ativo ? '⛔ Bloquear' : '⚡ Liberar' }}
              </button>
              <button @click="deletarEmpresa(empresa.id, empresa.nome)" class="btn btn-sm btn-outline-secondary px-2 py-2" title="Excluir Empresa">
                🗑️
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>

    <!-- ABA 2: COMERCIAL -->
    <div v-if="abaAtiva === 'comercial'" class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light text-uppercase fs-7 text-muted">
            <tr>
              <th class="py-3 ps-3">ID</th>
              <th class="py-3">Empresa em Potencial</th>
              <th class="py-3 d-none d-sm-table-cell">Responsável</th>
              <th class="py-3 d-none d-md-table-cell">Segmento</th>
              <th class="py-3 text-end pe-3">Telefone</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lead in leads" :key="lead.id">
              <td class="ps-3 fw-semibold text-secondary">#{{ lead.id }}</td>
              <td><strong class="text-dark text-break">{{ lead.nome_empresa }}</strong></td>
              <td class="text-secondary d-none d-sm-table-cell">{{ lead.nome_responsavel }}</td>
              <td class="d-none d-md-table-cell"><span class="badge bg-secondary-subtle text-secondary border">{{ lead.segmento || 'Não Informado' }}</span></td>
              <td class="text-end pe-3 font-monospace text-muted text-nowrap">{{ lead.telefone }}</td>
            </tr>
            <tr v-if="leads.length === 0">
              <td colspan="5" class="text-center text-muted py-4">Nenhum lead comercial cadastrado.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ABA 3: INADIMPLÊNCIA -->
    <div v-if="abaAtiva === 'inadimplencia'" class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light text-uppercase fs-7 text-muted">
            <tr>
              <th class="py-3 ps-3">ID</th>
              <th class="py-3">Empresa</th>
              <th class="py-3 d-none d-sm-table-cell">Vencimento</th>
              <th class="py-3">Atraso</th>
              <th class="py-3 d-none md-table-cell">Parcela</th>
              <th class="py-3">Valor Devido</th>
              <th class="py-3 text-end pe-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inadimplente in inadimplentes" :key="inadimplente.id">
              <td class="ps-3 fw-semibold text-secondary">#{{ inadimplente.id }}</td>
              <td><strong class="text-danger text-break">{{ inadimplente.nome }}</strong></td>
              <td class="text-muted d-none d-sm-table-cell text-nowrap">{{ new Date(inadimplente.data_vencimento).toLocaleDateString('pt-BR') }}</td>
              <td><span class="badge bg-danger-subtle text-danger border border-danger-subtle text-nowrap">{{ inadimplente.dias_atraso }} dias</span></td>
              <td class="d-none md-table-cell"><span class="badge bg-secondary-subtle text-secondary border">{{ inadimplente.numero_parcela || 'Mensalidade' }}</span></td>
              <td class="fw-bold text-dark text-nowrap">R$ {{ Number(inadimplente.valor).toFixed(2) }}</td>
              <td class="text-end pe-3">
                <div class="d-inline-flex flex-wrap justify-content-end gap-1">
                  <button @click="confirmarBaixaPagamento(inadimplente.id, inadimplente.nome)" class="btn btn-sm btn-success py-1 px-2 fs-7 fw-bold text-nowrap">✅ Baixar</button>
                  <button @click="bloquearPorInadimplencia(inadimplente)" class="btn btn-sm btn-outline-danger py-1 px-2 fs-7 text-nowrap">Suspender</button>
                </div>
              </td>
            </tr>
            <tr v-if="inadimplentes.length === 0">
              <td colspan="7" class="text-center text-success fw-bold py-4">🎉 Nenhuma conta vencida!</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ABA 4: EXTRATO GERAL DE LANÇAMENTOS -->
    <div v-if="abaAtiva === 'extrato'" class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light text-uppercase fs-7 text-muted">
            <tr>
              <th class="py-3 ps-3">ID</th>
              <th class="py-3">Empresa</th>
              <th class="py-3 d-none d-sm-table-cell">Parcela</th>
              <th class="py-3">Valor</th>
              <th class="py-3 d-none d-md-table-cell">Vencimento</th>
              <th class="py-3">Status</th>
              <th class="py-3 text-end pe-3">Ação</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="fatura in todasFaturas" :key="fatura.id">
              <td class="ps-3 fw-semibold text-secondary">#{{ fatura.id }}</td>
              <td><strong class="text-dark text-break">{{ fatura.empresa_nome }}</strong></td>
              <td class="d-none d-sm-table-cell"><span class="badge bg-secondary-subtle text-secondary border">{{ fatura.numero_parcela || 'Mensalidade' }}</span></td>
              <td class="fw-bold text-dark text-nowrap">R$ {{ Number(fatura.valor).toFixed(2) }}</td>
              <td class="text-muted d-none d-md-table-cell text-nowrap">{{ new Date(fatura.data_vencimento).toLocaleDateString('pt-BR') }}</td>
              <td>
                <span :class="['badge text-nowrap', fatura.status === 'PAGO' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-warning-subtle text-warning border border-warning-subtle']">
                  {{ fatura.status }}
                </span>
              </td>
              <td class="text-end pe-3">
                <button v-if="fatura.status === 'PENDENTE'" @click="confirmarBaixaPagamento(fatura.id, fatura.empresa_nome)" class="btn btn-sm btn-outline-primary py-1 px-2 fs-7 fw-bold text-nowrap">
                  💸 Receber
                </button>
                <span v-else class="text-success small fw-bold text-nowrap">✔ Liquidado</span>
              </td>
            </tr>
            <tr v-if="todasFaturas.length === 0">
              <td colspan="7" class="text-center text-muted py-4">Nenhum lançamento encontrado.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL: LANÇAMENTO MANUAL DE PROVISÃO -->
    <div v-if="abrirModalProvisao" class="modal-backdrop show"></div>
    <div v-if="abrirModalProvisao" class="modal fade show d-block px-3" tabindex="-1" @click.self="abrirModalProvisao = false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow rounded-4 p-3">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold text-dark fs-5">💰 Provisão - {{ empresaSelecionada?.nome }}</h5>
            <button type="button" class="btn-close" @click="abrirModalProvisao = false"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="salvarProvisaoManual">
              <div class="mb-3">
                <label class="form-label small fw-bold text-muted">Valor da Parcela / Mensalidade</label>
                <input v-model="formProvisao.valor" type="number" step="0.01" class="form-control form-control-sm" placeholder="Ex: 299.90" required />
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold text-muted">Data de Vencimento Pactuada</label>
                <input v-model="formProvisao.data_vencimento" type="date" class="form-control form-control-sm" required />
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold text-muted">Identificador da Parcela</label>
                <select v-model="formProvisao.numero_parcela" class="form-select form-select-sm">
                  <option v-for="n in 12" :key="n" :value="`${n}/12`">{{ n }}ª Parcela ({{ n }}/12)</option>
                  <option value="Adesão">Taxa de Adesão / Instalação</option>
                </select>
              </div>
              <div class="form-check mb-3">
                <input v-model="formProvisao.ja_pago" type="checkbox" class="form-check-input" id="ja_pago" />
                <label class="form-check-label small fw-bold text-muted" for="ja_pago">Esta parcela já foi paga à vista?</label>
              </div>
              <div class="d-flex justify-content-end gap-2 pt-2">
                <button type="button" @click="abrirModalProvisao = false" class="btn btn-secondary btn-sm px-3">Cancelar</button>
                <button type="submit" class="btn btn-primary btn-sm px-4 fw-bold" :disabled="carregando">Lançar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: NOVA EMPRESA -->
    <div v-if="abrirModalEmpresa" class="modal-backdrop show"></div>
    <div v-if="abrirModalEmpresa" class="modal fade show d-block px-3" tabindex="-1" @click.self="abrirModalEmpresa = false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow rounded-4 p-3">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold text-dark fs-5">Cadastrar Novo Cliente SaaS</h5>
            <button type="button" class="btn-close" @click="abrirModalEmpresa = false"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="salvarNovaEmpresa">
              <div class="mb-3">
                <label class="form-label small fw-bold text-muted">Nome da Empresa</label>
                <input v-model="formEmpresa.nomeEmpresa" type="text" class="form-control form-control-sm" required />
              </div>
              <hr class="text-muted opacity-25 my-3" />
              <div class="mb-3">
                <label class="form-label small fw-bold text-muted">Nome do Dono</label>
                <input v-model="formEmpresa.nomeDono" type="text" class="form-control form-control-sm" required />
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold text-muted">E-mail de Login</label>
                <input v-model="formEmpresa.emailDono" type="email" class="form-control form-control-sm" required />
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold text-muted">Senha Provisória</label>
                <input v-model="formEmpresa.senhaDono" type="password" class="form-control form-control-sm" required />
              </div>
              <div class="d-flex justify-content-end gap-2 pt-2">
                <button type="button" @click="abrirModalEmpresa = false" class="btn btn-secondary btn-sm px-3">Cancelar</button>
                <button type="submit" class="btn btn-primary btn-sm px-4 fw-bold" :disabled="carregando">Cadastrar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: NOVO LEAD COMERCIAL -->
    <div v-if="abrirModalLead" class="modal-backdrop show"></div>
    <div v-if="abrirModalLead" class="modal fade show d-block px-3" tabindex="-1" @click.self="abrirModalLead = false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow rounded-4 p-3">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold text-dark fs-5">📈 Novo Lead Comercial</h5>
            <button type="button" class="btn-close" @click="abrirModalLead = false"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="salvarNovoLead">
              <div class="mb-3">
                <label class="form-label small fw-bold text-muted">Nome da Empresa</label>
                <input v-model="formLead.nomeEmpresa" type="text" class="form-control form-control-sm" required />
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold text-muted">Nome do Responsável</label>
                <input v-model="formLead.nomeResponsavel" type="text" class="form-control form-control-sm" required />
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold text-muted">Segmento</label>
                <input v-model="formLead.segmento" type="text" class="form-control form-control-sm" />
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold text-muted">Telefone / WhatsApp</label>
                <input v-model="formLead.telefone" type="text" class="form-control form-control-sm" required />
              </div>
              <div class="d-flex justify-content-end gap-2 pt-2">
                <button type="button" @click="abrirModalLead = false" class="btn btn-secondary btn-sm px-3">Cancelar</button>
                <button type="submit" class="btn btn-primary btn-sm px-4 fw-bold" :disabled="carregando">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { useGerenciarEmpresa } from '@/Composables/useGerenciarEmpresa'

const {
  abaAtiva,
  empresas,
  leads,
  inadimplentes,
  todasFaturas,
  abrirModalEmpresa,
  abrirModalLead,
  abrirModalProvisao,
  carregando,
  empresaSelecionada,
  formEmpresa,
  formLead,
  formProvisao,
  templateIdFix,
  confirmarBaixaPagamento,
  prepararProvisao,
  salvarProvisaoManual,
  salvarNovaEmpresa,
  salvarNovoLead,
  alternarStatus,
  bloquearPorInadimplencia,
  deletarEmpresa,
  modoManutencaoAtivo,
  alternarModoManutencaoGlobal
} = useGerenciarEmpresa()
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.fs-7 {
  font-size: 0.75rem;
}
.pulse-animation {
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>