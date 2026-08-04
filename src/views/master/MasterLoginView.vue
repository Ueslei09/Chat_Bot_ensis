<template>
  <!-- master-auth-wrapper: Centraliza e aplica padding de segurança nos cantos -->
  <div class="master-auth-wrapper" :style="{ backgroundImage: `url(${bgImage})` }">
    <div class="master-auth-box shadow-lg rounded-4 p-4 p-sm-5 animate-fade-in">
      <div class="master-header text-center mb-4">
        <span class="master-badge badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-1 rounded-pill mb-2 fw-bold">SYSTEM ADMIN</span>
        <h2 class="text-white m-0 fw-semibold fs-4">Moove <span class="accent text-indigo">Chat Multi</span></h2>
        <p class="text-muted small mt-1 mb-0">Autenticação de Segurança Corporativa</p>
      </div>

      <form @submit.prevent="handleMasterLogin" class="master-form d-flex flex-column gap-3">
        <div class="input-wrapper d-flex flex-column gap-1">
          <label for="master-email" class="form-label text-light small fw-medium mb-1">E-mail do Administrador</label>
          <div class="input-field d-flex align-items-center rounded-3 px-3">
            <span class="icon me-2">📧</span>
            <input 
              id="master-email"
              v-model="email" 
              type="email" 
              placeholder="root@moove.com" 
              class="form-control form-control-sm bg-transparent border-0 text-white shadow-none py-2"
              required 
            />
          </div>
        </div>

        <div class="input-wrapper d-flex flex-column gap-1">
          <label for="master-password" class="form-label text-light small fw-medium mb-1">Chave de Segurança (Senha)</label>
          <div class="input-field d-flex align-items-center rounded-3 px-3">
            <span class="icon me-2">🔒</span>
            <input 
              id="master-password"
              v-model="senha" 
              type="password" 
              placeholder="••••••••••••" 
              class="form-control form-control-sm bg-transparent border-0 text-white shadow-none py-2"
              required 
            />
          </div>
        </div>

        <div v-if="erro" class="error-container d-flex align-items-center gap-2 alert alert-danger py-2 mb-0 small" role="alert">
          <span class="error-icon">⚠️</span>
          <p class="error-text mb-0">{{ erro }}</p>
        </div>

        <button type="submit" :disabled="carregando" class="btn btn-master-login btn-primary w-100 py-2 fw-semibold d-flex justify-content-center align-items-center gap-2 mt-2">
          <span>{{ carregando ? 'Validando Credenciais...' : 'Acessar Infraestrutura' }}</span>
          <span v-if="!carregando" class="arrow">→</span>
        </button>
      </form>

      <div class="master-footer text-center mt-4 pt-3 border-top border-secondary border-opacity-25">
        <p class="text-muted small mb-0" style="font-size: 0.75rem;">Acessos são monitorados por logs de auditoria.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useMasterLogin } from '@/composables/useMasterLogin'
import bgImage from '@/assets/imagenschatbot/MOVE.png'

const {
  email,
  senha,
  erro,
  carregando,
  handleMasterLogin
} = useMasterLogin()
</script>

<style scoped>
/* 🎨 Estilo Premium Dark Adaptativo */
.master-auth-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  
  background-size: cover;        
  background-position: center;    
  background-repeat: no-repeat;   
  
  font-family: 'Segoe UI', Roboto, sans-serif;
  padding: 16px;
}

.master-auth-box {
  background: rgba(20, 15, 38, 0.82);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(99, 102, 241, 0.2);
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
}

.master-badge {
  background: rgba(239, 68, 68, 0.15) !important;
  color: #f87171 !important;
  border-color: rgba(239, 68, 68, 0.3) !important;
  font-size: 0.72rem;
  letter-spacing: 1.5px;
}

.master-header .accent {
  color: #6366f1;
  display: block;
  font-size: 1.05rem;
  font-weight: 400;
  margin-top: 4px;
}

.input-field {
  background: #110c22;
  border: 1px solid #332a57;
  transition: all 0.3s ease;
}

.input-field:focus-within {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.input-field input::placeholder {
  color: #4b5563;
}

.btn-master-login {
  background-color: #4f46e5 !important;
  border: none !important;
  border-radius: 8px !important;
  transition: background 0.2s ease;
}

.btn-master-login:hover {
  background-color: #4338ca !important;
}

.btn-master-login:disabled {
  background-color: #312e81 !important;
  color: #6366f1 !important;
  cursor: not-allowed;
}

/* Animação suave de entrada */
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>