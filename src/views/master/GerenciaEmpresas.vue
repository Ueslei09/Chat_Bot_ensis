<template>
  <div class="master-container animate-fade-in">
    <div class="header-actions">
      <h2>🏢 Painel Master</h2>
      
      <!-- Controle de Abas Fluido com Rolagem Opcional -->
      <div class="tabs-control">
        <button @click="abaAtiva = 'empresas'" :class="{ active: abaAtiva === 'empresas' }">🏢 Ativas</button>
        <button @click="abaAtiva = 'comercial'" :class="{ active: abaAtiva === 'comercial' }">📈 Leads</button>
        <button @click="abaAtiva = 'inadimplencia'" :class="{ active: abaAtiva === 'inadimplencia' }">🚨 Alertas</button>
        <button @click="abaAtiva = 'extrato'" :class="{ active: abaAtiva === 'extrato' }">📊 Extrato</button>
      </div>

      <div class="botoes-topo-acao">
        <button v-if="abaAtiva === 'empresas'" @click="abrirModalEmpresa = true" class="btn-primary w-100-mobile">➕ Nova Empresa</button>
        <button v-if="abaAtiva === 'comercial'" @click="abrirModalLead = true" class="btn-primary w-100-mobile">➕ Novo Lead</button>
      </div>
    </div>

    <!-- ABA 1: EMPRESAS CADASTRADAS -->
    <!-- ABA 1: EMPRESAS CADASTRADAS -->
    <div v-if="abaAtiva === 'empresas'" class="table-container">
      <table class="tabela-responsiva">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome da Empresa</th>
            <th>Data de Cadastro</th>
            <th>Status de Acesso</th>
            <th class="text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="empresa in empresas" :key="empresa.id" class="linha-card-mobile">
            <td data-label="ID:">{{ templateIdFix(empresa.id) }}</td>
            <td data-label="Empresa:"><strong>{{ empresa.nome }}</strong></td>
            <td data-label="Cadastro:">{{ new Date(empresa.criado_em).toLocaleDateString('pt-BR') }}</td>
            <td data-label="Status:">
              <span :class="['badge', empresa.ativo ? 'badge-ativo' : 'badge-inativo']">
                {{ empresa.ativo ? 'Ativa / Comercial' : 'Bloqueada / Inadimplente' }}
              </span>
            </td>
            <td data-label="Ações:" class="text-center acoes-flex-mobile">
              <button @click="prepararProvisao(empresa)" class="btn-financeiro">💰 Parcela</button>
              <button @click="alternarStatus(empresa)" :class="['btn-status', empresa.ativo ? 'btn-bloquear' : 'btn-ativar']">
                {{ empresa.ativo ? '⛔ Bloquear' : '⚡ Liberar' }}
              </button>
              <button @click="deletarEmpresa(empresa.id, empresa.nome)" class="btn-deletar-card">🗑️ Excluir</button>
            </td>
          </tr>
          <tr v-if="empresas.length === 0">
            <td colspan="5" class="text-center" style="color: #64748b; padding: 20px;">Nenhuma empresa cadastrada.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ABA 2: COMERCIAL -->
    <div v-if="abaAtiva === 'comercial'" class="table-container">
      <table class="tabela-responsiva">
        <thead>
          <tr>
            <th>ID</th>
            <th>Empresa em Potencial</th>
            <th>Responsável</th>
            <th>Segmento</th>
            <th>Telefone</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lead in leads" :key="lead.id" class="linha-card-mobile">
            <td data-label="ID"><span>#{{ lead.id }}</span></td>
            <td data-label="Potencial"><span><strong>{{ lead.nome_empresa }}</strong></span></td>
            <td data-label="Responsável"><span>{{ lead.nome_responsavel }}</span></td>
            <td data-label="Segmento"><span><span class="badge-segmento">{{ lead.segmento || 'Não Informado' }}</span></span></td>
            <td data-label="Telefone"><span>{{ lead.telefone }}</span></td>
          </tr>
          <tr v-if="leads.length === 0">
            <td colspan="5" class="text-center" style="color: #64748b; padding: 20px;">Nenhum lead comercial cadastrado.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ABA 3: INADIMPLÊNCIA -->
    <div v-if="abaAtiva === 'inadimplencia'" class="table-container">
      <table class="tabela-responsiva">
        <thead>
          <tr>
            <th>ID Fatura</th>
            <th>Empresa</th>
            <th>Vencimento</th>
            <th>Atraso</th>
            <th>Parcela</th>
            <th>Valor Devido</th>
            <th class="text-center">Ações Rápidas</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inadimplente in inadimplentes" :key="inadimplente.id" class="linha-card-mobile">
            <td data-label="ID Fatura"><span>#{{ inadimplente.id }}</span></td>
            <td data-label="Empresa"><span><strong style="color: #ef4444;">{{ inadimplente.nome }}</strong></span></td>
            <td data-label="Vencimento"><span>{{ new Date(inadimplente.data_vencimento).toLocaleDateString('pt-BR') }}</span></td>
            <td data-label="Atraso"><span><span class="badge-atraso">{{ inadimplente.dias_atraso }} dias</span></span></td>
            <td data-label="Parcela"><span><span class="badge-segmento">{{ inadimplente.numero_parcela || 'Mensalidade' }}</span></span></td>
            <td data-label="Valor Devido"><span>R$ {{ Number(inadimplente.valor).toFixed(2) }}</span></td>
            <td data-label="Ações" class="text-center acoes-flex-mobile">
              <button @click="confirmarBaixaPagamento(inadimplente.id, inadimplente.nome)" class="btn-ativar-baixa">
                ✅ Baixar e Reativar
              </button>
              <button @click="bloquearPorInadimplencia(inadimplente)" class="btn-deletar">Suspender</button>
            </td>
          </tr>
          <tr v-if="inadimplentes.length === 0">
            <td colspan="7" class="text-center" style="color: #22c55e; padding: 20px; font-weight: bold;">🎉 Nenhuma conta agendada vencida!</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ABA 4: EXTRATO GERAL DE LANÇAMENTOS -->
    <div v-if="abaAtiva === 'extrato'" class="table-container">
      <table class="tabela-responsiva">
        <thead>
          <tr>
            <th>ID Lançamento</th>
            <th>Empresa</th>
            <th>Parcela</th>
            <th>Valor</th>
            <th>Vencimento</th>
            <th>Data Pagamento</th>
            <th>Status</th>
            <th class="text-center">Ação</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="fatura in todasFaturas" :key="fatura.id" class="linha-card-mobile">
            <td data-label="ID Lançamento"><span>#{{ fatura.id }}</span></td>
            <td data-label="Empresa"><span><strong>{{ fatura.empresa_nome }}</strong></span></td>
            <td data-label="Parcela"><span><span class="badge-segmento">{{ fatura.numero_parcela || 'Mensalidade' }}</span></span></td>
            <td data-label="Valor"><span>R$ {{ Number(fatura.valor).toFixed(2) }}</span></td>
            <td data-label="Vencimento"><span>{{ new Date(fatura.data_vencimento).toLocaleDateString('pt-BR') }}</span></td>
            <td data-label="Pagamento"><span>{{ fatura.data_pagamento ? new Date(fatura.data_pagamento).toLocaleDateString('pt-BR') : '—' }}</span></td>
            <td data-label="Status">
              <span :class="['badge', fatura.status === 'PAGO' ? 'badge-ativo' : 'badge-pendente']">
                {{ fatura.status }}
              </span>
            </td>
            <td data-label="Ação" class="text-center acoes-flex-mobile full-width-mobile">
              <button v-if="fatura.status === 'PENDENTE'" @click="confirmarBaixaPagamento(fatura.id, fatura.empresa_nome)" class="btn-financeiro-receber">
                💸 Receber
              </button>
              <span v-else class="liquidado-badge">✔ Liquidado</span>
            </td>
          </tr>
          <tr v-if="todasFaturas.length === 0">
            <td colspan="8" class="text-center" style="color: #64748b; padding: 20px;">Nenhum lançamento financeiro encontrado.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL: LANÇAMENTO MANUAL DE PROVISÃO -->
    <div v-if="abrirModalProvisao" class="modal-overlay" @click.self="abrirModalProvisao = false">
      <div class="modal-content">
        <h3>💰 Provisão Manual - {{ empresaSelecionada?.nome }}</h3>
        <form @submit.prevent="salvarProvisaoManual">
          <div class="form-group">
            <label>Valor da Parcela / Mensalidade</label>
            <input v-model="formProvisao.valor" type="number" step="0.01" placeholder="Ex: 299.90" required />
          </div>
          <div class="form-group">
            <label>Data de Vencimento Pactuada</label>
            <input v-model="formProvisao.data_vencimento" type="date" required />
          </div>
          <div class="form-group">
            <label>Identificador da Parcela</label>
            <select v-model="formProvisao.numero_parcela">
              <option v-for="n in 12" :key="n" :value="`${n}/12`">{{ n }}ª Parcela ({{ n }}/12)</option>
              <option value="Adesão">Taxa de Adesão / Instalação</option>
            </select>
          </div>
          <div class="form-group checkbox-row">
            <input v-model="formProvisao.ja_pago" type="checkbox" id="ja_pago" />
            <label for="ja_pago">Esta parcela já foi paga à vista? (Liquidar hoje)</label>
          </div>
          <div class="modal-actions">
            <button type="button" @click="abrirModalProvisao = false" class="btn-cancelar">Cancelar</button>
            <button type="submit" class="btn-salvar" :disabled="carregando">Lançar no Financeiro</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL: NOVA EMPRESA -->
    <div v-if="abrirModalEmpresa" class="modal-overlay" @click.self="abrirModalEmpresa = false">
      <div class="modal-content">
        <h3>Cadastrar Novo Cliente SaaS</h3>
        <form @submit.prevent="salvarNovaEmpresa">
          <div class="form-group">
            <label>Nome da Empresa</label>
            <input v-model="formEmpresa.nomeEmpresa" type="text" required />
          </div>
          <hr class="modal-divider" />
          <div class="form-group">
            <label>Nome do Dono</label>
            <input v-model="formEmpresa.nomeDono" type="text" required />
          </div>
          <div class="form-group">
            <label>E-mail de Login</label>
            <input v-model="formEmpresa.emailDono" type="email" required />
          </div>
          <div class="form-group">
            <label>Senha Provisória</label>
            <input v-model="formEmpresa.senhaDono" type="password" required />
          </div>
          <div class="modal-actions">
            <button type="button" @click="abrirModalEmpresa = false" class="btn-cancelar">Cancelar</button>
            <button type="submit" class="btn-salvar" :disabled="carregando">Confirmar e Ativar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL: NOVO LEAD COMERCIAL -->
    <div v-if="abrirModalLead" class="modal-overlay" @click.self="abrirModalLead = false">
      <div class="modal-content">
        <h3>📈 Cadastrar Novo Lead Comercial</h3>
        <form @submit.prevent="salvarNovoLead">
          <div class="form-group">
            <label>Nome da Empresa / Lead</label>
            <input v-model="formLead.nomeEmpresa" type="text" placeholder="Ex: Mercado Central" required />
          </div>
          <div class="form-group">
            <label>Nome do Responsável</label>
            <input v-model="formLead.nomeResponsavel" type="text" placeholder="Ex: João Silva" required />
          </div>
          <div class="form-group">
            <label>Segmento de Atuação</label>
            <input v-model="formLead.segmento" type="text" placeholder="Ex: Varejo / Tecnologia" />
          </div>
          <div class="form-group">
            <label>Telefone / WhatsApp</label>
            <input v-model="formLead.telefone" type="text" placeholder="Ex: 62999998888" required />
          </div>
          <div class="modal-actions">
            <button type="button" @click="abrirModalLead = false" class="btn-cancelar">Cancelar</button>
            <button type="submit" class="btn-salvar" :disabled="carregando">
              {{ carregando ? 'Salvando...' : 'Cadastrar Lead' }}
            </button>
          </div>
        </form>
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
  deletarEmpresa
} = useGerenciarEmpresa()
</script>

<style scoped>
/* ---------- LAYOUT ADAPTATIVO ---------- */
.master-container {
  padding: 16px;
  font-family: 'Segoe UI', Roboto, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
}
@media (min-width: 768px) {
  .master-container {
    padding: 30px;
  }
}

.header-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}
.header-actions h2 {
  font-size: 20px;
  margin: 0;
  color: #1e293b;
}
@media (min-width: 992px) {
  .header-actions {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.botoes-topo-acao {
  width: 100%;
}
@media (min-width: 992px) {
  .botoes-topo-acao {
    width: auto;
  }
}

.tabs-control {
  display: flex;
  gap: 4px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 8px;
  overflow-x: auto;
  white-space: nowrap;
  width: 100%;
}
@media (min-width: 992px) {
  .tabs-control {
    width: auto;
  }
}
.tabs-control button {
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  color: #64748b;
  background: transparent;
  font-size: 13px;
  transition: all 0.2s;
}
.tabs-control button.active {
  background: white;
  color: #1a3c6e;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.table-container {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

@media (max-width: 767px) {
  .tabela-responsiva thead {
    display: none;
  }
  .linha-card-mobile {
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border-bottom: 2px dashed #cbd5e1;
    padding: 16px;
    gap: 10px;
    margin-bottom: 12px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  }
  .tabela-responsiva tbody td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0 !important;
    border-bottom: none !important;
    font-size: 14px;
    color: #1e293b;
    text-align: right;
  }
  .tabela-responsiva tbody td::before {
    content: attr(data-label);
    font-weight: bold;
    color: #64748b;
    font-size: 12px;
    text-transform: uppercase;
  }
  .acoes-flex-mobile {
    display: grid !important;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    width: 100%;
    margin-top: 8px;
    border-top: 1px dashed #e2e8f0;
    padding-top: 12px !important;
  }
  .acoes-flex-mobile::before {
    display: none !important;
  }
  .btn-deletar-card {
    grid-column: span 2;
    background: #fee2e2;
    color: #b91c1c;
    border: none;
    padding: 8px !important;
    border-radius: 4px;
    width: 100%;
    text-align: center;
    font-weight: bold;
  }
}

@media (min-width: 768px) {
  table { width: 100%; border-collapse: collapse; text-align: left; }
  th, td { padding: 14px; border-bottom: 1px solid #e2e8f0; color: #334155; }
  th { background: #f8fafc; color: #64748b; font-size: 13px; }
  .btn-deletar-card { background: #fee2e2; color: #b91c1c; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
  .acoes-flex-mobile { display: table-cell; }
}

.btn-primary { background: #1a3c6e; color: white; border: none; padding: 11px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 14px; }
.w-100-mobile { width: 100%; }
@media (min-width: 992px) { .w-100-mobile { width: auto; } }

.btn-financeiro { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; margin-right: 4px; font-size: 13px; text-align: center; }
.btn-financeiro:hover { background: #dbeafe; }
.btn-financeiro-receber { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 13px; width: 100%; text-align: center; }

.badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; display: inline-block; }
.badge-ativo { background: #dcfce7; color: #15803d; }
.badge-pendente { background: #fef9c3; color: #713f12; }
.badge-inativo { background: #fee2e2; color: #b91c1c; }
.badge-atraso { background: #fff1f2; color: #e11d48; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
.badge-segmento { background: #f1f5f9; color: #475569; padding: 4px 8px; border-radius: 4px; font-size: 12px; }

.btn-status { border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 13px; text-align: center; }
.btn-bloquear { background: #fff5f5; color: #e53e3e; }
.btn-ativar { background: #f0fff4; color: #38a169; }
.btn-ativar-baixa { background: #f0fff4; color: #38a169; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; text-align: center; font-size: 13px; }
.btn-deletar { background: #fee2e2; color: #b91c1c; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 13px; }

.liquidado-badge { color: #15803d; font-size: 13px; font-weight: bold; display: block; text-align: center; width: 100%; padding: 4px 0; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1060; padding: 16px; }
.modal-content { background: white; padding: 24px; border-radius: 12px; width: 100%; max-width: 450px; color: #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.15); }
.modal-content h3 { margin: 0 0 16px; color: #1e293b; font-size: 18px; }
.form-group { margin-bottom: 14px; display: flex; flex-direction: column; }
.form-group label { margin-bottom: 5px; font-weight: 600; color: #475569; font-size: 13px; }
.form-group input, .form-group select { padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; outline: none; }
.form-group input:focus, .form-group select:focus { border-color: #1a3c6e; }
.checkbox-row { flex-direction: row !important; gap: 8px; align-items: center; margin-top: 10px; }
.checkbox-row label { margin: 0; cursor: pointer; font-size: 13px; color: #334155; }
.checkbox-row input { cursor: pointer; width: 16px; height: 16px; }
.modal-divider { margin: 16px 0; border: none; border-top: 1px solid #e2e8f0; }

.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.btn-cancelar { background: #e2e8f0; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; color: #475569; font-weight: bold; font-size: 14px; }
.btn-salvar { background: #1a3c6e; color: white; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 14px; }
.btn-salvar:disabled { opacity: 0.6; cursor: not-allowed; }

.text-center { text-align: center; }
.text-right { text-align: right; }

.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
</style>