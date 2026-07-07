<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">ChatBot Ensis</a>

      <div class="menu-links">
        <router-link to="/app/chamados">Chamados</router-link>
      
        <router-link to="/app/contatos">Contatos</router-link>
        <router-link to="/app/conexoes">Conexões</router-link>
        <router-link to="/app/respostas-rapidas">Respostas rápidas</router-link>
        <router-link v-if="admin" to="/app/configuracoes">Configurações</router-link>

        <!-- Engrenagem -->
        <div class="engrenagem-wrapper">
          <button class="btn-engrenagem" @click="menuAberto = !menuAberto">⚙️</button>

          <div v-if="menuAberto" class="dropdown-menu-custom">
            <div v-if="!editando" class="item" @click="editando = true">
              Trocar nome de usuário
            </div>

            <div v-else class="item-editar">
              <input v-model="novoNome" placeholder="Novo nome" />
              <button @click="salvarNome">Salvar</button>
            </div>

            <div class="item sair" @click="sair">Sair</div>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <router-view />
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { isAdmin, logout } from '@/services/authServices.js'
import { atualizarMeuNome } from '@/services/usuariosServices.js'

const admin = isAdmin()
const router = useRouter()

const menuAberto = ref(false)
const editando = ref(false)
const novoNome = ref('')

async function salvarNome() {
  if (!novoNome.value.trim()) return
  await atualizarMeuNome(novoNome.value)
  editando.value = false
  menuAberto.value = false
  novoNome.value = ''
}

function sair() {
  logout()
  router.push('/')
}
</script>

<style scoped>
.menu-links {
  display: flex;
  align-items: center;
  gap: 16px;
}
.menu-links a {
  text-decoration: none;
  color: #1a3c6e;
}
.engrenagem-wrapper {
  position: relative;
}
.btn-engrenagem {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}
.dropdown-menu-custom {
  position: absolute;
  right: 0;
  top: 32px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.15);
  min-width: 180px;
  z-index: 10;
}
.item {
  padding: 10px 14px;
  font-size: 13px;
  cursor: pointer;
}
.item:hover {
  background: #f5f5f5;
}
.item.sair {
  color: #c0392b;
  border-top: 1px solid #eee;
}
.item-editar {
  padding: 10px 14px;
  display: flex;
  gap: 6px;
}
.item-editar input {
  flex: 1;
  padding: 4px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 13px;
}
.item-editar button {
  background: #1a3c6e;
  color: #fff;
  border: none;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
</style>