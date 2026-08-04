import { ref, onMounted } from 'vue';
import { listarDepartamentos } from '@/services/departamentoServices.js';

export function useDepartamentos() {
  const departamentos = ref([]);
  const carregandoDepartamentos = ref(false);

  const carregarDepartamentos = async () => {
    carregandoDepartamentos.value = true;
    try {
      const dados = await listarDepartamentos();
      console.log("📥 Dados recebidos da API de departamentos:", dados);
      departamentos.value = dados;
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error);
    } finally {
      carregandoDepartamentos.value = false;
    }
  };

  onMounted(() => {
    carregarDepartamentos();
  });

  return {
    departamentos,
    carregandoDepartamentos,
    carregarDepartamentos
  };
}