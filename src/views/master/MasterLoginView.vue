<!-- src/views/master/MasterLoginView.vue -->
<template>
  <div class="master-auth-wrapper">
    <div class="master-auth-box">
      <div class="master-header">
        <div class="master-badge">SYSTEM ADMIN</div>
        <h2>Moove <span class="accent">SaaS Multi-Tenant</span></h2>
        <p>Autenticação de Segurança Corporativa</p>
      </div>

      <form @submit.prevent="handleMasterLogin" class="master-form">
        <div class="input-wrapper">
          <label for="master-email">E-mail do Administrador</label>
          <div class="input-field">
            <span class="icon">📧</span>
            <input 
              id="master-email"
              v-model="email" 
              type="email" 
              placeholder="root@moove.com" 
              required 
            />
          </div>
        </div>

        <div class="input-wrapper">
          <label for="master-password">Chave de Segurança (Senha)</label>
          <div class="input-field">
            <span class="icon">🔒</span>
            <input 
              id="master-password"
              v-model="senha" 
              type="password" 
              placeholder="••••••••••••" 
              required 
            />
          </div>
        </div>

        <div v-if="erro" class="error-container">
          <span class="error-icon">⚠️</span>
          <p class="error-text">{{ erro }}</p>
        </div>

        <button type="submit" :disabled="carregando" class="btn-master-login">
          <span>{{ carregando ? 'Validando Credenciais...' : 'Acessar Infraestrutura' }}</span>
          <span v-if="!carregando" class="arrow">→</span>
        </button>
      </form>

      <div class="master-footer">
        <p>Acessos são monitorados por logs de auditoria.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const email = ref('')
const senha = ref('')
const erro = ref('')
const carregando = ref(false)

const router = useRouter()
const authStore = useAuthStore()

const handleMasterLogin = async () => {
  try {
    erro.value = ''
    carregando.value = true

    console.log('--- ENVIANDO LOGIN MASTER ---')
    
    // 💥 CORREÇÃO: Executa a chamada real da API que havia sumido!
    const resposta = await authStore.realizarLogin(email.value, senha.value)

    // 1. Pegamos os dados crus vindos da resposta do servidor
    const dadosDoServidor = resposta?.data?.user || resposta?.user || authStore.usuario

    console.log('=== AUDITORIA DE LOGIN MASTER ===')
    console.log('Objeto completo do usuário retornado:', dadosDoServidor)

    if (dadosDoServidor) {
      // Convertemos para string/número para evitar erros de tipo (3 vs "3")
      const idPerfil = String(dadosDoServidor.perfil_id || dadosDoServidor.profileId || '')
      const nomePerfil = String(dadosDoServidor.perfil || dadosDoServidor.profile || '').toUpperCase()

      console.log('ID do Perfil extraído:', idPerfil)
      console.log('Nome do Perfil extraído:', nomePerfil)

      // 🔒 VALIDAÇÃO SEGURA (Só aceita o que o BACKEND confirmar)
     const eMaster = idPerfil === '3' || 
                nomePerfil === 'MASTER' || 
                nomePerfil === 'SUPER_ADMIN' || 
                nomePerfil === 'SUPERADMIN'
      if (eMaster) {
        console.log('Acesso Master Autorizado pelo Servidor!')
        router.push('/master/empresas')
      } else {
        console.error('O Servidor não confirmou este usuário como MASTER.')
        erro.value = 'Acesso restrito apenas ao administrador do SaaS.'
        authStore.limparSessao()
      }
    } else {
      erro.value = 'Não foi possível ler os dados do usuário vindos do servidor.'
      authStore.limparSessao()
    }

  } catch (err) {
    console.error('Erro na requisição de login:', err)
    erro.value = err.response?.data?.message || 'Chave de acesso ou senha incorreta.'
  } finally {
    carregando.value = false
  }
}
</script>

<style scoped>
/* 🎨 Estilo Premium Dark */
.master-auth-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: radial-gradient(circle at center, #1e1b4b 0%, #090514 100%);
  font-family: 'Segoe UI', Roboto, sans-serif;
  padding: 20px;
}

.master-auth-box {
  background: rgba(20, 15, 38, 0.75);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(99, 102, 241, 0.2);
  padding: 40px;
  border-radius: 16px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.master-header {
  text-align: center;
  margin-bottom: 30px;
}

.master-badge {
  display: inline-block;
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  margin-bottom: 12px;
}

.master-header h2 {
  color: #ffffff;
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.master-header .accent {
  color: #6366f1;
  display: block;
  font-size: 1.1rem;
  font-weight: 400;
  margin-top: 4px;
}

.master-header p {
  color: #94a3b8;
  font-size: 0.9rem;
  margin: 8px 0 0 0;
}

.master-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-wrapper label {
  color: #cbd5e1;
  font-size: 0.85rem;
  font-weight: 500;
}

.input-field {
  display: flex;
  align-items: center;
  background: #110c22;
  border: 1px solid #332a57;
  border-radius: 8px;
  padding: 0 14px;
  transition: all 0.3s ease;
}

.input-field:focus-within {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.input-field .icon {
  font-size: 1.1rem;
  margin-right: 10px;
}

.input-field input {
  background: transparent;
  border: none;
  color: #ffffff;
  padding: 14px 0;
  width: 100%;
  font-size: 1rem;
  outline: none;
}

.input-field input::placeholder {
  color: #4b5563;
}

.error-container {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.2);
  padding: 12px;
  border-radius: 8px;
}

.error-text {
  color: #f87171;
  font-size: 0.85rem;
  margin: 0;
}

.btn-master-login {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-top: 10px;
}

.btn-master-login:hover {
  background: #4338ca;
}

.master-footer {
  text-align: center;
  margin-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 20px;
}

.master-footer p {
  color: #64748b;
  font-size: 0.75rem;
  margin: 0;
}
</style>