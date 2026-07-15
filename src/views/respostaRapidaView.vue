<template>
  <div class="respostas">

    <div class="cabecalho">
      <h2>Respostas rápidas</h2>
      <div class="busca-acoes">
        <input 
          v-model="busca" 
          type="text" 
          placeholder="Pesquisar por nome..." 
          @input="buscarComDebounce" 
        />
        <button class="btn-nova" @click="abrirModalNova">+ Nova resposta</button>
      </div>
    </div>

    <!-- Tabela de Respostas -->
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
          <td colspan="5" class="text-center py-4 text-muted">Carregando...</td>
        </tr>
        <tr v-else-if="respostas.length === 0">
          <td colspan="5" class="text-center py-4 text-muted">Nenhuma resposta rápida cadastrada.</td>
        </tr>
        <tr v-else v-for="resposta in respostas" :key="resposta.id">
          <td><strong>{{ resposta.nome }}</strong></td>
          <td class="texto-resumo" :title="resposta.texto">{{ resposta.texto }}</td>
          <td>{{ resposta.departamento || '-' }}</td>
          <td>
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

        <!-- Form que envelopa os inputs para validação nativa do navegador -->
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

// ⚡ DEBOUNCE (Filtro Anti-Flood):
// Aguarda o usuário parar de digitar por 300ms antes de consultar a API.
function buscarComDebounce() {
  if (timeoutBusca) clearTimeout(timeoutBusca)
  
  timeoutBusca = setTimeout(() => {
    carregar()
  }, 300);
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
  
  // Validação manual secundária antes de submeter
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

// Limpeza preventiva de timer ao destruir o componente
onUnmounted(() => {
  if (timeoutBusca) clearTimeout(timeoutBusca)
})
</script>

<style scoped>
.respostas {
  max-width: 1000px;
  margin: 32px auto;
  padding: 24px;
}
.cabecalho {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.busca-acoes {
  display: flex;
  gap: 10px;
}
.busca-acoes input {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 20px;
  min-width: 220px;
}
.btn-nova {
  background: #1a3c6e;
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
}

.tabela-respostas {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.tabela-respostas thead th {
  background: #f4f6f9;
  text-align: left;
  font-size: 13px;
  padding: 12px 16px;
  border-bottom: 2px solid #e0e0e0;
}
.tabela-respostas tbody td {
  padding: 14px 16px;
  font-size: 14px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
}
.tabela-respostas tbody tr:nth-child(even) {
  background: #fafafa;
}
.texto-resumo {
  max-width: 300px;
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

.rodape {
  margin-top: 16px;
  font-size: 13px;
  color: #888;
}

/* ---------- FORM & MODAL ---------- */
.campo-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal-box {
  background: #fff;
  border-radius: 10px;
  padding: 28px;
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.modal-box h3 {
  margin: 0 0 4px;
}
.modal-box label {
  font-size: 13px;
  color: #444;
  font-weight: 500;
}
.modal-box input,
.modal-box textarea {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-family: inherit;
}
.modal-botoes {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}
.btn-cancelar {
  background: #dbe3ee;
  border: none;
  padding: 8px 18px;
  border-radius: 20px;
  cursor: pointer;
}
.btn-confirmar {
  background: #1a3c6e;
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 20px;
  cursor: pointer;
}
.erro {
  color: #c0392b;
  font-size: 13px;
}
.badge-categoria {
  background: #e1f5fe;
  color: #0288d1;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}
.text-right {
  text-align: right !important;
}
.text-center {
  text-align: center;
}
.py-4 {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}
</style>