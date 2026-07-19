<template>
  <!-- Navbar principal: Ajustada para se comportar de forma fluida no mobile -->
  <nav class="navbar navbar-expand-lg bg-white border-bottom px-3 px-md-4 py-2 shadow-sm fixed-top-md">
    <div class="container-fluid d-flex align-items-center justify-content-between p-0">
      
      <!-- Marca do Sistema -->
      <router-link to="/app/chamados" class="navbar-brand fw-bold text-dark m-0 d-flex align-items-center gap-2 bg-transparent p-0">
        <span class="logo-text">Moove Chat-Multi</span>
      </router-link>

      <!-- 🖥️ LINKS DE NAVEGAÇÃO: Visíveis APENAS no Desktop -->
      <div class="menu-links d-none d-lg-flex align-items-center gap-2">
        <!-- 🎯 LINK EXCLUSIVO ADM: Dashboard Desktop -->
        <router-link v-if="authStore.eAdministrador" to="/app/dashboard" class="nav-item-modern dynamic-dash-link">
          <i class="bi bi-speedometer2 icon-nav"></i>
          <span>Dashboard</span>
        </router-link>

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
      </div>

      <!-- Ações da Direita: Avatar e Status (Sempre visível em qualquer tela) -->
      <div class="d-flex align-items-center gap-2">
        
        <!-- Separador Visual sutil (Ocultado no mobile para economizar espaço) -->
        <div class="vr mx-2 text-secondary opacity-25 d-none d-lg-block"></div>

        <!-- ==================== AVATAR + DROPDOWN STATUS ==================== -->
        <div class="avatar-wrapper">
          <button class="avatar-btn" @click="menuAberto = !menuAberto" title="Perfil e Status">
            <span class="avatar-circulo" :class="statusWhatsapp">
              {{ inicialNome }}
            </span>
          </button>

          <!-- Dropdown flutuante com ajuste de alinhamento no mobile -->
          <div v-if="menuAberto" class="dropdown-menu-custom">
            <div class="nome-usuario d-flex align-items-center gap-2">
              <i class="bi bi-person-circle text-secondary fs-5"></i>
              <span class="text-truncate" style="max-width: 180px;">{{ authStore.usuario?.nome || 'Usuário' }}</span>
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
                placeholder="Novo nome" 
                maxlength="50"
                :disabled="salvandoNome"
                @keyup.enter="salvarNome" 
              />
              <button @click="salvarNome" :disabled="salvandoNome || !novoNome.trim()">
                <i v-if="salvandoNome" class="spinner-border spinner-border-sm"></i>
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

  <!-- ==================== 📱 BARRA DE NAVEGAÇÃO INFERIOR: Exclusiva para Mobile/Tablet ==================== -->
  <div class="bottom-nav-mobile d-lg-none border-top">
    <!-- 🎯 LINK EXCLUSIVO ADM: Dashboard Mobile -->
    <router-link v-if="authStore.eAdministrador" to="/app/dashboard" class="bottom-nav-item">
      <i class="bi bi-speedometer2"></i>
      <span>Dashboard</span>
    </router-link>

    <router-link to="/app/chamados" class="bottom-nav-item">
      <i class="bi bi-chat-left-text"></i>
      <span>Chats</span>
    </router-link>

    <router-link to="/app/contatos" class="bottom-nav-item">
      <i class="bi bi-people"></i>
      <span>Contatos</span>
    </router-link>

    <router-link to="/app/conexoes" class="bottom-nav-item">
      <i class="bi bi-diagram-3"></i>
      <span>Conexões</span>
    </router-link>

    <router-link to="/app/respostas-rapidas" class="bottom-nav-item">
      <i class="bi bi-lightning-charge"></i>
      <span>Rápidas</span>
    </router-link>

    <!-- Opcional: Se a barra mobile encher muito, ajustes pode ficar oculto para usuários normais ou mantido como abaixo -->
    <router-link v-if="authStore.eAdministrador" to="/app/configuracoes" class="bottom-nav-item">
      <i class="bi bi-gear"></i>
      <span>Ajustes</span>
    </router-link>
  </div>

  <!-- ==================== FAIXA DE AVISO: INSTABILIDADE ==================== -->
  <div v-if="statusWhatsapp === 'offline'" class="aviso-instabilidade d-flex align-items-center justify-content-center gap-2 fixed-banner-mobile">
    <i class="bi bi-exclamation-triangle-fill"></i>
    <span class="texto-aviso-truncate">WhatsApp com instabilidade. Mensagens podem atrasar.</span>
  </div>

  <!-- Container de espaçamento necessário para a view não entrar embaixo da navbar inferior/superior no mobile -->
  <div class="conteudo-principal-wrapper">
    <router-view />
  </div>
</template>

<script setup>
/* Bloco <script setup> original intocado */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { atualizarMeuNome } from '@/services/usuariosServices.js'
import { listarConexoes } from '@/services/conexoesServices.js'

const authStore = useAuthStore()

const inicialNome = computed(() => {
  const nome = authStore.usuario?.nome || 'U'
  return nome.charAt(0).toUpperCase()
})

const menuAberto = ref(false)
const editando = ref(false)
const salvandoNome = ref(false)
const novoNome = ref('')

const statusWhatsapp = ref('nao-configurado')

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
    await atualizarMeuNome(nomeLimpo)
    if (authStore.usuario) {
      authStore.usuario.nome = nomeLimpo
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
  intervaloStatus = setInterval(verificarStatusWhatsapp, 30000)
})

onUnmounted(() => {
  if (intervaloStatus) clearInterval(intervaloStatus)
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1030;
  height: 56px;
}

.logo-text {
  font-size: 18px;
  color: #0f172a;
}

/* Item moderno de navegação desktop */
.nav-item-modern {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  padding: 8px 14px;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
}
.icon-nav {
  font-size: 16px;
  margin-right: 8px;
}
.nav-item-modern:hover {
  background-color: #f1f5f9;
  color: #1a3c6e;
}
.router-link-active:not(.bottom-nav-item) {
  background-color: #eff6ff;
  color: #1a3c6e !important;
  font-weight: 600;
}

/* Destaque sutil para o item de Dashboard do ADM */
.dynamic-dash-link {
  color: #1a3c6e;
}

/* ==================== 📱 CSS DA BARRA INFERIOR MOBILE ==================== */
.bottom-nav-mobile {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #ffffff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1030;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  padding-bottom: env(safe-area-inset-bottom);
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #64748b;
  text-decoration: none;
  font-size: 10px; /* Reduzido de 11px para acomodar o 6º botão se necessário sem quebrar */
  font-weight: 500;
  flex: 1;
  height: 100%;
  gap: 2px;
  transition: color 0.15s ease;
}

.bottom-nav-item i {
  font-size: 18px;
}

/* Estado ativo na barra inferior */
.bottom-nav-mobile .router-link-active {
  color: #1a3c6e !important;
  font-weight: bold;
}

/* ==================== CONFIGURAÇÃO DE WRAPPERS E LAYOUT ==================== */
.conteudo-principal-wrapper {
  padding-top: 56px;
  padding-bottom: 60px;
}
@media (min-width: 992px) {
  .conteudo-principal-wrapper {
    padding-bottom: 0px;
  }
}

/* ---------- CLASSES UTILITÁRIAS DINÂMICAS DO BOOTSTRAP ---------- */
.d-none { display: none !important; }
@media (min-width: 992px) {
  .d-lg-flex { display: flex !important; }
  .d-lg-none { display: none !important; }
  .d-none .d-lg-block { display: block !important; }
}

/* ---------- AVATAR E DROPDOWN ---------- */
.avatar-wrapper { position: relative; }
.avatar-btn { background: none; border: none; cursor: pointer; padding: 0; }
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
.avatar-btn:hover .avatar-circulo { transform: scale(1.05); }
.avatar-circulo.online { border-color: #10b981; }
.avatar-circulo.offline { border-color: #ef4444; }
.avatar-circulo.nao-configurado { border-color: #94a3b8; }

.dropdown-menu-custom {
  position: absolute;
  right: 0;
  top: 44px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  min-width: 240px;
  z-index: 1060;
  padding: 12px 0;
}

.nome-usuario { padding: 4px 16px; font-weight: 600; font-size: 14px; color: #1e293b; }
.status-linha { padding: 0 16px 8px; font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 8px; }
.dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.dot.online { background: #10b981; }
.dot.offline { background: #ef4444; }
.dot.nao-configurado { background: #94a3b8; }
.dropdown-menu-custom hr { margin: 8px 0; border: none; border-top: 1px solid #f1f5f9; }

.item { padding: 10px 16px; font-size: 13px; cursor: pointer; color: #334155; transition: all 0.15s ease; }
.item:hover { background: #f8fafc; color: #1a3c6e; }
.item.sair { color: #ef4444; }
.item.sair:hover { background: #fef2f2; }

.item-editar { padding: 8px 16px; display: flex; gap: 8px; }
.item-editar input { flex: 1; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; background-color: #f8fafc; width: 100px; }
.item-editar input:focus { outline: none; border-color: #1a3c6e; background-color: #fff; }
.item-editar button { background: #1a3c6e; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; }

/* ---------- AVISO DE INSTABILIDADE ---------- */
.aviso-instabilidade {
  background: #fef2f2;
  border-bottom: 1px solid #fca5a5;
  color: #dc2626;
  text-align: center;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 500;
  width: 100%;
}
.fixed-banner-mobile {
  position: fixed;
  top: 56px;
  left: 0;
  z-index: 1020;
}
.texto-aviso-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90%;
}
</style>