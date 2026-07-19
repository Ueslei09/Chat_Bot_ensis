<template>
  <div class="respostas animate-fade-in">

    <div class="cabecalho">
      <h2>Respostas rápidas</h2>
      <div class="busca-acoes">
        <input 
          v-model="busca" 
          type="text" 
          placeholder="Pesquisar por nome..." 
          @input="buscarComDebounce" 
          class="input-busca"
        />
        <button class="btn-nova" @click="abrirModalNova">+ Nova resposta</button>
      </div>
    </div>

    <!-- ==================== TABELA DE RESPOSTAS (RESPONSIVA) ==================== -->
    <table class="tabela-respostas">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Texto</th>
          <th>Departamento</th>
          <th>Categoria</th>
          <th class="text-right">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="carregando">
          <td colspan="5" class="text-center py-4 text-muted">Carregando dados...</td>
        </tr>
        <tr v-else-if="respostas.length === 0">
          <td colspan="5" class="text-center py-4 text-muted">Nenhuma resposta rápida cadastrada.</td>
        </tr>
        <tr v-else v-for="resposta in respostas" :key="resposta.id" class="linha-resposta-card">
          <td data-label="Nome" class="coluna-nome">
            <strong class="nome-texto">{{ resposta.nome }}</strong>
          </td>
          <td data-label="Texto" class="texto-resumo" :title="resposta.texto">
            {{ resposta.texto }}
          </td>
          <td data-label="Departamento" class="coluna-departamento">
            {{ resposta.departamento || '-' }}
          </td>
          <td data-label="Categoria" class="coluna-categoria">
            <span v-if="resposta.categoria" class="badge-categoria">{{ resposta.categoria }}</span>
            <span v-else>-</span>
          </td>
          <td class="acoes-tabela">
            <button class="btn-editar" @click="editar(resposta)">Editar</button>
            <button class="btn-excluir" @click="excluir(resposta.id)">Excluir</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p class="rodape">Mostrando {{ respostas.length }} resultados</p>

    <!-- ==================== MODAL: NOVA / EDITAR RESPOSTA ==================== -->
    <div v-if="modalAberto" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-box">
        <h3>{{ editandoId ? 'Editar resposta rápida' : 'Nova resposta rápida' }}</h3>

        <form @submit.prevent="salvar">
          <div class="campo-form">
            <label>Nome *</label>
            <input 
              v-model="form.nome" 
              type="text" 
              placeholder="Ex: Msg Inicial - Bom dia" 
              required 
            />
          </div>

          <div class="campo-form">
            <label>Texto *</label>
            <textarea 
              v-model="form.texto" 
              rows="4" 
              placeholder="Texto que será enviado" 
              required
            ></textarea>
          </div>

          <div class="campo-form">
            <label>Departamento</label>
            <input 
              v-model="form.departamento" 
              type="text" 
              placeholder="Ex: Suporte" 
            />
          </div>

          <div class="campo-form">
            <label>Categoria</label>
            <input 
              v-model="form.categoria" 
              type="text" 
              placeholder="Opcional" 
            />
          </div>

          <p v-if="erro" class="erro">{{ erro }}</p>

          <div class="modal-botoes">
            <button type="button" class="btn-cancelar" @click="fecharModal">Cancelar</button>
            <button type="submit" class="btn-confirmar">Salvar</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
/* Mantido todo o seu bloco <script setup> original perfeitamente intacto */
import { ref, onMounted, onUnmounted } from 'vue'
import {
  listarRespostasRapidas,
  criarRespostaRapida,
  atualizarRespostaRapida,
  excluirRespostaRapida
} from '@/services/respostaRapidasServices.js'

const respostas = ref([])
const carregando = ref(false)
const busca = ref('')

const modalAberto = ref(false)
const editandoId = ref(null)
const erro = ref('')
const form = ref({ nome: '', texto: '', departamento: '', categoria: '' })

let timeoutBusca = null

async function carregar() {
  carregando.value = true
  try {
    respostas.value = await listarRespostasRapidas(busca.value)
  } catch (err) {
    console.error('Erro ao carregar respostas rápidas:', err)
  } finally {
    carregando.value = false
  }
}

function buscarComDebounce() {
  if (timeoutBusca) clearTimeout(timeoutBusca)
  timeoutBusca = setTimeout(() => { carregar() }, 300);
}

function abrirModalNova() {
  editandoId.value = null
  form.value = { nome: '', texto: '', departamento: '', categoria: '' }
  erro.value = ''
  modalAberto.value = true
}

function editar(resposta) {
  editandoId.value = resposta.id
  form.value = {
    nome: resposta.nome,
    texto: resposta.texto,
    departamento: resposta.departamento || '',
    categoria: resposta.categoria || ''
  }
  erro.value = ''
  modalAberto.value = true
}

function fecharModal() {
  modalAberto.value = false
}

async function salvar() {
  erro.value = ''
  if (!form.value.nome.trim() || !form.value.texto.trim()) {
    erro.value = 'Os campos Nome e Texto são obrigatórios.'
    return
  }
  try {
    if (editandoId.value) {
      await atualizarRespostaRapida(editandoId.value, form.value)
    } else {
      await criarRespostaRapida(form.value)
    }
    fecharModal()
    await carregar()
  } catch (err) {
    erro.value = err.response?.data?.erro || 'Erro ao salvar resposta rápida'
  }
}

async function excluir(id) {
  if (!confirm('Tem certeza que deseja excluir esta resposta rápida?')) return
  try {
    await excluirRespostaRapida(id)
    await carregar()
  } catch (err) {
    console.error('Erro ao excluir resposta rápida:', err)
  }
}

onMounted(carregar)

onUnmounted(() => {
  if (timeoutBusca) clearTimeout(timeoutBusca)
})
</script>

<style scoped>
/* ---------- ESTRUTURA BASE RESPONSIVA ---------- */
.respostas {
  max-width: 1000px;
  margin: 16px auto;
  padding: 16px;
}
@media (min-width: 768px) {
  .respostas {
    margin: 32px auto;
    padding: 24px;
  }
}

.cabecalho {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}
.cabecalho h2 {
  font-size: 22px;
  margin: 0;
  color: #1e293b;
}
@media (min-width: 768px) {
  .cabecalho {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.busca-acoes {
  display: flex;
  gap: 10px;
  width: 100%;
}
@media (min-width: 768px) {
  .busca-acoes {
    width: auto;
  }
}

.input-busca {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 20px;
  font-size: 14px;
}
@media (min-width: 768px) {
  .input-busca {
    min-width: 260px;
  }
}

.btn-nova {
  background: #1a3c6e;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  font-size: 13px;
  white-space: nowrap;
}

/* ---------- TABELA FLUIDA / COMPORTAMENTO EM CARDS (MOBILE) ---------- */
.tabela-respostas {
  width: 100%;
  border-collapse: collapse;
}

@media (max-width: 767px) {
  .tabela-respostas thead {
    display: none; /* Oculta a estrutura rígida horizontal no celular */
  }
  
  .linha-resposta-card {
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 14px;
    margin-bottom: 12px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.02);
  }

  .tabela-respostas tbody td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0 !important;
    border-bottom: none !important;
    font-size: 13px;
  }

  /* Gera os rótulos dinâmicos à esquerda do valor no mobile */
  .tabela-respostas tbody td::before {
    content: attr(data-label);
    font-weight: bold;
    color: #64748b;
    font-size: 12px;
    text-transform: uppercase;
  }

  .nome-texto {
    font-size: 15px;
    color: #1a3c6e;
  }

  .texto-resumo {
    max-width: 100% !important;
    white-space: normal !important; /* Permite que o texto quebre linhas de forma legível no card */
    text-align: right;
    color: #475569;
  }

  .acoes-tabela {
    display: grid !important;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    width: 100%;
    margin-top: 10px;
    border-top: 1px dashed #e2e8f0;
    padding-top: 12px !important;
  }
  
  .btn-editar, .btn-excluir {
    padding: 10px !important;
    font-size: 13px !important;
    text-align: center;
    font-weight: bold;
  }
}

/* ---------- COMPORTAMENTO ORIGINAL DE DESKTOP ---------- */
@media (min-width: 768px) {
  .tabela-respostas thead th {
    background: #f8fafc;
    text-align: left;
    font-size: 13px;
    padding: 14px 16px;
    border-bottom: 2px solid #e2e8f0;
    color: #64748b;
  }
  
  .tabela-respostas tbody td {
    padding: 14px 16px;
    font-size: 14px;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: middle;
  }
  
  .tabela-respostas tbody tr:nth-child(even) {
    background: #fafafa;
  }

  .texto-resumo {
    max-width: 340px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .acoes-tabela {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
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
  
  .btn-excluir {
    background: #fdecea;
    color: #c0392b;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  }
}

.rodape {
  margin-top: 16px;
  font-size: 13px;
  color: #64748b;
}

/* ---------- DIÁLOGOS E MODAIS ---------- */
.campo-form {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}
.campo-form label {
  font-size: 13px;
  color: #475569;
  font-weight: 600;
}
.campo-form input,
.campo-form textarea {
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-family: inherit;
  font-size: 14px;
}
.campo-form input:focus,
.campo-form textarea:focus {
  outline: none;
  border-color: #1a3c6e;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 16px;
}
.modal-box {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}
.modal-box h3 {
  margin: 0 0 16px;
  color: #1e293b;
  font-size: 18px;
}

.modal-botoes {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
.btn-cancelar {
  background: #e2e8f0;
  border: none;
  padding: 10px 18px;
  border-radius: 20px;
  cursor: pointer;
  color: #475569;
  font-weight: 500;
}
.btn-confirmar {
  background: #1a3c6e;
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
}
.erro {
  color: #dc2626;
  font-size: 13px;
  margin: 8px 0 0;
  font-weight: 500;
}
.badge-categoria {
  background: #eff6ff;
  color: #1e40af;
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 10px;
  font-weight: bold;
  border: 1px solid #dbeafe;
}
.text-right { text-align: right !important; }
.text-center { text-align: center; }
.py-4 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
</style>