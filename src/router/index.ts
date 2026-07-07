// Importa as funções do Vue Router
// createRouter → cria o sistema de rotas
// createWebHistory → usa URLs bonitas (sem #)
import { createRouter, createWebHistory } from 'vue-router'

// =========================
// IMPORTAÇÃO DOS LAYOUTS
// =========================

// AuthLayout → layout usado ANTES do login
// Normalmente não tem menu, nem navbar
// Ex: tela de login, recuperar senha
import AuthLayout from '@/layouts/AuthLayout.vue'

// DefaultLayout → layout do sistema após login
// Normalmente tem menu, header, sidebar, etc
import DefaultLayout from '@/layouts/DefaultLayout.vue'

// =========================
// IMPORTAÇÃO DAS TELAS (VIEWS)
// =========================

// Tela de Login
import LoginView from '@/views/LoginView.vue'

// Tela de Chamados (sistema)
import ChamadosView from '@/views/ChamadosView.vue'

// 👇 adiciona estas duas linhas aqui
import ConfiguracoesView from '@/views/ConfiguracaoView.vue'
import { isAdmin, estaAutenticado } from '@/services/authServices.js'
import AdminLoginView from '@/views/AdminloginView.vue'
import ContatosView from '@/views/ContatosView.vue'
import ConexoesView from '@/views/ConexoesView.vue'
import RespostasRapidasView from '@/views/respostaRapidaView.vue'

// =========================
// CRIAÇÃO DO ROUTER
// =========================

const router = createRouter({
  // Define o tipo de navegação (histórico do navegador)
  history: createWebHistory(),

  // =========================
  // DEFINIÇÃO DAS ROTAS
  // =========================
  routes: [

    // 🔐 ROTAS DE AUTENTICAÇÃO
    // Tudo que for login, senha, etc
    {
      // URL base → http://localhost:5173/
      path: '/',

      // Layout usado nessa rota
      // O AuthLayout vai aparecer primeiro
      component: AuthLayout,

      // Rotas filhas (aparecem dentro do <router-view /> do layout)
      children: [
        {
          // Caminho vazio → continua sendo "/"
          path: '',

          // Nome interno da rota (usado em router.push)
          name: 'login',

          // Componente que será exibido
          component: LoginView
        },
          // 👇 adiciona este bloco aqui
    {
      path: 'admin-login',
      name: 'admin-login',
      component: AdminLoginView
    },
        
    
      ]
    },

    // 🧠 ROTAS DO SISTEMA (APÓS LOGIN)
    {
      // URL base do sistema
      // Ex: http://localhost:5173/app
      path: '/app',

      // Layout principal do sistema
      component: DefaultLayout,

      // Rotas internas do sistema
      children: [
        {
          // Caminho final: /app/chamados
          path: 'chamados',

          // Nome da rota
          name: 'chamados',

          // Tela que será exibida
          component: ChamadosView
        },
             // 👇 adiciona este bloco aqui, do lado do de chamados
    {
      path: 'configuracoes',
      name: 'configuracoes',
      component: ConfiguracoesView,
      meta: { requerLogin: true, requerAdmin: true }
    },// ============================================================
// 2) ADICIONE ESTA ROTA dentro dos children do DefaultLayout
// (path: '/app'), ao lado de 'chamados' e 'configuracoes'
// ============================================================
{
  path: 'contatos',
  name: 'contatos',
  component: ContatosView,
  meta: { requerLogin: true }
},
// ============================================================
// 2) ADICIONE ESTA ROTA dentro dos children do DefaultLayout
// (path: '/app'), ao lado de 'chamados' e 'contatos'
// ============================================================
{
  path: 'conexoes',
  name: 'conexoes',
  component: ConexoesView,
  meta: { requerLogin: true }
},
{
  path: 'respostas-rapidas',
  name: 'respostas-rapidas',
  component: RespostasRapidasView,
  meta: { requerLogin: true }
}
      ]
    }
  ]
})
// =========================
// GUARD DE NAVEGAÇÃO
// =========================
// Formato atual do Vue Router: em vez de chamar next(...),
// a função RETORNA o destino (string) ou true/false.
router.beforeEach((to) => {
  if (to.meta.requerLogin && !estaAutenticado()) {
    return '/'
  }
  if (to.meta.requerAdmin && !isAdmin()) {
    return '/app/chamados'
  }
  // Sem retorno = deixa navegar normalmente
})

// Exporta o router para ser usado no main.js
export default router