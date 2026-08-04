// src/composables/useUsuarios.js
import { ref } from 'vue';
import { 
  listarPerfis, 
  criarUsuario, 
  listarUsuarios, 
  bloquearUsuario, 
  desbloquearUsuario, 
  alternarPermissaoApagar 
} from '@/services/usuariosServices.js';
import { listarDepartamentos } from '@/services/departamentoServices.js';

export function useUsuarios() {
  const perfis = ref([]);
  const usuarios = ref([]);
  const departamentos = ref([]);
  const cadastrando = ref(false);
  const mensagemUsuario = ref('');
  const erroUsuario = ref('');

  const novoUsuario = ref({
    nome: '',
    email: '',
    senha: '',
    perfil_id: '',
    departamento_id: ''
  });

  const carregarPerfis = async () => {
    try {
      perfis.value = await listarPerfis();
    } catch (err) {
      console.error('Erro ao carregar perfis:', err);
    }
  };

  const carregarUsuarios = async () => {
    try {
      usuarios.value = await listarUsuarios();
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    }
  };

  const carregarDepartamentos = async () => {
    try {
      const res = await listarDepartamentos();
      departamentos.value = res;
    } catch (err) {
      console.error('Erro ao carregar departamentos:', err);
    }
  };

  const cadastrarNovoUsuario = async () => {
    cadastrando.value = true;
    mensagemUsuario.value = '';
    erroUsuario.value = '';

    try {
      await criarUsuario(novoUsuario.value);
      mensagemUsuario.value = 'Usuário cadastrado com sucesso!';
      novoUsuario.value = { nome: '', email: '', senha: '', perfil_id: '', departamento_id: '' };
      await carregarUsuarios();
      return true;
    } catch (err) {
      erroUsuario.value = err.response?.data?.erro || 'Erro ao cadastrar usuário';
      return false;
    } finally {
      cadastrando.value = false;
    }
  };

  const bloquearConta = async (id) => {
    try {
      await bloquearUsuario(id);
      await carregarUsuarios();
    } catch (err) {
      console.error('Erro ao bloquear conta:', err);
    }
  };

  const desbloquearConta = async (id) => {
    try {
      await desbloquearUsuario(id);
      await carregarUsuarios();
    } catch (err) {
      console.error('Erro ao desbloquear conta:', err);
    }
  };

  const permitirApagar = async (usuario) => {
    try {
      await alternarPermissaoApagar(usuario.id, true);
      await carregarUsuarios();
    } catch (err) {
      console.error('Erro ao permitir apagar mensagens:', err);
    }
  };

  const bloquearApagar = async (usuario) => {
    try {
      await alternarPermissaoApagar(usuario.id, false);
      await carregarUsuarios();
    } catch (err) {
      console.error('Erro ao bloquear apagar mensagens:', err);
    }
  };

  return {
    perfis,
    usuarios,
    departamentos,
    cadastrando,
    mensagemUsuario,
    erroUsuario,
    novoUsuario,
    carregarPerfis,
    carregarUsuarios,
    carregarDepartamentos,
    cadastrarNovoUsuario,
    bloquearConta,
    desbloquearConta,
    permitirApagar,
    bloquearApagar
  };
}