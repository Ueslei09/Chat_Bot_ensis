import { ref, reactive, onMounted, watch } from 'vue';
import api from '@/services/api';

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

  const modoManutencaoAtivo = ref(false);

  const formEmpresa = reactive({ nomeEmpresa: '', nomeDono: '', emailDono: '', senhaDono: '' });
  const formLead = reactive({ nomeEmpresa: '', nomeResponsavel: '', segmento: '', telefone: '' });
  const formProvisao = reactive({ valor: '', data_vencimento: '', numero_parcela: '1/12', ja_pago: false });

  const templateIdFix = (id) => id;

 const carregarEmpresas = async () => {
    try { 
      const res = await api.get('/admin/empresas'); 
      empresas.value = res.data; 
    } catch (err) { 
      // Mostra o erro exato que veio do servidor na tela
      const mensagemErro = err.response?.data?.erro || err.message;
      alert('Erro detalhado: ' + mensagemErro); 
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
    } catch (err) { 
      console.error(err);
      alert('Erro ao carregar lista de inadimplência.'); 
    }
  };

const carregarTodasFaturas = async () => {
    try { 
      // Ajustado para bater com a rota /extrato do seu financeiroRoutes
      const res = await api.get('/admin/empresas/extrato'); 
      todasFaturas.value = res.data; 
    } catch (err) { 
      console.error(err);
      alert('Erro ao carregar o extrato financeiro.'); 
    }
  };

  const checarStatusManutencaoMaster = async () => {
    try {
      const res = await api.get('/configuracoes/status');
      modoManutencaoAtivo.value = res.data.emManutencao;
    } catch (e) {
      if (e.response && e.response.status === 503) {
        modoManutencaoAtivo.value = true;
      }
    }
  };

 const alternarModoManutencaoGlobal = async () => {
    try {
      const novoEstado = !modoManutencaoAtivo.value;
      const token = localStorage.getItem('token'); // Pega o token salvo no login

      const resposta = await api.post('/configuracoes/manutencao', 
        { ativo: novoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      modoManutencaoAtivo.value = novoEstado;
      alert(resposta.data.mensagem);
    } catch (error) {
      alert('Erro ao alterar o modo de manutenção.');
    }
  };

  watch(abaAtiva, (novaAba) => {
    if (novaAba === 'empresas') carregarEmpresas();
    if (novaAba === 'comercial') carregarLeads();
    if (novaAba === 'inadimplencia') carregarInadimplentes();
    if (novaAba === 'extrato') carregarTodasFaturas(); 
  });

  const confirmarBaixaPagamento = async (faturaId, nomeEmpresa) => {
    if (!confirm(`Confirmar o recebimento desta parcela da empresa "${nomeEmpresa}"?`)) return;
    try {
      // Ajustado para bater com a rota /liquidar/:id
      const res = await api.put(`/admin/empresas/liquidar/${faturaId}`);
      alert(res.data.msg || 'Pagamento confirmado!');
      if (abaAtiva.value === 'inadimplencia') carregarInadimplentes();
      if (abaAtiva.value === 'extrato') carregarTodasFaturas();
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro ao processar baixa.');
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
      // Ajustado para bater com a rota /provisao
      await api.post('/admin/empresas/provisao', payload);
      alert('Parcela registrada com sucesso!');
      abrirModalProvisao.value = false;
      if (abaAtiva.value === 'extrato') carregarTodasFaturas();
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
      Object.keys(formEmpresa).forEach(k => formEmpresa[k] = '');
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
      alert('Lead cadastrado!');
      abrirModalLead.value = false;
      Object.keys(formLead).forEach(k => formLead[k] = '');
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
    if (!confirm(`Suspender acesso de "${empresaInadimplente.nome}"?`)) return;
    try {
      await api.put(`/admin/empresas/${empresaInadimplente.id}/toggle-status`);
      alert('Acesso revogado.');
      carregarInadimplentes();
    } catch { 
      alert('Erro ao suspender.'); 
    }
  };

  const deletarEmpresa = async (id, nome) => {
    if (!confirm(`Excluir empresa "${nome}"?`)) return;
    try {
      await api.delete(`/admin/empresas/${id}`);
      alert('Empresa excluída.');
      carregarEmpresas();
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro ao excluir.');
    }
  };

  onMounted(() => {
    carregarEmpresas();
    checarStatusManutencaoMaster();
  });

  return {
    abaAtiva, empresas, leads, inadimplentes, todasFaturas,
    abrirModalEmpresa, abrirModalLead, abrirModalProvisao, carregando, empresaSelecionada,
    formEmpresa, formLead, formProvisao, templateIdFix,
    confirmarBaixaPagamento, prepararProvisao, salvarProvisaoManual,
    salvarNovaEmpresa, salvarNovoLead, alternarStatus, bloquearPorInadimplencia, deletarEmpresa,
    modoManutencaoAtivo, alternarModoManutencaoGlobal, checarStatusManutencaoMaster
  };
}