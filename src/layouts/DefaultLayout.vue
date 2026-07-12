<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">Moove Chat-Multi</a>

      <div class="menu-links">
        <router-link to="/app/chamados">Chamados</router-link>
        <router-link to="/app/contatos">Contatos</router-link>
        <router-link to="/app/conexoes">Conexões</router-link>
        <router-link to="/app/respostas-rapidas">Respostas rápidas</router-link>
        <router-link v-if="admin" to="/app/configuracoes">Configurações</router-link>

        <!-- ==================== AVATAR + STATUS ==================== -->
        <div class="avatar-wrapper">
          <button class="avatar-btn" @click="menuAberto = !menuAberto">
            <span class="avatar-circulo" :class="statusWhatsapp">
              {{ inicialNome }}
            </span>
          </button>

          <div v-if="menuAberto" class="dropdown-menu-custom">
            <div class="nome-usuario">{{ nomeUsuario }}</div>
            <div class="status-linha">
            <span class="dot" :class="statusWhatsapp"></span>
  <template v-if="statusWhatsapp === 'online'">WhatsApp conectado</template>
  <template v-else-if="statusWhatsapp === 'offline'">Instabilidade no WhatsApp</template>
  <template v-else>WhatsApp ainda não configurado</template>
            </div>

            <hr />

            <div v-if="!editando" class="item" @click="editando = true">
              Trocar nome de usuário
            </div>
            <div v-else class="item-editar">
              <input v-model="novoNome" placeholder="Novo nome" />
              <button @click="salvarNome">Salvar</button>
            </div>

            <div class="item sair" @click="sair">Sair</div>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <!-- ==================== FAIXA DE AVISO: INSTABILIDADE ==================== -->
 <div v-if="statusWhatsapp === 'offline'" class="aviso-instabilidade">
  ⚠️ Instabilidade detectada na conexão com o WhatsApp. Algumas mensagens podem não ser entregues.
</div>

  <router-view />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { isAdmin, logout, getNomeUsuario } from '@/services/authServices.js'
import { atualizarMeuNome } from '@/services/usuariosServices.js'
import { listarConexoes } from '@/services/conexoesServices.js'

const admin = isAdmin()
const router = useRouter()

const nomeUsuario = ref(getNomeUsuario() || 'Usuário')
const inicialNome = computed(() => nomeUsuario.value.charAt(0).toUpperCase())

const menuAberto = ref(false)
const editando = ref(false)
const novoNome = ref('')

// 'online' (verde) ou 'offline' (vermelho), conforme as conexões WhatsApp
const statusWhatsapp = ref('nao-configurado')

// Verifica o status das conexões WhatsApp (tabela "conexoes")
async function verificarStatusWhatsapp() {
  try {
    const conexoes = await listarConexoes({ arquivadas: false })
    const conexoesWhatsapp = conexoes.filter(c => c.tipo === 'whatsapp')
 
    if (conexoesWhatsapp.length === 0) {
      // Nenhuma conexão cadastrada ainda -> não dá pra dizer que está "conectado"
      statusWhatsapp.value = 'nao-configurado'
      return
    }
 
    const algumaDesconectada = conexoesWhatsapp.some(c => c.status !== 'conectado')
    statusWhatsapp.value = algumaDesconectada ? 'offline' : 'online'
  } catch (err) {
    console.error('Erro ao verificar status do WhatsApp:', err)
  }
}

let intervaloStatus = null

async function salvarNome() {
  if (!novoNome.value.trim()) return
  await atualizarMeuNome(novoNome.value)
  nomeUsuario.value = novoNome.value
  editando.value = false
  menuAberto.value = false
  novoNome.value = ''
  // Nota: o nome no token só atualiza no próximo login;
  // aqui já refletimos visualmente na hora.
}

function sair() {
  logout()
  router.push('/')
}

onMounted(() => {
  verificarStatusWhatsapp()
  // Confere o status a cada 30 segundos, pra pegar quedas em tempo quase real
  intervaloStatus = setInterval(verificarStatusWhatsapp, 30000)
})

onUnmounted(() => {
  if (intervaloStatus) clearInterval(intervaloStatus)
})
</script>

<style scoped>
.menu-links {
  display: flex;
  align-items: center;
  gap: 16px;
}
.menu-links a {
  text-decoration: none;
  color: #1a3c6e;
  font-size: 14px;
}

.avatar-wrapper {
  position: relative;
}
.avatar-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
.avatar-circulo {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: bold;
  font-size: 14px;
  background: #1a3c6e;
  border: 3px solid #ccc;
}
.avatar-circulo.online {
  border-color: #27ae60;
}
.avatar-circulo.offline {
  border-color: #c0392b;
}

.dropdown-menu-custom {
  position: absolute;
  right: 0;
  top: 42px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  min-width: 220px;
  z-index: 10;
  padding: 10px 0;
}
.nome-usuario {
  padding: 4px 14px 8px;
  font-weight: bold;
  font-size: 13px;
}
.status-linha {
  padding: 0 14px 8px;
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.dot.online {
  background: #27ae60;
}
.dot.offline {
  background: #c0392b;
}
.dropdown-menu-custom hr {
  margin: 6px 0;
  border: none;
  border-top: 1px solid #eee;
}
.item {
  padding: 10px 14px;
  font-size: 13px;
  cursor: pointer;
}
.item:hover {
  background: #f5f5f5;
}
.item.sair {
  color: #c0392b;
}
.item-editar {
  padding: 8px 14px;
  display: flex;
  gap: 6px;
}
.item-editar input {
  flex: 1;
  padding: 4px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 13px;
}
.item-editar button {
  background: #1a3c6e;
  color: #fff;
  border: none;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.aviso-instabilidade {
  background: #fdecea;
  color: #c0392b;
  text-align: center;
  padding: 8px;
  font-size: 13px;
  font-weight: 500;
}

.dot.nao-configurado {
  background: #bbb;
}
.avatar-circulo.nao-configurado {
  border-color: #bbb;
}
</style>