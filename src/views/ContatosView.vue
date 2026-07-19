<template>
  <div class="contatos animate-fade-in">

    <div class="cabecalho">
      <h2>Contatos</h2>
      <button class="btn-voltar" @click="voltarParaChat">
        <span class="seta">←</span> <span class="texto-btn">Voltar ao chat</span>
      </button>
    </div>

    <!-- ==================== FORMULÁRIO: NOVO CONTATO ==================== -->
    <form class="form-contato" @submit.prevent="salvarContato">
      <div class="campo campo-flex">
        <label>Nome</label>
        <input v-model="form.nome" type="text" required />
      </div>

      <div class="campo campo-flex">
        <label>Número</label>
        <input  
          v-model="form.telefone"
          type="text"
          :placeholder="form.eh_grupo ? 'ID do grupo' : '5511999999999'"
          required 
        />
      </div>

      <div class="campo campo-flex-pequeno">
        <label>Conexão</label>
        <select v-model="form.conexao" required>
          <option value="whatsapp">WhatsApp</option>
          <option value="chat">Chat</option>
          <option value="helpdesk">Helpdesk</option>
        </select>
      </div>

      <div class="campo campo-checkbox align-self-center">
        <label class="label-checkbox-container">
          <input type="checkbox" v-model="form.eh_grupo" />
          <span>É um grupo?</span>
        </label>
      </div>

      <div class="acoes-formulario">
        <button type="submit" class="btn-salvar">
          {{ editandoId ? 'Salvar' : 'Adicionar' }}
        </button>
        
        <button v-if="editandoId" type="button" class="btn-cancelar-edicao" @click="cancelarEdicao">
          Cancelar
        </button>
      </div>
    </form>

    <p v-if="mensagem" class="sucesso">{{ mensagem }}</p>
    <p v-if="erro" class="erro">{{ erro }}</p>

    <!-- ==================== IMPORTAR CONTATOS ==================== -->
    <div class="importar">
      <label class="btn-importar">
        📥 Importar contatos (.csv)
        <input type="file" accept=".csv" @change="importarArquivo" hidden />
      </label>
      <p v-if="mensagemImportacao" class="sucesso">{{ messageImportacao || mensagemImportacao }}</p>
    </div>

    <hr class="separador" />

    <!-- ==================== FILTROS ==================== -->
    <div class="filtros">
      <input
        v-model="filtroBusca"
        type="text"
        placeholder="Buscar nome ou número..."
        @input="buscarComFiltro"
        class="input-busca"
      />

      <div class="grupo-filtros-select">
        <select v-model="filtroConexao" @change="buscarComFiltro">
          <option value="">Todas conexões</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="chat">Chat</option>
          <option value="helpdesk">Helpdesk</option>
        </select>

        <select v-model="filtroTipo" @change="buscarComFiltro">
          <option value="">Filtro Tipo</option>
          <option value="false">Só pessoas</option>
          <option value="true">Só grupos</option>
        </select>
      </div>

      <div class="filtros-extras">
        <label class="check-arquivados">
          <input type="checkbox" v-model="mostrarArquivados" @change="buscarComFiltro" />
          Ver arquivados
        </label>

        <button class="btn-atualizar" @click="carregarContatos">🔄</button>
      </div>
    </div>

    <!-- ==================== TABELA DE CONTATOS (RESPONSIVA) ==================== -->
    <table class="tabela-contatos">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Número</th>
          <th>Conexão</th>
          <th class="text-right">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="carregando">
          <td colspan="4" class="text-center py-4 text-muted">Carregando contatos...</td>
        </tr>
        <tr v-else-if="contatos.length === 0">
          <td colspan="4" class="text-center py-4 text-muted">Nenhum contato encontrado.</td>
        </tr>
        <tr v-else v-for="contato in contatos" :key="contato.id" class="linha-contato-card">
          <td data-label="Nome" class="coluna-nome">
            <span v-if="contato.eh_grupo" class="badge-grupo">👥 Grupo</span>
            <strong class="nome-texto">{{ contato.nome }}</strong>
          </td>
          <td data-label="Número" class="coluna-numero">{{ contato.telefone }}</td>
          <td data-label="Conexão" class="coluna-conexao">
            <span class="badge-conexao" :class="contato.conexao">
              {{ contato.conexao }}
            </span>
          </td>
          <td class="acoes-tabela">
            <button class="btn-abrir-chamado" @click="abrirChamado(contato)">
              💬 Abrir chamado
            </button>
            <div class="grupo-botoes-modificadores">
              <button class="btn-editar" @click="editarContato(contato)">Editar</button>
              <button
                v-if="!contato.arquivado"
                class="btn-arquivar"
                @click="arquivar(contato.id)"
              >
                Arquivar
              </button>
              <button
                v-else
                class="btn-desarquivar"
                @click="desarquivar(contato.id)"
              >
                Desarquivar
              </button>
              <button class="btn-excluir" @click="excluir(contato.id)">Excluir</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

  </div>
</template>

<script setup>
/* Mantido seu bloco de script setup original perfeitamente intacto */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  listarContatos,
  criarContato,
  atualizarContato,
  excluirContato,
  importarContatos,
  arquivarContato,
  desarquivarContato
} from '@/services/contatoServices.js'
import { criarChamado, assumirChamado } from '@/services/chamadoServices.js'
 
const router = useRouter()

const contatos = ref([])
const carregando = ref(false)
const mensagem = ref('')
const erro = ref('')
const mensagemImportacao = ref('')

const filtroBusca = ref('')
const filtroConexao = ref('')
const filtroTipo = ref('') 
const mostrarArquivados = ref(false)

const editandoId = ref(null)
const form = ref({
  nome: '',
  telefone: '',
  conexao: 'whatsapp',
  eh_grupo: false
})

async function carregarContatos() {
  carregando.value = true
  try {
    contatos.value = await listarContatos({
      busca: filtroBusca.value || undefined,
      conexao: filtroConexao.value || undefined,
      arquivados: mostrarArquivados.value ? 'true' : undefined,
      grupos: filtroTipo.value || undefined
    })
  } catch (err) {
    console.error('Erro ao carregar contatos:', err)
  } finally {
    carregando.value = false
  }
}

function buscarComFiltro() {
  carregarContatos()
}

async function salvarContato() {
  mensagem.value = ''
  erro.value = ''
  try {
    if (editandoId.value) {
      await atualizarContato(editandoId.value, form.value)
      mensagem.value = 'Contato atualizado com sucesso!'
    } else {
      await criarContato(form.value)
      mensagem.value = 'Contato adicionado com sucesso!'
    }
    cancelarEdicao()
    await carregarContatos()
  } catch (err) {
    erro.value = err.response?.data?.erro || 'Erro ao salvar contato'
  }
}

function editarContato(contato) {
  editandoId.value = contato.id
  form.value = {
    nome: contato.nome,
    telefone: contato.telefone,
    conexao: contato.conexao,
    eh_grupo: contato.eh_grupo || false
  }
}

function cancelarEdicao() {
  editandoId.value = null
  form.value = { nome: '', telefone: '', conexao: 'whatsapp', eh_grupo: false }
}

async function excluir(id) {
  if (!confirm('Tem certeza que deseja excluir este contato?')) return
  erro.value = ''
  try {
    await excluirContato(id)
    await carregarContatos()
  } catch (err) {
    erro.value = err.response?.data?.erro || 'Erro ao excluir contato'
  }
}

async function arquivar(id) {
  await arquivarContato(id)
  await carregarContatos()
}

async function desarquivar(id) {
  await desarquivarContato(id)
  await carregarContatos()
}

function importarArquivo(evento) {
  const arquivo = evento.target.files[0]
  if (!arquivo) return

  const leitor = new FileReader()
  leitor.onload = async (e) => {
    const texto = e.target.result
    const linhas = texto.split('\n').map(l => l.trim()).filter(Boolean)

    const contatosImportar = linhas.map(linha => {
      const [nome, telefone, conexao] = linha.split(',').map(v => v?.trim())
      return { nome, telefone, conexao: conexao || 'whatsapp' }
    })

    try {
      const resultado = await importarContatos(contatosImportar)
      mensagemImportacao.value = resultado.msg
      await carregarContatos()
    } catch (err) {
      mensagemImportacao.value = err.response?.data?.erro || 'Erro ao importar contatos'
    }
  }
  leitor.readAsText(arquivo)
  evento.target.value = ''
}

function voltarParaChat() {
  router.push('/app/chamados')
}

async function abrirChamado(contato) {
  try {
    const novoChamado = await criarChamado(contato.id)
    await assumirChamado(novoChamado.id)
    router.push({ path: '/app/chamados', query: { abrir: novoChamado.id } })
  } catch (err) {
    erro.value = err.response?.data?.erro || 'Erro ao abrir chamado'
  }
}

onMounted(carregarContatos)
</script>

<style scoped>
/* ---------- ESTRUTURA BASE RESPONSIVA ---------- */
.contatos {
  max-width: 980px;
  margin: 16px auto;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}
@media (min-width: 768px) {
  .contatos {
    margin: 32px auto;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }
}

.cabecalho {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.cabecalho h2 {
  font-size: 20px;
  margin: 0;
  color: #1e293b;
}

.btn-voltar {
  background: #f4f6f9;
  border: 1px solid #ddd;
  color: #333;
  padding: 8px 14px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}
@media (max-width: 576px) {
  .btn-voltar .texto-btn {
    display: none; /* Deixa apenas a seta no celular para economizar espaço */
  }
  .btn-voltar {
    padding: 6px 12px;
  }
}

/* ---------- FORMULÁRIO RESPONSIVO ---------- */
.form-contato {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  background: #f8fafc;
  padding: 16px;
  border-radius: 6px;
}
@media (min-width: 768px) {
  .form-contato {
    flex-direction: row;
    align-items: flex-end;
    background: transparent;
    padding: 0;
  }
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  width: 100%;
}
@media (min-width: 768px) {
  .campo-flex { flex: 2; }
  .campo-flex-pequeno { flex: 1; }
  .campo-checkbox { width: auto; }
}

.campo input, .campo select {
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  background: #fff;
}

.label-checkbox-container {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 500;
  padding: 6px 0;
}

.acoes-formulario {
  display: flex;
  gap: 8px;
  width: 100%;
}
@media (min-width: 768px) {
  .acoes-formulario { width: auto; }
}

.btn-salvar {
  background: #1a3c6e;
  color: #fff;
  border: none;
  padding: 11px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  flex: 1;
}
.btn-cancelar-edicao {
  background: #e2e8f0;
  border: none;
  padding: 11px 20px;
  border-radius: 6px;
  cursor: pointer;
  color: #475569;
}

/* ---------- FILTROS RESPONSIVOS ---------- */
.filtros {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}
@media (min-width: 768px) {
  .filtros {
    flex-direction: row;
    align-items: center;
  }
}

.input-busca {
  width: 100%;
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}
.grupo-filtros-select {
  display: flex;
  gap: 8px;
  width: 100%;
}
.grupo-filtros-select select {
  flex: 1;
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #fff;
}
.filtros-extras {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 10px;
}
@media (min-width: 768px) {
  .grupo-filtros-select { width: auto; }
  .filtros-extras { width: auto; }
}

.check-arquivados {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #475569;
}
.btn-atualizar {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 10px 14px;
  border-radius: 6px;
  cursor: pointer;
}

/* ---------- TABELA FLUIDA / COMPORTAMENTO EM CARDS (MOBILE) ---------- */
.tabela-contatos {
  width: 100%;
  border-collapse: collapse;
}

/* Esconde o cabeçalho no Mobile */
@media (max-width: 767px) {
  .tabela-contatos thead {
    display: none;
  }
  
  .linha-contato-card {
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.02);
  }

  .tabela-contatos tbody td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0 !important;
    border-bottom: none !important;
    font-size: 13px;
  }

  /* Cria os rótulos dinâmicos na esquerda da tela */
  .tabela-contatos tbody td::before {
    content: attr(data-label);
    font-weight: bold;
    color: #64748b;
    font-size: 12px;
    text-transform: uppercase;
  }
  
  .nome-texto {
    font-size: 15px;
    color: #1e293b;
  }
  .acoes-tabela {
    flex-direction: column !important;
    align-items: stretch !important;
    width: 100%;
    margin-top: 8px;
    border-top: 1px dashed #e2e8f0;
    padding-top: 10px !important;
  }
  .grupo-botoes-modificadores {
    display: grid !important;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
    width: 100%;
  }
  .btn-abrir-chamado {
    width: 100%;
    text-align: center !important;
    background: #eff6ff !important;
    padding: 8px !important;
    border-radius: 6px;
    margin-bottom: 6px;
  }
  .btn-abrir-chamado:hover {
    text-decoration: none !important;
  }
}

/* ---------- ESTILOS DE DESKTOP DA TABELA ---------- */
@media (min-width: 768px) {
  .tabela-contatos thead th {
    background: #f8fafc;
    text-align: left;
    font-size: 13px;
    padding: 14px 16px;
    border-bottom: 2px solid #e2e8f0;
    color: #64748b;
  }
  .tabela-contatos tbody td {
    padding: 14px 16px;
    font-size: 14px;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: middle;
  }
  .acoes-tabela {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
  .grupo-botoes-modificadores {
    display: flex;
    gap: 6px;
  }
  .btn-abrir-chamado {
    background: none;
    border: none;
    color: #1a3c6e;
    cursor: pointer;
    font-size: 13px;
    font-weight: bold;
    padding: 6px 12px;
  }
  .btn-abrir-chamado:hover {
    text-decoration: underline;
  }
}

/* ---------- BADGES E BOTÕES RÁPIDOS ---------- */
.badge-conexao {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 10px;
  font-weight: bold;
}
.badge-conexao.whatsapp { background: #dcf8e8; color: #16a34a; }
.badge-conexao.chat { background: #e0ecff; color: #1a3c6e; }
.badge-conexao.helpdesk { background: #fdf0e0; color: #d97706; }

.badge-grupo {
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  margin-right: 6px;
  font-weight: bold;
}

.btn-editar { background: #f1f5f9; color: #475569; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500; text-align: center; }
.btn-arquivar { background: #fff7ed; color: #c2410c; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500; text-align: center; }
.btn-desarquivar { background: #f0fdf4; color: #16a34a; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500; text-align: center; }
.btn-excluir { background: #fef2f2; color: #dc2626; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500; text-align: center; }

.btn-importar {
  display: inline-block;
  background: #f0fdf4;
  color: #16a34a;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: bold;
  border: 1px dashed #bbf7d0;
}
.separador { margin: 20px 0; border: none; border-top: 1px solid #e2e8f0; }
.sucesso { color: #16a34a; font-size: 13px; font-weight: 500; margin: 5px 0; }
.erro { color: #dc2626; font-size: 13px; font-weight: 500; margin: 5px 0; }
.text-center { text-align: center; }
.py-4 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
</style>