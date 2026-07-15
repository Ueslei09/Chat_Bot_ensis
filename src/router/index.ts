import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth' // Integrado com a nossa nova Store!

// Layouts continuam com importação estática (pois envelopam as rotas principais)
import AuthLayout from '@/layouts/AuthLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

// ==========================================
// 🚀 LAZY LOADING (Otimização de Performance)
// ==========================================
const LoginView = () => import('@/views/LoginView.vue')
const AdminLoginView = () => import('@/views/AdminloginView.vue')
const ChamadosView = () => import('@/views/ChamadosView.vue')
const ConfiguracoesView = () => import('@/views/ConfiguracaoView.vue')
const ContatosView = () => import('@/views/ContatosView.vue')
const ConexoesView = () => import('@/views/ConexoesView.vue')
const RespostasRapidasView = () => import('@/views/respostaRapidaView.vue')

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
      meta: { requerLogin: true }, // Blindagem global dos filhos
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
          meta: { requerAdmin: true } // Exclusivo ADM
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

// ==========================================
// 🛡️ GUARD DE NAVEGAÇÃO INTEGRADO AO PINIA
// ==========================================
router.beforeEach((to) => {
  // Acessamos a Store de autenticação de forma segura dentro do Guard
  const authStore = useAuthStore()
  const logado = authStore.autenticado
  const isAdmin = authStore.eAdministrador

  // 1. Se exige login e não está autenticado -> joga pro login
  if (to.matched.some(record => record.meta.requerLogin) && !logado) {
    return '/'
  }

  // 2. Se exige privilégio de ADM e não é ADM -> joga para os chamados
  if (to.matched.some(record => record.meta.requerAdmin) && !isAdmin) {
    return '/app/chamados'
  }

  // 3. Se já está logado e tenta ir para telas de login -> manda direto pro painel
  if ((to.name === 'login' || to.name === 'admin-login') && logado) {
    return '/app/chamados'
  }
})

export default router