// src/composables/useAuth.js
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { socket } from '@/services/api.js';

export function useAuth() {
  const carregando = ref(false);
  const erro = ref('');
  
  const router = useRouter();
  const authStore = useAuthStore();

  // Função centralizada de login para ser usada nas views
  const executarLogin = async (usuario, senha) => {
    try {
      erro.value = '';
      carregando.value = true;

      // Chama a store / service de autenticação que você já usa
      await authStore.realizarLogin(usuario, senha);

      // Conecta o Socket.IO com segurança
      if (socket && typeof socket.connect === 'function') {
        socket.connect();
      }

      // Redirecionamento baseado no perfil
      if (authStore.ehMaster) {
        router.push('/master/empresas');
      } else {
        router.push('/app/chamados');
      }

      return true;
    } catch (err) {
      console.error('Erro no login:', err);
      erro.value = err.response?.data?.erro || err.response?.data?.message || 'E-mail ou senha inválidos';
      return false;
    } finally {
      carregando.value = false;
    }
  };

  return {
    carregando,
    erro,
    executarLogin
  };
}