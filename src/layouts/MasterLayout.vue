<!-- src/layouts/MasterLayout.vue -->
<template>
  <div class="master-layout">
    <!-- Menu Lateral Seletivo e Exclusivo seu -->
    <aside class="master-sidebar">
      <h2>Moove Chat-Multi</h2>
      <nav>
        <router-link to="/master/empresas">🏢 Empresas Cadastradas</router-link>
        <!-- <router-link to="/master/config">⚙️ Configurações Globais</router-link> -->
        <a href="#" @click.prevent="logout">🚪 Sair</a>
      </nav>
    </aside>

    <!-- Onde as suas telas master vão renderizar -->
    <main class="master-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const logout = () => {
  try {
   // 🎯 ALTERADO: Chama a action oficial que zera o Pinia, limpa o localStorage 
    // e evita que dados fantasmas do Super Admin fiquem salvos no navegador.
    authStore.limparSessao() 
  } catch (error) {
    console.error('Erro ao limpar a sessão:', error)
  } finally {
    // 2. Chuta você direto para a tela de login master
    router.push('/master-login')
  }
  }

</script>


<style scoped>
/* 🎨 Sugestão de estilo rápido para o seu painel se organizar em colunas: */
/* 🎨 Sugestão de estilo rápido para o seu painel se organizar em colunas: */
.master-layout {
  display: flex;
  min-height: 100vh;
  background: #0f172a;
  color: #fff;
}
.master-sidebar {
  width: 260px;
  background: #1e293b;
  padding: 20px;
  border-right: 1px solid rgba(255,255,255,0.05);
}
.master-sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

/* 🎯 CORRIGIDO: Removido o seletor inválido 'router-link' */
.master-sidebar a {
  color: #cbd5e1;
  text-decoration: none;
  padding: 10px;
  border-radius: 6px;
  transition: background 0.2s;
}

.master-sidebar a:hover {
  background: rgba(255,255,255,0.05);
}

/* 🔄 O Vue injeta automaticamente essa classe no 'a' correspondente à rota atual */
.router-link-active {
  background: #4f46e5 !important;
  color: white !important;
}

.master-content {
  flex: 1;
  padding: 30px;
  background: #0f172a;
}
</style>