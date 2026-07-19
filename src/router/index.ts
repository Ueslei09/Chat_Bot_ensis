import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import AuthLayout from '@/layouts/AuthLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import MasterLayout from '@/layouts/MasterLayout.vue'

const LoginView = () => import('@/views/LoginView.vue')
const AdminLoginView = () => import('@/views/AdminloginView.vue')
const ChamadosView = () => import('@/views/ChamadosView.vue')
const ConfiguracoesView = () => import('@/views/ConfiguracaoView.vue')
const ContatosView = () => import('@/views/ContatosView.vue')
const ConexoesView = () => import('@/views/ConexoesView.vue')
const RespostasRapidasView = () => import('@/views/respostaRapidaView.vue')
const EsqueciSenhaView = () => import('@/views/ForgotPasswordView.vue')
const RedefinirSenhaView = () => import('@/views/ResetPasswordView.vue')
const GerenciarEmpresasView = () => import('@/views/master/GerenciaEmpresas.vue')
const MasterLoginView = () => import('@/views/master/MasterLoginView.vue')

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
        },
        {
          path: 'esqueci-senha',
          name: 'esqueci-senha',
          component: EsqueciSenhaView,
          meta: { requerAutenticacao: false }
        },
        {
          path: 'redefinir-senha',
          name: 'redefinir-senha',
          component: RedefinirSenhaView,
          meta: { requerAutenticacao: false }
        }
      ]
    },

    // 👑 2. NOVO: LOGIN MASTER INDEPENDENTE (FORA DO AUTH LAYOUT COMUM)
    { 
      path: '/master-login', 
      name: 'master-login', 
      component: MasterLoginView 
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
          meta: { requerAdmin: true }
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
        },
        
      ]
    },
    {
      path: '/master',
      component: MasterLayout,
      meta: { requerLogin: true, requerSuperAdmin: true }, // Proteção total na raiz do bloco
      children: [
        {
          path: 'empresas', // Acessado via URL por: /master/empresas
          name: 'gerenciar-empresas',
          component: GerenciarEmpresasView
        }
        // Aqui você pode colocar no futuro: /master/faturamento, /master/suporte, etc.
      ]
    },

    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

//guardian de rotas
router.beforeEach((to) => {
  const authStore = useAuthStore()
  
  const token = localStorage.getItem('token')
  const logado = !!token || authStore.autenticado

  // 🔄 CORREÇÃO DE TIMING: Se não houver token no localStorage, o usuário NÃO está logado. 
  // Ignoramos qualquer lixo que tenha ficado no localStorage.
  if (!token) {
    authStore.usuario = null;
    authStore.autenticado = false;
  }

  // Pega o objeto do usuário de forma limpa
  const usuarioLocal = authStore.usuario || JSON.parse(localStorage.getItem('usuario') || '{}')
  
  // 🔍 Extrai as permissões
  const perfilId = Number(usuarioLocal?.perfil_id || 0)
  const perfilNome = String(usuarioLocal?.perfil || '').toUpperCase()

  // 🔒 Só é MASTER se estiver logado E tiver as credenciais no estado atual
  const ehMaster = logado && (perfilId === 3 || perfilNome === 'SUPER_ADMIN' || perfilNome === 'MASTER')

  console.log('--- NAVEGANDO PROTEGIDO ---')
  console.log('Rota de destino:', to.path)
  console.log('Está logado?:', logado)
  console.log('É Master?:', ehMaster)

  // 💡 Se estiver indo para as telas de login e já estiver logado, redireciona pro lugar certo
  if (to.path === '/' || to.path === '/master-login' || to.path === '/admin-login') {
    if (logado) {
      if (ehMaster) return '/master/empresas'
      return '/app/chamados'
    }
    return true
  }

  // 1. PROTEÇÃO DE ROTAS: Se exige login e não está logado
  if (to.matched.some(record => record.meta.requerLogin) && !logado) {
    if (to.path.startsWith('/master')) return '/master-login'
    return '/'
  }

  // 2. PROTEÇÃO MASTER BLINDADA: Se tentar entrar em qualquer rota que exija SuperAdmin
  const exigeSuperAdmin = to.matched.some(record => record.meta.requerSuperAdmin) || to.path.startsWith('/master')
  
  if (exigeSuperAdmin && !ehMaster) {
    console.warn('🛑 TENTATIVA DE INVASÃO: Acesso negado à área Master!')
    return '/app/chamados' // Chuta o usuário comum de volta para os chamados dele
  }

  return true 
})
export default router