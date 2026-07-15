<template>
  <div class="configuracoes">
  
    <h2>Configurações do Sistema</h2>

    <p v-if="carregando">Carregando...</p>

    <form v-else @submit.prevent="salvar">
      <div
        v-for="config in configuracoes"
        :key="config.chaves"
        class="campo"
      >
        <label>{{ rotulo(config.chaves) }}</label>
        <textarea v-model="config.valor" rows="2"></textarea>
      </div>

      <p v-if="mensagem" class="sucesso">{{ mensagem }}</p>
      <p v-if="erro" class="erro">{{ erro }}</p>

      <button type="submit" :disabled="salvando">
        {{ salvando ? 'Salvando...' : 'Salvar alterações' }}
      </button>
    </form>
 
    <hr class="separador" />
 
    <h2>Cadastrar Novo Usuário</h2>
 
    <form @submit.prevent="cadastrarUsuario">
      <div class="campo">
        <label>Nome</label>
        <input v-model="novoUsuario.nome" type="text" required />
      </div>
     
      <div class="campo">
        <label>E-mail</label>
        <input v-model="novoUsuario.email" type="email" required />
      </div>
     
      <div class="campo">
        <label>Senha</label>
        <input v-model="novoUsuario.senha" type="password" minlength="6" required />
      </div>
     
      <div class="campo">
        <label>Perfil</label>
        <select v-model="novoUsuario.perfil_id" required>
          <option value="" disabled>Selecione...</option>
          <option v-for="perfil in perfis" :key="perfil.id" :value="perfil.id">
            {{ perfil.nome }}
          </option>
        </select>
      </div>
     
      <p v-if="mensagemUsuario" class="sucesso">{{ mensagemUsuario }}</p>
      <p v-if="erroUsuario" class="erro">{{ erroUsuario }}</p>
     
      <button type="submit" :disabled="cadastrando">
        {{ cadastrando ? 'Cadastrando...' : 'Cadastrar usuário' }}
      </button>
    </form>
 
    <hr class="separador" />
 
    <h2>Usuários Cadastrados</h2>
 
    <table class="tabela-usuarios">
      <thead>
        <tr>
          <th>Nome</th>
          <th>E-mail</th>
          <th>Perfil</th>
          <th>Status</th>
          <th>Apagar mensagens</th>
          <th>Ações</th> <!-- Adicionado o cabeçalho faltante para alinhar a tabela -->
        </tr>
      </thead>
      <tbody>
         <tr v-for="usuario in usuarios" :key="usuario.id">
          <td>{{ usuario.nome }}</td>
          <td>{{ usuario.email }}</td>
          <td>{{ usuario.perfil }}</td>
          <td>{{ usuario.ativo ? 'Ativo' : 'Bloqueado' }}</td>
     
          <!-- Permissão de apagar mensagens -->
          <td>
            <span v-if="usuario.perfil === 'ADM'">Sempre permitido</span>
     
            <button
              v-else-if="usuario.podeapagarmensagens"
              class="btn-bloquear"
              @click="bloquearApagarMensagens(usuario)"
            >
              Bloquear apagar
            </button>
            <button
              v-else
              class="btn-desbloquear"
              @click="permitirApagarMensagens(usuario)"
            >
              Permitir apagar
            </button>
          </td>
     
          <!-- Status / Bloqueio geral de conta -->
          <td>
            <button
              v-if="usuario.ativo"
              class="btn-bloquear"
              @click="bloquear(usuario.id)"
            >
              Bloquear conta
            </button>
            <button
              v-else
              class="btn-desbloquear"
              @click="desbloquear(usuario.id)"
            >
              Desbloquear conta
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <button class="btn-voltar mt-4" @click="voltarParaLogin">
      ← Voltar para o login
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import {
  listarConfiguracoes,
  atualizarConfiguracao
} from '@/services/configuracaoServices.js'

import {
  listarPerfis,
  criarUsuario,
  listarUsuarios,
  bloquearUsuario,
  desbloquearUsuario,
  alternarPermissaoApagar
} from '@/services/usuariosServices.js'
import { logout } from '@/services/authServices.js'

const router = useRouter()
const configuracoes = ref([])
const carregando = ref(true)
const salvando = ref(false)
const mensagem = ref('')
const erro = ref('')

const perfis = ref([])
const usuarios = ref([])

const novoUsuario = ref({
  nome: '',
  email: '',
  senha: '',
  perfil_id: ''
})
 
const cadastrando = ref(false)
const mensagemUsuario = ref('')
const erroUsuario = ref('')

// Desloga o ADM e manda de volta pra tela de login
function voltarParaLogin() {
  logout()
  router.push('/')
}

// Libera o usuário pra apagar mensagens
async function permitirApagarMensagens(usuario) {
  try {
    await alternarPermissaoApagar(usuario.id, true)
    await carregarUsuarios()
  } catch (err) {
    console.error('Erro ao permitir remoção de mensagens:', err)
  }
}

// Bloqueia o usuário de apagar mensagens
async function bloquearApagarMensagens(usuario) {
  try {
    await alternarPermissaoApagar(usuario.id, false)
    await carregarUsuarios()
  } catch (err) {
    console.error('Erro ao bloquear remoção de mensagens:', err)
  }
}

// Busca a lista de usuários cadastrados
async function carregarUsuarios() {
  try {
    usuarios.value = await listarUsuarios()
  } catch (err) {
    console.error('Erro ao carregar usuários:', err)
  }
}

// Bloqueia um usuário e atualiza a listinha
async function bloquear(id) {
  try {
    await bloquearUsuario(id)
    await carregarUsuarios()
  } catch (err) {
    console.error(err)
  }
}

// Desbloqueia um usuário e atualiza a listinha
async function desbloquear(id) {
  try {
    await desbloquearUsuario(id)
    await carregarUsuarios()
  } catch (err) {
    console.error(err)
  }
}
 
// Busca os perfis (ADM/USER)
async function carregarPerfis() {
  try {
    perfis.value = await listarPerfis()
  } catch (err) {
    console.error('Erro ao carregar perfis:', err)
  }
}
 
// Envia o formulário de cadastro e atualiza a listagem automaticamente
async function cadastrarUsuario() {
  cadastrando.value = true
  mensagemUsuario.value = ''
  erroUsuario.value = ''
 
  try {
    await criarUsuario(novoUsuario.value)
    mensagemUsuario.value = 'Usuário cadastrado com sucesso!'
 
    // Limpa o formulário depois de cadastrar
    novoUsuario.value = { nome: '', email: '', senha: '', perfil_id: '' }
    
    // ⚡ EXCELENTE PARA ESCALABILIDADE/REATIVIDADE: Recarrega a tabela de usuários em tempo real!
    await carregarUsuarios()
  } catch (err) {
    erroUsuario.value = err.response?.data?.erro || 'Erro ao cadastrar usuário'
  } finally {
    cadastrando.value = false
  }
}

// Transforma chaves técnicas em rótulos amigáveis
function rotulo(chaves) {
  const nomes = {
    mensagem_bom_dia: 'Mensagem de Bom Dia',
    mensagem_boa_noite: 'Mensagem de Boa Noite',
    mensagem_agradecimento: 'Mensagem de Agradecimento'
  }
  return nomes[chaves] || chaves
}

// Carrega as configurações de mensagem
async function carregar() {
  carregando.value = true
  try {
    configuracoes.value = await listarConfiguracoes()
  } catch (err) {
    erro.value = 'Erro ao carregar configurações'
  } finally {
    carregando.value = false
  }
}

// Salva as mensagens de atendimento
async function salvar() {
  salvando.value = true
  mensagem.value = ''
  erro.value = ''

  try {
    for (const config of configuracoes.value) {
      await atualizarConfiguracao(config.chaves, config.valor)
    }
    mensagem.value = 'Configurações salvas com sucesso!'
  } catch (err) {
    erro.value = 'Erro ao salvar. Verifique se você está logado como ADM.'
  } finally {
    salvando.value = false
  }
}

onMounted(() => {
  carregar()
  carregarPerfis()
  carregarUsuarios()
})
</script>

<style scoped>
.configuracoes {
  max-width: 700px; /* Aumentado levemente para acomodar melhor a tabela larga */
  margin: 32px auto;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
}
.campo {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
textarea, input, select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: inherit;
}
button {
  background: #1a3c6e;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.sucesso {
  color: #27ae60;
}
.erro {
  color: #c0392b;
}

/* Corrigido seletor de classe com ponto (.) */
.separador {
  margin: 32px 0;
  border: none;
  border-top: 1px solid #eee;
}

.tabela-usuarios {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-top: 16px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.tabela-usuarios thead th {
  background: #f4f6f9;
  color: #333;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  padding: 14px 16px;
  border-bottom: 2px solid #e0e0e0;
}

.tabela-usuarios tbody td {
  padding: 14px 16px;
  font-size: 14px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
}

.tabela-usuarios tbody tr:nth-child(even) {
  background: #fafafa;
}

.tabela-usuarios tbody tr:hover {
  background: #f0f4fa;
}

.tabela-usuarios td + td,
.tabela-usuarios th + th {
  border-left: 1px solid #eee;
}

.btn-bloquear,
.btn-desbloquear {
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

.btn-bloquear {
  background: #fdecea;
  color: #c0392b;
}
.btn-bloquear:hover {
  background: #c0392b;
  color: #fff;
}

.btn-desbloquear {
  background: #eafaf1;
  color: #27ae60;
}
.btn-desbloquear:hover {
  background: #27ae60;
  color: #fff;
}

.btn-voltar {
  background: #eaeaea;
  color: #333;
}
.btn-voltar:hover {
  background: #ddd;
}
.mt-4 {
  margin-top: 24px;
}
</style>