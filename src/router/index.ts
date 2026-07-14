// Importa as funções do Vue Router
import { createRouter, createWebHistory } from 'vue-router'
import { isAdmin, estaAutenticado } from '@/services/authServices.js'

// =========================
// IMPORTAÇÃO DOS LAYOUTS
// =========================
import AuthLayout from '@/layouts/AuthLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

// =========================
// IMPORTAÇÃO DAS TELAS (VIEWS)
// =========================
import LoginView from '@/views/LoginView.vue'
import AdminLoginView from '@/views/AdminloginView.vue'
import ChamadosView from '@/views/ChamadosView.vue'
import ConfiguracoesView from '@/views/ConfiguracaoView.vue'
import ContatosView from '@/views/ContatosView.vue'
import ConexoesView from '@/views/ConexoesView.vue'
import RespostasRapidasView from '@/views/respostaRapidaView.vue'

// =========================
// CRIAÇÃO DO ROUTER
// =========================
const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 🔐 ROTAS DE AUTENTICAÇÃO (ANTES DO LOGIN)
    {
      path: '/',
      component: AuthLayout,
      children: [
        {
          path: '',
          name: 'login',
          component: LoginView
        },
        {
          path: 'admin-login',
          name: 'admin-login',
          component: AdminLoginView
        }
      ]
    },

    // 🧠 ROTAS DO SISTEMA (APÓS LOGIN)
    {
      path: '/app',
      component: DefaultLayout,
      // Aplicamos o requerLogin na rota pai para blindar todos os filhos de uma vez só!
      meta: { requerLogin: true }, 
      children: [
        {
          path: 'chamados',
          name: 'chamados',
          component: ChamadosView
        },
        {
          path: 'configuracoes',
          name: 'configuracoes',
          component: ConfiguracoesView,
          meta: { requerAdmin: true } // Além de login, exige ser administrador
        },
        {
          path: 'contatos',
          name: 'contatos',
          component: ContatosView
        },
        {
          path: 'conexoes',
          name: 'conexoes',
          component: ConexoesView
        },
        {
          path: 'respostas-rapidas',
          name: 'respostas-rapidas',
          component: RespostasRapidasView
        }
      ]
    },

    // Redirecionamento caso a URL digitada não exista
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// =========================
// GUARD DE NAVEGAÇÃO (O PEDÁGIO)
// =========================
router.beforeEach((to) => {
  const logado = estaAutenticado()

  // 1. Se a rota exige login e o usuário não está autenticado -> joga pro login
  // O "to.matched.some" verifica tanto na rota pai (/app) quanto nos filhos
  if (to.matched.some(record => record.meta.requerLogin) && !logado) {
    return '/'
  }

  // 2. Se a rota exige privilégio administrativo e o usuário não é ADM -> joga pros chamados
  if (to.matched.some(record => record.meta.requerAdmin) && !isAdmin()) {
    return '/app/chamados'
  }

  // 3. Se o usuário já está logado e tenta ir para a tela de login -> manda direto pro painel
  if ((to.name === 'login' || to.name === 'admin-login') && logado) {
    return '/app/chamados'
  }

  // Sem retorno = deixa navegar normalmente
})

export default router