<template>
  <div class="master-layout">
    
    <!-- 📱 TOPO MOBILE: Só aparece em celulares e tablets -->
    <header class="master-topbar-mobile d-md-none border-bottom">
      <span class="logo-text-mobile">Moove Master</span>
      <button class="btn-menu-toggle" @click="menuAberto = !menuAberto" aria-label="Abrir menu">
        <span class="barras" :class="{ 'menu-ativo': menuAberto }"></span>
      </button>
    </header>

    <!-- Menu Lateral: Adaptativo para Desktop e Gaveta flutuante no Mobile -->
    <aside :class="['master-sidebar', menuAberto ? 'sidebar-aberta' : 'sidebar-fechada']">
      <div class="sidebar-header">
        <h2>Moove Chat-Multi</h2>
        <span class="badge-master">SUPER ADMIN</span>
      </div>
      
      <nav>
        <router-link to="/master/empresas" @click="menuAberto = false">🏢 Empresas Cadastradas</router-link>
        <!-- <router-link to="/master/config" @click="menuAberto = false">⚙️ Configurações Globais</router-link> -->
        <a href="#" @click.prevent="logout">🚪 Sair do Painel</a>
      </nav>
    </aside>

    <!-- Camada escura de fundo (Overlay) quando o menu mobile está aberto -->
    <div v-if="menuAberto" class="sidebar-overlay d-md-none" @click="menuAberto = false"></div>

    <!-- Onde as suas telas master vão renderizar -->
    <main class="master-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const menuAberto = ref(false)
const router = useRouter()
const authStore = useAuthStore()

const logout = () => {
  try {
    menuAberto.value = false
    authStore.limparSessao() 
  } catch (error) {
    console.error('Erro ao limpar a sessão:', error)
  } finally {
    router.push('/master-login')
  }
}
</script>

<style scoped>
/* ---------- LAYOUT BASE E DESKTOP ---------- */
.master-layout {
  display: flex;
  flex-direction: column; /* Inicia empilhado por causa do mobile */
  min-height: 100vh;
  background: #0f172a;
  color: #fff;
}

@media (min-width: 768px) {
  .master-layout {
    flex-direction: row; /* Volta a ser colunas lado a lado no desktop */
  }
}

/* 📱 ESTILIZAÇÃO DO TOPO MOBILE */
.master-topbar-mobile {
  height: 60px;
  background: #1e293b;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1040;
  border-color: rgba(255, 255, 255, 0.05) !important;
}
.logo-text-mobile {
  font-weight: bold;
  font-size: 18px;
  color: #ffffff;
}

/* Botão Hambúrguer Animado */
.btn-menu-toggle {
  background: transparent;
  border: none;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.barras {
  display: block;
  width: 20px;
  height: 2px;
  background: #cbd5e1;
  position: relative;
  transition: background 0.2s ease;
}
.barras::before, .barras::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 2px;
  background: #cbd5e1;
  transition: all 0.2s ease;
}
.barras::before { top: -6px; }
.barras::after { bottom: -6px; }

.barras.menu-ativo { background: transparent; }
.barras.menu-ativo::before { transform: rotate(45deg); top: 0; }
.barras.menu-ativo::after { transform: rotate(-45deg); bottom: 0; }

/* ---------- 🏢 MENU LATERAL RESPONSIVO (SIDEBAR) ---------- */
.master-sidebar {
  width: 260px;
  background: #1e293b;
  padding: 24px 20px;
  border-right: 1px solid rgba(255,255,255,0.05);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1050;
}

.sidebar-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.sidebar-header h2 {
  font-size: 20px;
  margin: 0;
}
.badge-master {
  font-size: 10px;
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 2px 8px;
  border-radius: 4px;
  width: fit-content;
  font-weight: bold;
  letter-spacing: 0.5px;
}

.master-sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 24px;
}

.master-sidebar a {
  color: #cbd5e1;
  text-decoration: none;
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}
.master-sidebar a:hover {
  background: rgba(255,255,255,0.05);
  color: #fff;
}

.router-link-active {
  background: #4f46e5 !important;
  color: white !important;
  font-weight: 600 !important;
}

/* 🎯 COMPORTAMENTO DO MENU NO MOBILE (Telas < 768px) */
@media (max-width: 767px) {
  .master-sidebar {
    position: fixed;
    top: 60px; /* Inicia logo abaixo do topo mobile */
    bottom: 0;
    left: 0;
    height: calc(100vh - 60px);
    box-shadow: 10px 0 30px rgba(0,0,0,0.5);
  }
  .sidebar-fechada {
    transform: translateX(-100%); /* Joga o menu para fora da tela */
  }
  .sidebar-aberta {
    transform: translateX(0); /* Traz o menu de volta deslizando */
  }
  .sidebar-overlay {
    position: fixed;
    inset: 60px 0 0 0;
    background: rgba(0,0,0,0.4);
    z-index: 1045;
  }
}

/* ---------- 📊 ÁREA DE CONTEÚDO PRINCIPAL ---------- */
.master-content {
  flex: 1;
  padding: 20px;
  background: #0f172a;
  margin-top: 60px; /* Compensa a altura do topo fixo no mobile */
}

@media (min-width: 768px) {
  .master-content {
    padding: 30px;
    margin-top: 0; /* Remove a compensação já que a barra superior some no desktop */
  }
  .sidebar-fechada {
    transform: none; /* Garante que o menu nunca suma no desktop */
  }
}

/* Auxiliares Bootstrap */
.d-none { display: none !important; }
@media (min-width: 768px) {
  .d-md-none { display: none !important; }
}
</style>