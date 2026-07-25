// src/composables/useConfiguracoes.js
import { ref } from 'vue';
import { listarConfiguracoes, atualizarConfiguracao } from '@/services/configuracaoServices.js';

export function useConfiguracoes() {
  const configuracoes = ref([]);
  const carregando = ref(true);
  const salvando = ref(false);
  const mensagem = ref('');
  const erro = ref('');

  const carregarConfiguracoes = async () => {
    carregando.value = true;
    erro.value = '';
    try {
      configuracoes.value = await listarConfiguracoes();
    } catch (err) {
      erro.value = 'Erro ao carregar configurações';
    } finally {
      carregando.value = false;
    }
  };

  const salvarConfiguracoes = async () => {
    salvando.value = true;
    mensagem.value = '';
    erro.value = '';

    try {
      for (const config of configuracoes.value) {
        await atualizarConfiguracao(config.chaves, config.valor);
      }
      mensagem.value = 'Configurações salvas com sucesso!';
      return true;
    } catch (err) {
      erro.value = 'Erro ao salvar. Verifique se você está logado como ADM.';
      return false;
    } finally {
      salvando.value = false;
    }
  };

  const rotuloConfiguracao = (chaves) => {
    const nomes = {
      mensagem_bom_dia: 'Mensagem de Bom Dia',
      mensagem_boa_noite: 'Mensagem de Boa Noite',
      mensagem_agradecimento: 'Mensagem de Agradecimento'
    };
    return nomes[chaves] || chaves;
  };

  return {
    configuracoes,
    carregando,
    salvando,
    mensagem,
    erro,
    carregarConfiguracoes,
    salvarConfiguracoes,
    rotuloConfiguracao
  };
}