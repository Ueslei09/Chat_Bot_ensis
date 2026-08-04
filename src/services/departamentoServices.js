import { api } from './api';

export async function listarDepartamentos() {
  const resposta = await api.get('/departamentos'); // 👈 Usa a instância 'api' padronizada do projeto
  return resposta.data;
}