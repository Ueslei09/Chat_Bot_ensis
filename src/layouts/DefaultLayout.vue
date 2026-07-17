<template>
  <!-- Navbar principal com fundo branco limpo, borda sutil e sombra elegante -->
  <nav class="navbar navbar-expand-lg bg-white border-bottom px-4 py-2 shadow-sm">
    <div class="container-fluid d-flex align-items-center justify-content-between">
      
      <!-- Marca do Sistema -->
      <router-link to="/app/chamados" class="navbar-brand fw-bold text-dark m-0 d-flex align-items-center gap-2">
        <span class="logo-text">Moove Chat-Multi</span>
      </router-link>

      <!-- Links de Navegação e Menu Lateral -->
      <div class="menu-links d-flex align-items-center gap-2">
        
        <router-link to="/app/chamados" class="nav-item-modern">
          <i class="bi bi-chat-left-text icon-nav"></i>
          <span>Chamados</span>
        </router-link>

        <router-link to="/app/contatos" class="nav-item-modern">
          <i class="bi bi-people icon-nav"></i>
          <span>Contatos</span>
        </router-link>

        <router-link to="/app/conexoes" class="nav-item-modern">
          <i class="bi bi-diagram-3 icon-nav"></i>
          <span>Conexões</span>
        </router-link>

        <router-link to="/app/respostas-rapidas" class="nav-item-modern">
          <i class="bi bi-lightning-charge icon-nav"></i>
          <span>Respostas rápidas</span>
        </router-link>

        <!-- Exibe Configurações apenas para administradores -->
        <router-link v-if="authStore.eAdministrador" to="/app/configuracoes" class="nav-item-modern">
          <i class="bi bi-gear icon-nav"></i>
          <span>Configurações</span>
        </router-link>

        <!-- Separador Visual sutil -->
        <div class="vr mx-2 text-secondary opacity-25"></div>

        <!-- ==================== AVATAR + DROPDOWN STATUS ==================== -->
        <div class="avatar-wrapper">
          <button class="avatar-btn" @click="menuAberto = !menuAberto" title="Perfil e Status">
            <span class="avatar-circulo" :class="statusWhatsapp">
              {{ inicialNome }}
            </span>
          </button>

          <!-- Dropdown flutuante com sombra de profundidade -->
          <div v-if="menuAberto" class="dropdown-menu-custom">
            
            <div class="nome-usuario d-flex align-items-center gap-2">
              <i class="bi bi-person-circle text-secondary fs-5"></i>
              <span>{{ authStore.usuario?.nome || 'Usuário' }}</span>
            </div>
            
            <div class="status-linha">
              <span class="dot" :class="statusWhatsapp"></span>
              <template v-if="statusWhatsapp === 'online'">WhatsApp conectado</template>
              <template v-else-if="statusWhatsapp === 'offline'">Instabilidade detectada</template>
              <template v-else>Não configurado</template>
            </div>

            <hr />

            <!-- Opção de trocar nome -->
            <div v-if="!editando" class="item d-flex align-items-center gap-2" @click="editando = true">
              <i class="bi bi-pencil-square"></i>
              <span>Alterar nome</span>
            </div>
            
            <div v-else class="item-editar">
              <input 
                v-model="novoNome" 
                placeholder="Novo nome (máx. 50)" 
                maxlength="50"
                :disabled="salvandoNome"
                @keyup.enter="salvarNome" 
              />
              <button @click="salvarNome" :disabled="salvandoNome || !novoNome.trim()">
                <i v-if="salvandoNome" class="spinner-border spinner-border-sm me-1"></i>
                <span v-else>Salvar</span>
              </button>
            </div>

            <!-- Botão Sair -->
            <div class="item sair d-flex align-items-center gap-2" @click="sair">
              <i class="bi bi-box-arrow-right"></i>
              <span>Sair do painel</span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  </nav>

  <!-- ==================== FAIXA DE AVISO: INSTABILIDADE ==================== -->
  <div v-if="statusWhatsapp === 'offline'" class="aviso-instabilidade d-flex align-items-center justify-content-center gap-2 animate__animated animate__fadeIn">
    <i class="bi bi-exclamation-triangle-fill"></i>
    <span>Atenção: Identificamos instabilidade na conexão com o WhatsApp. Algumas mensagens podem atrasar.</span>
  </div>

  <router-view />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { atualizarMeuNome } from '@/services/usuariosServices.js'
import { listarConexoes } from '@/services/conexoesServices.js'

const authStore = useAuthStore()

// Computa a inicial a partir do estado reativo do Pinia
const inicialNome = computed(() => {
  const nome = authStore.usuario?.nome || 'U'
  return nome.charAt(0).toUpperCase()
})

const menuAberto = ref(false)
const editando = ref(false)
const salvandoNome = ref(false)
const novoNome = ref('')

// 'online' (verde) ou 'offline' (vermelho), conforme as conexões WhatsApp
const statusWhatsapp = ref('nao-configurado')

// Verifica o status das conexões WhatsApp (tabela "conexoes")
async function verificarStatusWhatsapp() {
  try {
    const conexoes = await listarConexoes({ arquivadas: false })
    const conexoesWhatsapp = conexoes.filter(c => c.tipo === 'whatsapp')
 
    if (conexoesWhatsapp.length === 0) {
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
  const nomeLimpo = novoNome.value.trim()
  if (!nomeLimpo || nomeLimpo.length > 50) return
  
  salvandoNome.value = true
  try {
    // Atualiza no backend
    await atualizarMeuNome(nomeLimpo)
    
    // Sincroniza a atualização reativa no estado global do Pinia
    if (authStore.usuario) {
      authStore.usuario.nome = nomeLimpo
      // Atualiza também no localStorage para persistência de F5
      localStorage.setItem('usuario', JSON.stringify(authStore.usuario))
    }
    
    editando.value = false
    menuAberto.value = false
    novoNome.value = ''
  } catch (err) {
    console.error('Erro ao salvar novo nome:', err)
  } finally {
    salvandoNome.value = false
  }
}

function sair() {
  authStore.logout()
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
.logo-text {
  font-size: 18px;
  color: #0f172a;
}

.menu-links {
  display: flex;
  align-items: center;
}

/* Item moderno de navegação compatível com Bootstrap */
.nav-item-modern {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  color: #475569; /* Cinza slate suave */
  padding: 8px 14px;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
}

.icon-nav {
  font-size: 16px;
  margin-right: 8px; /* Espaço uniforme entre ícone e texto */
}

/* Hover suave */
.nav-item-modern:hover {
  background-color: #f1f5f9;
  color: #1a3c6e;
}

/* Estado Ativo: Ativado automaticamente pelo Vue Router */
.router-link-active {
  background-color: #eff6ff; /* Azul pastel suave */
  color: #1a3c6e !important;
  font-weight: 600;
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
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: bold;
  font-size: 14px;
  background: #1a3c6e;
  border: 3px solid #e2e8f0;
  transition: all 0.2s ease;
}

/* Hover no avatar dá um zoom suave */
.avatar-btn:hover .avatar-circulo {
  transform: scale(1.05);
}

.avatar-circulo.online {
  border-color: #10b981; /* Verde esmeralda moderno */
}
.avatar-circulo.offline {
  border-color: #ef4444; /* Vermelho moderno */
}
.avatar-circulo.nao-configurado {
  border-color: #94a3b8; /* Cinza */
}

.dropdown-menu-custom {
  position: absolute;
  right: 0;
  top: 48px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  min-width: 240px;
  z-index: 50;
  padding: 12px 0;
}

.nome-usuario {
  padding: 4px 16px;
  font-weight: 600;
  font-size: 14px;
  color: #1e293b;
}

.status-linha {
  padding: 0 16px 8px;
  font-size: 12px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.dot.online {
  background: #10b981;
}
.dot.offline {
  background: #ef4444;
}
.dot.nao-configurado {
  background: #94a3b8;
}

.dropdown-menu-custom hr {
  margin: 8px 0;
  border: none;
  border-top: 1px solid #f1f5f9;
}

.item {
  padding: 10px 16px;
  font-size: 13px;
  cursor: pointer;
  color: #334155;
  transition: all 0.15s ease;
}
.item:hover {
  background: #f8fafc;
  color: #1a3c6e;
}
.item.sair {
  color: #ef4444;
}
.item.sair:hover {
  background: #fef2f2;
}

.item-editar {
  padding: 8px 16px;
  display: flex;
  gap: 8px;
}
.item-editar input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 13px;
  background-color: #f8fafc;
}
.item-editar input:focus {
  outline: none;
  border-color: #1a3c6e;
  background-color: #fff;
}
.item-editar button {
  background: #1a3c6e;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}
.item-editar button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.aviso-instabilidade {
  background: #fef2f2;
  border-bottom: 1px solid #fca5a5;
  color: #dc2626;
  text-align: center;
  padding: 10px;
  font-size: 13px;
  font-weight: 500;
}
</style>