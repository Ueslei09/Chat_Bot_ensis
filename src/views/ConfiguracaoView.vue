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
    <!-- ============================================================ -->
<!-- 1) ADICIONE ISSO no <template>, DEPOIS do </form> que já existe -->
<!-- (o form das mensagens de saudação continua intacto acima)      -->
<!-- ============================================================ -->
 
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
<!-- ============================================================ -->
<!-- ADICIONE ISSO no <template>, DEPOIS do form de cadastro     -->
<!-- de usuário que você já colou antes                          -->
<!-- ============================================================ -->
 
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
    
    </tr>
  </thead>
  <tbody>
     <tr v-for="usuario in usuarios" :key="usuario.id">
    <td>{{ usuario.nome }}</td>
    <td>{{ usuario.email }}</td>
    <td>{{ usuario.perfil }}</td>
    <td>{{ usuario.ativo ? 'Ativo' : 'Bloqueado' }}</td>
 
    <!-- Nova coluna: permissão de apagar mensagens -->
    <td>
      <!-- ADM sempre pode apagar, não faz sentido mostrar botão pra ele -->
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
 
    <td>
      <button
        v-if="usuario.ativo"
        class="btn-bloquear"
        @click="bloquear(usuario.id)"
      >
        Bloquear
      </button>
      <button
        v-else
        class="btn-desbloquear"
        @click="desbloquear(usuario.id)"
      >
        Desbloquear
      </button>
    </td>
  </tr>
  </tbody>
</table>
     <button class="btn-voltar" @click="voltarParaLogin">
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
// Lista de perfis (ADM/USER) pra popular o <select>
const perfis = ref([])
 
// Desloga o ADM e manda de volta pra tela de login normal (não a de admin)
function voltarParaLogin() {
  logout()
  router.push('/')
}
// Libera o usuário pra apagar mensagens
async function permitirApagarMensagens(usuario) {
  await alternarPermissaoApagar(usuario.id, true)
  await carregarUsuarios()
}

// Bloqueia o usuário de apagar mensagens
async function bloquearApagarMensagens(usuario) {
  await alternarPermissaoApagar(usuario.id, false)
  await carregarUsuarios()
}
// Dados do formulário de novo usuário
const novoUsuario = ref({
  nome: '',
  email: '',
  senha: '',
  perfil_id: ''
})
 
const cadastrando = ref(false)
const mensagemUsuario = ref('')
const erroUsuario = ref('')
const usuarios = ref([])

// Busca a lista de usuários
async function carregarUsuarios() {
  try {
    usuarios.value = await listarUsuarios()
  } catch (err) {
    console.error('Erro ao carregar usuários:', err)
  }
}

// Bloqueia um usuário e atualiza a listinha na tela
async function bloquear(id) {
  await bloquearUsuario(id)
  await carregarUsuarios()
}

// Desbloqueia um usuário e atualiza a listinha na tela
async function desbloquear(id) {
  await desbloquearUsuario(id)
  await carregarUsuarios()
}
 
// Busca os perfis assim que a tela carrega
async function carregarPerfis() {
  try {
    perfis.value = await listarPerfis()
  } catch (err) {
    console.error('Erro ao carregar perfis:', err)
  }
}
 
// Envia o formulário de cadastro
async function cadastrarUsuario() {
  cadastrando.value = true
  mensagemUsuario.value = ''
  erroUsuario.value = ''
 
  try {
    await criarUsuario(novoUsuario.value)
    mensagemUsuario.value = 'Usuário cadastrado com sucesso!'
 
    // Limpa o formulário depois de cadastrar
    novoUsuario.value = { nome: '', email: '', senha: '', perfil_id: '' }
  } catch (err) {
    erroUsuario.value = err.response?.data?.erro || 'Erro ao cadastrar usuário'
  } finally {
    cadastrando.value = false
  }
}
// Transforma a "chave" técnica em um texto amigável pro ADM ler
function rotulo(chaves) {
  const nomes = {
    mensagem_bom_dia: 'Mensagem de Bom Dia',
    mensagem_boa_noite: 'Mensagem de Boa Noite',
    mensagem_agradecimento: 'Mensagem de Agradecimento'
  }
  return nomes[chaves] || chaves
}

// Carrega as configurações atuais ao abrir a tela
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

// Salva cada configuração alterada, uma por uma
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
  max-width: 600px;
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
textarea {
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

separador {
  margin: 32px 0;
  border: none;
  border-top: 1px solid #eee;
}
select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
/* ============================================================ */
/* SUBSTITUA o CSS .tabela-usuarios, .btn-bloquear e             */
/* .btn-desbloquear que você já tem no <style scoped> por este   */
/* ============================================================ */

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

/* Linha zebrada: facilita ler cada usuário separadamente */
.tabela-usuarios tbody tr:nth-child(even) {
  background: #fafafa;
}

.tabela-usuarios tbody tr:hover {
  background: #f0f4fa;
}

/* Divisória vertical entre colunas, sutil */
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
</style>