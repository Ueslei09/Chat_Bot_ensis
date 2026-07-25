// src/composables/useMessageMenu.js
// O componente atual de menu de contexto foca puramente em reações e eventos de emissão,
// mas centralizamos a estrutura de apoio ou comportamento futuro aqui para manter a arquitetura limpa.
export function useMessageMenu(emit) {
  const tratarReacao = (emoji) => {
    emit('reagir', emoji)
  }

  const tratarAcao = (acao) => {
    emit(acao)
  }

  return {
    tratarReacao,
    tratarAcao
  }
}