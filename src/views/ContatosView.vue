<template>
  <div class="contatos">

    <div class="cabecalho">
      <h2>Contatos</h2>
      <button class="btn-voltar" @click="voltarParaChat">← Voltar para o chat</button>
    </div>

    <!-- ==================== FORMULÁRIO: NOVO CONTATO ==================== -->
    <form class="form-contato" @submit.prevent="salvarContato">
      <div class="campo">
        <label>Nome</label>
        <input v-model="form.nome" type="text" required />
      </div>

      <div class="campo">
        <label>Número</label>
        <input  v-model="form.telefone"
         type="text"
           :placeholder="form.eh_grupo ? 'ID do grupo (ex: 12036xxxx@g.us)' : '5511999999999'"
            required />
      </div>

      <div class="campo">
        <label>Conexão</label>
        <select v-model="form.conexao" required>
          <option value="whatsapp">WhatsApp</option>
          <option value="chat">Chat</option>
          <option value="helpdesk">Helpdesk</option>
        </select>
      </div>
      <div class="campo campo-checkbox">
  <label>
    <input type="checkbox" v-model="form.eh_grupo" />
    É um grupo do WhatsApp?
  </label>
</div>

      <button type="submit" class="btn-salvar">
        {{ editandoId ? 'Salvar alterações' : 'Adicionar contato' }}
      </button>
      <button v-if="editandoId" type="button" class="btn-cancelar-edicao" @click="cancelarEdicao">
        Cancelar
      </button>
    </form>

    <p v-if="mensagem" class="sucesso">{{ mensagem }}</p>
    <p v-if="erro" class="erro">{{ erro }}</p>

    <!-- ==================== IMPORTAR CONTATOS ==================== -->
    <div class="importar">
      <label class="btn-importar">
        Importar contatos (.csv: nome,telefone,conexao)
        <input type="file" accept=".csv" @change="importarArquivo" hidden />
      </label>
      <p v-if="mensagemImportacao" class="sucesso">{{ mensagemImportacao }}</p>
    </div>

    <hr class="separador" />

    <!-- ==================== FILTROS ==================== -->
    <div class="filtros">
      <input
        v-model="filtroBusca"
        type="text"
        placeholder="Buscar por nome ou número..."
        @input="buscarComFiltro"
      />
      <select v-model="filtroConexao" @change="buscarComFiltro">
        <option value="">Todas as conexões</option>
        <option value="whatsapp">WhatsApp</option>
        <option value="chat">Chat</option>
        <option value="helpdesk">Helpdesk</option>
        <option value="">Pessoas e grupos</option>
        <option value="false">Só pessoas</option>
         <option value="true">Só grupos</option>
      </select>

      <label class="check-arquivados">
        <input type="checkbox" v-model="mostrarArquivados" @change="buscarComFiltro" />
        Ver arquivados
      </label>

      <button class="btn-atualizar" @click="carregarContatos">🔄 Atualizar</button>
    </div>

    <!-- ==================== TABELA DE CONTATOS ==================== -->
    <table class="tabela-contatos">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Número</th>
          <th>Conexão</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="carregando">
          <td colspan="4">Carregando...</td>
        </tr>
        <tr v-else-if="contatos.length === 0">
          <td colspan="4">Nenhum contato encontrado.</td>
        </tr>
        <tr v-for="contato in contatos" :key="contato.id">
          <td><span v-if="contato.eh_grupo" class="badge-grupo">👥 Grupo</span>
            {{ contato.nome }}</td>
          <td>{{ contato.telefone }}</td>
          <td>
            <span class="badge-conexao" :class="contato.conexao">
              {{ contato.conexao }}
            </span>
          </td>
          <td class="acoes-tabela">
  <button class="btn-abrir-chamado" @click="abrirChamado(contato)">
    Abrir chamado
  </button>
 
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
</td>
 
        </tr>
      </tbody>
    </table>

  </div>
</template>

<script setup>
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
 
// Nova variável de filtro
const filtroTipo = ref('')
const router = useRouter()

const contatos = ref([])
const carregando = ref(false)
const mensagem = ref('')
const erro = ref('')
const mensagemImportacao = ref('')

const filtroBusca = ref('')
const filtroConexao = ref('')
const mostrarArquivados = ref(false)

const editandoId = ref(null)
const form = ref({
  nome: '',
  telefone: '',
  conexao: 'whatsapp',
  eh_grupo: false
})

// carregarContatos() precisa mandar o novo filtro:
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

// editarContato() precisa carregar esse campo também:
function editarContato(contato) {
  editandoId.value = contato.id
  form.value = {
    nome: contato.nome,
    telefone: contato.telefone,
    conexao: contato.conexao,
    eh_grupo: contato.eh_grupo || false
  }
}

// cancelarEdicao() também precisa resetar esse campo:
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

// Arquiva um contato (some da lista padrão, mas continua no banco)
async function arquivar(id) {
  await arquivarContato(id)
  await carregarContatos()
}

// Desarquiva um contato
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

/**
 * Abre um novo chamado pra esse contato, já assume automaticamente
 * (pula a fila) e manda direto pra tela de chat, já na conversa.
 */
async function abrirChamado(contato) {
  try {
    // Cria o chamado (nasce com status ABERTO)
    const novoChamado = await criarChamado(contato.id)
 
    // Assume na hora, pro usuário logado (vira EM_ATENDIMENTO)
    await assumirChamado(novoChamado.id)
 
    // Manda pra tela de chat, já avisando qual chamado abrir
    router.push({ path: '/app/chamados', query: { abrir: novoChamado.id } })
  } catch (err) {
    erro.value = err.response?.data?.erro || 'Erro ao abrir chamado'
  }
}



onMounted(carregarContatos)
</script>

<style scoped>
.contatos {
  max-width: 900px;
  margin: 32px auto;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
}
.cabecalho {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.btn-abrir-chamado {
  background: none;
  border: none;
  color: #1a3c6e;
  cursor: pointer;
  font-size: 14px;
}
.btn-abrir-chamado:hover {
  text-decoration: underline;
}

.form-contato {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.campo {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}
.campo input,
.campo select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.btn-salvar {
  background: #1a3c6e;
  color: #fff;
  border: none;
  padding: 9px 18px;
  border-radius: 4px;
  cursor: pointer;
}
.btn-cancelar-edicao {
  background: #eee;
  border: none;
  padding: 9px 18px;
  border-radius: 4px;
  cursor: pointer;
}

.importar {
  margin-bottom: 16px;
}
.btn-importar {
  display: inline-block;
  background: #eafaf1;
  color: #27ae60;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

.separador {
  margin: 24px 0;
  border: none;
  border-top: 1px solid #eee;
}

.filtros {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.filtros input,
.filtros select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.filtros input {
  flex: 1;
  min-width: 180px;
}
.check-arquivados {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #555;
  white-space: nowrap;
}
.btn-atualizar {
  background: #f4f6f9;
  border: 1px solid #ddd;
  padding: 8px 14px;
  border-radius: 4px;
  cursor: pointer;
}

.tabela-contatos {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.tabela-contatos thead th {
  background: #f4f6f9;
  text-align: left;
  font-size: 13px;
  padding: 12px 16px;
  border-bottom: 2px solid #e0e0e0;
}
.tabela-contatos tbody td {
  padding: 12px 16px;
  font-size: 14px;
  border-bottom: 1px solid #eee;
}
.tabela-contatos tbody tr:nth-child(even) {
  background: #fafafa;
}

.badge-conexao {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 10px;
  text-transform: capitalize;
}
.badge-conexao.whatsapp {
  background: #dcf8e8;
  color: #27ae60;
}
.badge-conexao.chat {
  background: #e0ecff;
  color: #1a3c6e;
}
.badge-conexao.helpdesk {
  background: #fdf0e0;
  color: #b9770e;
}

.acoes-tabela {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.btn-editar {
  background: #e0ecff;
  color: #1a3c6e;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
.btn-arquivar {
  background: #fdf0e0;
  color: #b9770e;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
.btn-desarquivar {
  background: #eafaf1;
  color: #27ae60;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
.btn-excluir {
  background: #fdecea;
  color: #c0392b;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.sucesso {
  color: #27ae60;
  font-size: 13px;
}
.erro {
  color: #c0392b;
  font-size: 13px;
}

.campo-checkbox label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  white-space: nowrap;
}
.badge-grupo {
  display: inline-block;
  background: #e0ecff;
  color: #1a3c6e;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  margin-right: 6px;
}


</style>