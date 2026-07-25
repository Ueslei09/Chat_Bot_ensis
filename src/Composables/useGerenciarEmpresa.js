// src/composables/useGerenciarEmpresa.js
import { ref, reactive, onMounted, watch } from 'vue';
import { api } from '@/services/api';

// ⚠️ Certifique-se de que a palavra "function" está presente e o nome está idêntico
export function useGerenciarEmpresa() {
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
    try { 
      const res = await api.get('/admin/empresas'); 
      empresas.value = res.data; 
    } catch { 
      alert('Erro ao carregar as empresas.'); 
    }
  };

  const carregarLeads = async () => {
    try { 
      const res = await api.get('/admin/empresas/comercial/leads'); 
      leads.value = res.data; 
    } catch { 
      alert('Erro ao carregar os leads.'); 
    }
  };

  const carregarInadimplentes = async () => {
    try { 
      const res = await api.get('/admin/empresas/inadimplencia'); 
      inadimplentes.value = res.data; 
    } catch { 
      alert('Erro ao carregar lista de inadimplência.'); 
    }
  };

  const carregarTodasFaturas = async () => {
    try { 
      const res = await api.get('/admin/empresas/financeiro/extrato'); 
      todasFaturas.value = res.data; 
    } catch { 
      alert('Erro ao carregar o extrato financeiro.'); 
    }
  };

  watch(abaAtiva, (novaAba) => {
    if (novaAba === 'empresas') carregarEmpresas();
    if (novaAba === 'comercial') carregarLeads();
    if (novaAba === 'inadimplencia') carregarInadimplentes();
    if (novaAba === 'extrato') carregarTodasFaturas(); 
  });

  const confirmarBaixaPagamento = async (faturaId, nomeEmpresa) => {
    if (!confirm(`Confirmar o recebimento desta parcela da empresa "${nomeEmpresa}"? Isso irá reativar o acesso dela imediatamente.`)) return;
    try {
      const res = await api.put(`/admin/empresas/financeiro/liquidar/${faturaId}`);
      alert(res.data.msg || 'Pagamento confirmado!');
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
    } catch (err) { 
      alert(err.response?.data?.erro || 'Erro ao lançar provisão.'); 
    } finally { 
      carregando.value = false; 
    }
  };

  const salvarNovaEmpresa = async () => {
    carregando.value = true;
    try {
      await api.post('/admin/empresas', formEmpresa);
      alert('Empresa ativada!');
      abrirModalEmpresa.value = false;
      formEmpresa.nomeEmpresa = '';
      formEmpresa.nomeDono = '';
      formEmpresa.emailDono = '';
      formEmpresa.senhaDono = '';
      carregarEmpresas();
    } catch { 
      alert('Erro ao salvar empresa.'); 
    } finally { 
      carregando.value = false; 
    }
  };

  const salvarNovoLead = async () => {
    carregando.value = true;
    try {
      await api.post('/admin/empresas/comercial/leads', formLead);
      alert('Lead comercial cadastrado com sucesso!');
      abrirModalLead.value = false;
      formLead.nomeEmpresa = '';
      formLead.nomeResponsavel = '';
      formLead.segmento = '';
      formLead.telefone = '';
      carregarLeads();
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro ao cadastrar lead.');
    } finally {
      carregando.value = false;
    }
  };

  const alternarStatus = async (empresa) => {
    try { 
      await api.put(`/admin/empresas/${empresa.id}/toggle-status`); 
      empresa.ativo = !empresa.ativo; 
    } catch { 
      alert('Erro ao alterar status.'); 
    }
  };

  const bloquearPorInadimplencia = async (empresaInadimplente) => {
    if (!confirm(`Deseja suspender IMEDIATAMENTE o acesso da empresa "${empresaInadimplente.nome}"?`)) return;
    try {
      await api.put(`/admin/empresas/${empresaInadimplente.id}/toggle-status`);
      alert(`Acesso revogado.`);
      carregarInadimplentes();
    } catch { 
      alert('Erro ao suspender.'); 
    }
  };

  const deletarEmpresa = async (id, nome) => {
    if (!confirm(`Deseja realmente excluir a empresa "${nome}"?`)) return;
    try {
      await api.delete(`/admin/empresas/${id}`);
      alert('Empresa excluída com sucesso.');
      carregarEmpresas();
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro ao excluir empresa.');
    }
  };

  onMounted(() => carregarEmpresas());

  return {
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
  };
}