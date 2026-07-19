<template>
  <div class="master-container">
    <div class="header-actions">
      <h2>🏢 Painel Master : Gereciamento/Financeiro</h2>
      
      <div class="tabs-control">
        <button @click="abaAtiva = 'empresas'" :class="{ active: abaAtiva === 'empresas' }">🏢 Ativas</button>
        <button @click="abaAtiva = 'comercial'" :class="{ active: abaAtiva === 'comercial' }">📈 Comercial / Leads</button>
        <button @click="abaAtiva = 'inadimplencia'" :class="{ active: abaAtiva === 'inadimplencia' }">🚨 Inadimplência</button>
        <button @click="abaAtiva = 'extrato'" :class="{ active: abaAtiva === 'extrato' }">📊 Lançamentos / Extrato</button>
      </div>

      <button v-if="abaAtiva === 'empresas'" @click="abrirModalEmpresa = true" class="btn-primary">➕ Nova Empresa</button>
      <button v-if="abaAtiva === 'comercial'" @click="abrirModalLead = true" class="btn-primary">➕ Novo Lead</button>
    </div>

    <!-- ABA 1: EMPRESAS CADASTRADAS -->
    <div v-if="abaAtiva === 'empresas'" class="table-container">
      <table>
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
          <tr v-for="empresa in empresas" :key="empresa.id">
            <td>#{{ templateIdFix(empresa.id) }}</td>
            <td><strong>{{ empresa.nome }}</strong></td>
            <td>{{ new Date(empresa.criado_em).toLocaleDateString('pt-BR') }}</td>
            <td>
              <span :class="['badge', empresa.ativo ? 'badge-ativo' : 'badge-inativo']">
                {{ empresa.ativo ? 'Ativa / Comercial' : 'Bloqueada / Inadimplente' }}
              </span>
            </td>
            <td class="text-center">
              <button @click="prepararProvisao(empresa)" class="btn-financeiro">💰 Lançar Parcela</button>
              <button @click="alternarStatus(empresa)" :class="['btn-status', empresa.ativo ? 'btn-bloquear' : 'btn-ativar']">
                {{ empresa.ativo ? '⛔ Bloquear' : '⚡ Desbloquear' }}
              </button>
              <button @click="deletarEmpresa(empresa.id, empresa.nome)" class="btn-deletar">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ABA 2: COMERCIAL -->
    <div v-if="abaAtiva === 'comercial'" class="table-container">
      <table>
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
          <tr v-for="lead in leads" :key="lead.id">
            <td>#{{ lead.id }}</td>
            <td><strong>{{ lead.nome_empresa }}</strong></td>
            <td>{{ lead.nome_responsavel }}</td>
            <td><span class="badge-segmento">{{ lead.segmento || 'Não Informado' }}</span></td>
            <td>{{ lead.telefone }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ABA 3: INADIMPLÊNCIA -->
    <div v-if="abaAtiva === 'inadimplencia'" class="table-container">
      <table>
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
          <tr v-for="inadimplente in inadimplentes" :key="inadimplente.id">
            <td>#{{ inadimplente.id }}</td>
            <td><strong style="color: #ef4444;">{{ inadimplente.nome }}</strong></td>
            <td>{{ new Date(inadimplente.data_vencimento).toLocaleDateString('pt-BR') }}</td>
            <td><span class="badge-atraso">{{ inadimplente.dias_atraso }} dias</span></td>
            <td><span class="badge-segmento">{{ inadimplente.numero_parcela || 'Mensalidade' }}</span></td>
            <td style="font-weight: bold; color: #f43f5e;">R$ {{ Number(inadimplente.valor).toFixed(2) }}</td>
            <td class="text-center">
              <!-- ⚡ NOVO BOTÃO: Confirmar pagamento direto do inadimplente -->
              <button @click="confirmarBaixaPagamento(inadimplente.id, inadimplente.nome)" class="btn-ativar" style="border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-weight:bold; margin-right:5px;">
                ✅ Baixar e Reativar
              </button>
              <button @click="bloquearPorInadimplencia(inadimplente)" class="btn-deletar">🚫 Suspender</button>
            </td>
          </tr>
          <tr v-if="inadimplentes.length === 0">
            <td colspan="7" class="text-center" style="color: #22c55e; padding: 20px; font-weight: bold;">🎉 Nenhuma conta agendada vencida!</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 📊 ABA 4: EXTRATO GERAL DE LANÇAMENTOS -->
    <div v-if="abaAtiva === 'extrato'" class="table-container">
      <table>
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
          <tr v-for="fatura in todasFaturas" :key="fatura.id">
            <td>#{{ fatura.id }}</td>
            <td><strong>{{ fatura.empresa_nome }}</strong></td>
            <td><span class="badge-segmento">{{ fatura.numero_parcela || 'Mensalidade' }}</span></td>
            <td style="font-weight: bold;">R$ {{ Number(fatura.valor).toFixed(2) }}</td>
            <td>{{ new Date(fatura.data_vencimento).toLocaleDateString('pt-BR') }}</td>
            <td>{{ fatura.data_pagamento ? new Date(fatura.data_pagamento).toLocaleDateString('pt-BR') : '—' }}</td>
            <td>
              <span :class="['badge', fatura.status === 'PAGO' ? 'badge-ativo' : 'badge-pendente']">
                {{ fatura.status }}
              </span>
            </td>
            <td class="text-center">
              <!-- ⚡ NOVO BOTÃO: Dar baixa em faturas pendentes futuras antes de vencerem -->
              <button v-if="fatura.status === 'PENDENTE'" @click="confirmarBaixaPagamento(fatura.id, fatura.empresa_nome)" class="btn-financeiro" style="margin:0; padding:4px 8px; font-size:12px;">
                💸 Receber
              </button>
              <span v-else style="color: #15803d; font-size: 13px; font-weight: bold;">✔ Liquidado</span>
            </td>
          </tr>
          <tr v-if="todasFaturas.length === 0">
            <td colspan="8" class="text-center" style="color: #64748b; padding: 20px;">Nenhum lançamento financeiro encontrado.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL: LANÇAMENTO MANUAL DE PROVISÃO -->
    <div v-if="abrirModalProvisao" class="modal-overlay">
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
          <div class="form-group" style="flex-direction: row; gap: 8px; align-items: center; margin-top: 10px;">
            <input v-model="formProvisao.ja_pago" type="checkbox" id="ja_pago" />
            <label for="ja_pago" style="margin: 0; cursor: pointer;">Esta parcela já foi paga à vista? (Liquidar hoje)</label>
          </div>
          <div class="modal-actions">
            <button type="button" @click="abrirModalProvisao = false" class="btn-cancelar">Cancelar</button>
            <button type="submit" class="btn-salvar" :disabled="carregando">Lançar no Financeiro</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL: NOVA EMPRESA -->
    <div v-if="abrirModalEmpresa" class="modal-overlay">
      <div class="modal-content">
        <h3>Cadastrar Novo Cliente SaaS</h3>
        <form @submit.prevent="salvarNovaEmpresa">
          <div class="form-group">
            <label>Nome da Empresa</label>
            <input v-model="formEmpresa.nomeEmpresa" type="text" required />
          </div>
          <hr />
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
            <button type="submit" class="btn-salvar">Confirmar e Ativar</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { api } from '@/services/api'; 

const abaAtiva = ref('empresas');
const empresas = ref([]);
const leads = ref([]);
const inadimplentes = ref([]);
const todasFaturas = ref([]); 

const abrirModalEmpresa = ref(false);
const abrirModalLead = ref(false);
const abrirModalProvisao = ref(false);
const carregando = ref(false);
const empresaSelecionada = ref(null);

const formEmpresa = reactive({ nomeEmpresa: '', nomeDono: '', emailDono: '', senhaDono: '' });
const formLead = reactive({ nomeEmpresa: '', nomeResponsavel: '', segmento: '', telefone: '' });
const formProvisao = reactive({ valor: '', data_vencimento: '', numero_parcela: '1/12', ja_pago: false });

const templateIdFix = (id) => id;

const carregarEmpresas = async () => {
  try { const res = await api.get('/admin/empresas'); empresas.value = res.data; } catch { alert('Erro ao carregar as empresas.'); }
};

const carregarLeads = async () => {
  try { const res = await api.get('/admin/empresas/comercial/leads'); leads.value = res.data; } catch { alert('Erro ao carregar os leads.'); }
};

const carregarInadimplentes = async () => {
  try { const res = await api.get('/admin/empresas/inadimplencia'); inadimplentes.value = res.data; } catch { alert('Erro ao carregar lista de inadimplência.'); }
};

const carregarTodasFaturas = async () => {
  try { const res = await api.get('/admin/empresas/financeiro/extrato'); todasFaturas.value = res.data; } catch { alert('Erro ao carregar o extrato financeiro.'); }
};

watch(abaAtiva, (novaAba) => {
  if (novaAba === 'empresas') carregarEmpresas();
  if (novaAba === 'comercial') carregarLeads();
  if (novaAba === 'inadimplencia') carregarInadimplentes();
  if (novaAba === 'extrato') carregarTodasFaturas(); 
});

// ⚡ NOVA FUNÇÃO: Dispara a rota do back-end para dar baixa e reativar
const confirmarBaixaPagamento = async (faturaId, nomeEmpresa) => {
  if (!confirm(`Confirmar o recebimento desta parcela da empresa "${nomeEmpresa}"? Isso irá reativar o acesso dela imediatamente.`)) return;
  try {
    const res = await api.put(`/admin/empresas/financeiro/liquidar/${faturaId}`);
    alert(res.data.msg || 'Pagamento confirmado!');
    
    // Recarrega a aba atual para sumir com o registro liquidado
    if (abaAtiva.value === 'inadimplencia') carregarInadimplentes();
    if (abaAtiva.value === 'extrato') carregarTodasFaturas();
  } catch (err) {
    alert(err.response?.data?.erro || 'Erro ao processar baixa do pagamento.');
  }
};

const prepararProvisao = (empresa) => {
  empresaSelecionada.value = empresa;
  formProvisao.valor = '';
  formProvisao.data_vencimento = '';
  formProvisao.numero_parcela = '1/12';
  formProvisao.ja_pago = false;
  abrirModalProvisao.value = true;
};

const salvarProvisaoManual = async () => {
  carregando.value = true;
  try {
    const payload = { empresa_id: empresaSelecionada.value.id, ...formProvisao };
    await api.post('/admin/empresas/financeiro/provisao', payload);
    alert(`Parcela (${formProvisao.numero_parcela}) registrada com sucesso!`);
    abrirModalProvisao.value = false;
  } catch (err) { alert(err.response?.data?.erro || 'Erro ao lançar provisão.'); }
  finally { carregando.value = false; }
};

const salvarNovaEmpresa = async () => {
  try {
    await api.post('/admin/empresas', formEmpresa);
    alert('Empresa ativada!');
    abrirModalEmpresa.value = false;
    carregarEmpresas();
  } catch { alert('Erro ao salvar empresa.'); }
};

const alternarStatus = async (empresa) => {
  try { await api.put(`/admin/empresas/${empresa.id}/toggle-status`); empresa.ativo = !empresa.ativo; } catch { alert('Erro ao alterar status.'); }
};

const bloquearPorInadimplencia = async (empresaInadimplente) => {
  if (!confirm(`Deseja suspender IMEDIATAMENTE o acesso da empresa "${empresaInadimplente.nome}"?`)) return;
  try {
    await api.put(`/admin/empresas/${empresaInadimplente.id}/toggle-status`);
    alert(`Acesso revogado.`);
    carregarInadimplentes();
  } catch { alert('Erro ao suspender.'); }
};

onMounted(() => carregarEmpresas());
</script>

<style scoped>
.master-container { padding: 30px; font-family: sans-serif; }
.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 15px; }
.btn-primary { background: #1a3c6e; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; }
.btn-financeiro { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; margin-right: 6px; }
.btn-financeiro:hover { background: #dbeafe; }
.table-container { background: white; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th, td { padding: 14px; border-bottom: 1px solid #e2e8f0; color: #334155; }
th { background: #f8fafc; color: #64748b; }
.tabs-control { display: flex; gap: 8px; background: #f1f5f9; padding: 4px; border-radius: 8px; }
.tabs-control button { border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; color: #64748b; background: transparent; }
.tabs-control button.active { background: white; color: #1a3c6e; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; }
.badge-ativo { background: #dcfce7; color: #15803d; }
.badge-pendente { background: #fef9c3; color: #713f12; }
.badge-inativo { background: #fee2e2; color: #b91c1c; }
.badge-atraso { background: #fff1f2; color: #e11d48; padding: 4px 8px; border-radius: 4px; font-size: 13px; font-weight: bold; }
.badge-segmento { background: #f1f5f9; color: #475569; padding: 4px 8px; border-radius: 4px; font-size: 13px; }
.btn-status { border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; margin-right: 8px; }
.btn-bloquear { background: #fff5f5; color: #e53e3e; }
.btn-ativar { background: #f0fff4; color: #38a169; }
.btn-deletar { background: #fee2e2; color: #b91c1c; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 999; }
.modal-content { background: white; padding: 25px; border-radius: 8px; width: 450px; color: #334155; }
.form-group { margin-bottom: 15px; display: flex; flex-direction: column; }
.form-group label { margin-bottom: 5px; font-weight: bold; color: #475569; font-size: 14px; }
.form-group input, .form-group select { padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.btn-cancelar { background: #e2e8f0; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; color: #475569; font-weight: bold; }
.btn-salvar { background: #1a3c6e; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: bold; }
</style>