<template>
  <div class="conexoes animate-fade-in">

    <div class="cabecalho">
      <h2>Conexões</h2>
      <div class="busca-filtros">
        <input 
          v-model="busca" 
          type="text" 
          placeholder="Pesquisar por nome..." 
          class="input-busca"
        />
        <button class="btn-filtros">▽ Filtros</button>
      </div>
    </div>

    <!-- Abas: Ativas / Arquivadas -->
    <nav class="abas">
      <button
        :class="{ ativa: abaAtual === 'ativas' }"
        @click="trocarAba('ativas')"
      >
        Ativas <span class="contagem">{{ conexoesFiltradas.length }}</span>
      </button>
      <button
        :class="{ ativa: abaAtual === 'arquivadas' }"
        @click="trocarAba('arquivadas')"
      >
        Arquivadas <span class="contagem">{{ arquivadasCount }}</span>
      </button>
    </nav>

    <!-- Lista de conexões -->
    <div v-if="carregando" class="vazio">Carregando dados...</div>

    <div v-else-if="conexoesFiltradas.length === 0" class="vazio">
      <p>Nenhuma conexão {{ abaAtual === 'ativas' ? 'ativa' : 'arquivada' }} encontrada.</p>
      <p class="dica">
        Essa lista será preenchida automaticamente quando a API do WhatsApp estiver conectada.
      </p>
    </div>

    <!-- Grid de Conexões Responsivo -->
    <div v-else class="grid-conexoes">
      <div v-for="conexao in conexoesFiltradas" :key="conexao.id" class="card-conexao">
        <div class="topo-card">
          <span class="icone" :class="conexao.tipo">
            {{ iconePorTipo(conexao.tipo) }}
          </span>
          <div class="info-principal-card">
            <strong class="nome-conexao">{{ conexao.nome }}</strong>
            <div class="tipo-label">{{ rotuloTipo(conexao.tipo) }}</div>
          </div>
        </div>

        <div class="linha-info">
          <span class="icone-mini">👤</span> 
          <span class="texto-info">{{ conexao.numero || '-' }}</span>
        </div>
        <div class="linha-info">
          <span class="icone-mini">🏢</span> 
          <span class="texto-info">{{ conexao.departamento || '-' }}</span>
        </div>

        <div class="wrapper-status">
          <span class="status-badge" :class="conexao.status">
            ● {{ conexao.status === 'conectado' ? 'Conectado' : 'Desconectado' }}
          </span>
        </div>
      </div>
    </div>

    <p class="rodape">Mostrando {{ conexoesFiltradas.length }} resultados</p>

  </div>
</template>

<script setup>
import { useConexoes } from '@/composables/useConexoes'

const {
  abaAtual,
  busca,
  carregando,
  conexoesFiltradas,
  arquivadasCount,
  trocarAba,
  iconePorTipo,
  rotuloTipo
} = useConexoes()
</script>

<style scoped>
/* ---------- ESTRUTURA BASE ---------- */
.conexoes {
  max-width: 1000px;
  margin: 16px auto;
  padding: 16px;
}
@media (min-width: 768px) {
  .conexoes {
    margin: 32px auto;
    padding: 24px;
  }
}

.cabecalho {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}
.cabecalho h2 {
  font-size: 22px;
  margin: 0;
  color: #1e293b;
}
@media (min-width: 768px) {
  .cabecalho {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.busca-filtros {
  display: flex;
  gap: 10px;
  width: 100%;
}
@media (min-width: 768px) {
  .busca-filtros {
    width: auto;
  }
}

.input-busca {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
.input-busca:focus {
  border-color: #1a3c6e;
}
@media (min-width: 768px) {
  .input-busca {
    min-width: 240px;
  }
}

.btn-filtros {
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 20px;
  padding: 10px 18px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  white-space: nowrap;
  transition: background 0.2s;
}
.btn-filtros:hover {
  background: #f8fafc;
}

/* ---------- NAV ABAS RESPONSIVA ---------- */
.abas {
  display: flex;
  gap: 20px;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 20px;
  overflow-x: auto;
  white-space: nowrap;
}
.abas button {
  background: none;
  border: none;
  padding: 12px 4px;
  cursor: pointer;
  font-size: 14px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  transition: all 0.2s;
}
.abas button.ativa {
  color: #1a3c6e;
  font-weight: bold;
  border-bottom: 2px solid #1a3c6e;
}
.contagem {
  background: #f1f5f9;
  color: #475569;
  border-radius: 10px;
  padding: 1px 8px;
  font-size: 11px;
  font-weight: bold;
}

.vazio {
  text-align: center;
  color: #64748b;
  padding: 40px 16px;
}
.dica {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 8px;
}

/* ---------- GRID DE CARDS RESPONSIVO ---------- */
.grid-conexoes {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 576px) {
  .grid-conexoes {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }
}

.card-conexao {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.01), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card-conexao:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
}

.topo-card {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}
.info-principal-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.nome-conexao {
  font-size: 15px;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.icone {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: #f1f5f9;
  flex-shrink: 0;
}
.icone.whatsapp {
  background: #e8f5e9;
}
.tipo-label {
  font-size: 12px;
  color: #64748b;
}

.linha-info {
  font-size: 13px;
  color: #475569;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.texto-info {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.icone-mini {
  font-size: 12px;
  color: #64748b;
}

.wrapper-status {
  margin-top: auto;
  padding-top: 10px;
}
.status-badge {
  display: inline-flex;
  font-size: 12px;
  padding: 3px 12px;
  border-radius: 20px;
  font-weight: bold;
}
.status-badge.conectado {
  background: #dcf8e8;
  color: #16a34a;
}
.status-badge.desconectado {
  background: #fef2f2;
  color: #dc2626;
}

.rodape {
  margin-top: 20px;
  font-size: 13px;
  color: #64748b;
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>