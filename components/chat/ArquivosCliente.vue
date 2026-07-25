<template>
  <div class="arquivos">
    <h6>
      <i class="bi bi-paperclip"></i> 
      Arquivos enviados
    </h6>

    <p v-if="arquivos.length === 0" class="vazio">
      Nenhum arquivo enviado ainda.
    </p>

    <ul v-else class="lista">
      <li v-for="arquivo in arquivos" :key="arquivo.id" class="item-arquivo">
        <!-- Ícone dinâmico baseado no tipo mime -->
        <i :class="[iconePorTipo(arquivo.tipo_mime), 'icone-arquivo']"></i>
        
        <!-- Link seguro para download/abertura -->
        <a 
          :href="urlArquivo(arquivo.caminho_arquivo)" 
          target="_blank" 
          rel="noopener noreferrer"
          :title="arquivo.nome_arquivo"
          class="link-arquivo"
        >
          {{ arquivo.nome_arquivo }}
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useArquivosCliente } from '@/composables/useArquivosCliente'
import { urlArquivo } from '@/services/mensagensServices.js'

defineProps({
  arquivos: { type: Array, default: () => [] }
})

const { iconePorTipo } = useArquivosCliente()
</script>

<style scoped>
.arquivos {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  box-sizing: border-box;
  width: 100%;
}

h6 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #1a3c6e;
  margin-top: 0;
  margin-bottom: 14px;
  font-weight: 600;
}

.vazio {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
}

.lista {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-arquivo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  width: 100%;
  box-sizing: border-box;
}

.icone-arquivo {
  font-size: 16px;
  color: #1a3c6e;
  flex-shrink: 0;
}

.link-arquivo {
  color: #475569;
  text-decoration: none;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0; /* Essencial para o truncamento de texto flexbox funcionar no mobile */
  transition: color 0.15s ease;
}

.link-arquivo:hover {
  color: #1a3c6e;
  text-decoration: underline;
}
</style>