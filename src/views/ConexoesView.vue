<template>
  <div class="conexoes">

    <div class="cabecalho">
      <h2>Conexões</h2>
      <div class="busca-filtros">
        <input v-model="busca" type="text" placeholder="Pesquisar por nome..." />
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
    <div v-if="carregando" class="vazio">Carregando...</div>

    <div v-else-if="conexoesFiltradas.length === 0" class="vazio">
      <p>Nenhuma conexão {{ abaAtual === 'ativas' ? 'ativa' : 'arquivada' }} encontrada.</p>
      <p class="dica">
        Essa lista será preenchida automaticamente quando a API do WhatsApp
        estiver conectada.
      </p>
    </div>

    <div v-else class="grid-conexoes">
      <div v-for="conexao in conexoesFiltradas" :key="conexao.id" class="card-conexao">
        <div class="topo-card">
          <span class="icone" :class="conexao.tipo">
            {{ iconePorTipo(conexao.tipo) }}
          </span>
          <div>
            <strong>{{ conexao.nome }}</strong>
            <div class="tipo-label">{{ rotuloTipo(conexao.tipo) }}</div>
          </div>
        </div>

        <div class="linha-info">
          <span class="icone-mini">👤</span> {{ conexao.numero || '-' }}
        </div>
        <div class="linha-info">
          <span class="icone-mini">🏢</span> {{ conexao.departamento || '-' }}
        </div>

        <span class="status-badge" :class="conexao.status">
          ● {{ conexao.status === 'conectado' ? 'Conectado' : 'Desconectado' }}
        </span>
      </div>
    </div>

    <p class="rodape">Mostrando {{ conexoesFiltradas.length }} de {{ conexoesFiltradas.length }} resultados</p>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { listarConexoes } from '@/services/conexoesServices.js'

const abaAtual = ref('ativas')
const busca = ref('')
const carregando = ref(false)

const conexoesAtivas = ref([])
const conexoesArquivadas = ref([])
const arquivadasCount = ref(0)

// Lista exibida na tela, já filtrada pela busca por nome
const conexoesFiltradas = computed(() => {
  const lista = abaAtual.value === 'ativas' ? conexoesAtivas.value : conexoesArquivadas.value
  if (!busca.value) return lista
  return lista.filter(c => c.nome?.toLowerCase().includes(busca.value.toLowerCase()))
})

function trocarAba(aba) {
  abaAtual.value = aba
}

function iconePorTipo(tipo) {
  const icones = { whatsapp: '📱', chat: '💬', helpdesk: '🎧' }
  return icones[tipo] || '🔌'
}

function rotuloTipo(tipo) {
  const nomes = { whatsapp: 'WhatsApp', chat: 'Chat', helpdesk: 'Helpdesk' }
  return nomes[tipo] || tipo
}

async function carregarConexoes() {
  carregando.value = true
  try {
    conexoesAtivas.value = await listarConexoes({ arquivadas: false })
    conexoesArquivadas.value = await listarConexoes({ arquivadas: true })
    arquivadasCount.value = conexoesArquivadas.value.length
  } catch (err) {
    console.error('Erro ao carregar conexões:', err)
  } finally {
    carregando.value = false
  }
}

onMounted(carregarConexoes)
</script>

<style scoped>
.conexoes {
  max-width: 1000px;
  margin: 32px auto;
  padding: 24px;
}
.cabecalho {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.busca-filtros {
  display: flex;
  gap: 10px;
}
.busca-filtros input {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 20px;
  min-width: 220px;
}
.btn-filtros {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 20px;
  padding: 8px 16px;
  cursor: pointer;
}

.abas {
  display: flex;
  gap: 24px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}
.abas button {
  background: none;
  border: none;
  padding: 10px 0;
  cursor: pointer;
  font-size: 14px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 6px;
}
.abas button.ativa {
  color: #1a3c6e;
  font-weight: bold;
  border-bottom: 2px solid #1a3c6e;
}
.contagem {
  background: #eee;
  border-radius: 10px;
  padding: 1px 8px;
  font-size: 12px;
}

.vazio {
  text-align: center;
  color: #888;
  padding: 40px 0;
}
.dica {
  font-size: 12px;
  color: #aaa;
  margin-top: 8px;
}

.grid-conexoes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.card-conexao {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.topo-card {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.icone {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: #eee;
}
.icone.whatsapp {
  background: #dcf8e8;
}
.tipo-label {
  font-size: 12px;
  color: #888;
}
.linha-info {
  font-size: 13px;
  color: #555;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.icone-mini {
  font-size: 12px;
}
.status-badge {
  display: inline-block;
  margin-top: 10px;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 10px;
}
.status-badge.conectado {
  background: #dcf8e8;
  color: #27ae60;
}
.status-badge.desconectado {
  background: #fdecea;
  color: #c0392b;
}

.rodape {
  margin-top: 20px;
  font-size: 13px;
  color: #888;
}
</style>