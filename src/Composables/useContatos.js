// src/composables/useContatos.js
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  listarContatos,
  criarContato,
  atualizarContato,
  excluirContato,
  importarContatos,
  arquivarContato,
  desarquivarContato
} from '@/services/contatoServices.js'
import { criarChamado, assumirChamado } from '@/services/chamadoServices.js'

export function useContatos() {
  const router = useRouter()

  const contatos = ref([])
  const carregando = ref(false)
  const mensagem = ref('')
  const erro = ref('')
  const mensagemImportacao = ref('')

  const filtroBusca = ref('')
  const filtroConexao = ref('')
  const filtroTipo = ref('') 
  const mostrarArquivados = ref(false)

  const editandoId = ref(null)
  const form = ref({
    nome: '',
    telefone: '',
    conexao: 'whatsapp',
    eh_grupo: false
  })

  const carregarContatos = async () => {
    carregando.value = true
    try {
      contatos.value = await listarContatos({
        busca: filtroBusca.value || undefined,
        conexao: filtroConexao.value || undefined,
        arquivados: mostrarArquivados.value ? 'true' : undefined,
        grupos: filtroTipo.value || undefined
      })
    } catch (err) {
      console.error('Erro ao carregar contatos:', err)
    } finally {
      carregando.value = false
    }
  }

  const buscarComFiltro = () => {
    carregarContatos()
  }

  const salvarContato = async () => {
    mensagem.value = ''
    erro.value = ''
    try {
      if (editandoId.value) {
        await atualizarContato(editandoId.value, form.value)
        mensagem.value = 'Contato atualizado com sucesso!'
      } else {
        await criarContato(form.value)
        mensagem.value = 'Contato adicionado com sucesso!'
      }
      cancelarEdicao()
      await carregarContatos()
    } catch (err) {
      erro.value = err.response?.data?.erro || 'Erro ao salvar contato'
    }
  }

  const editarContato = (contato) => {
    editandoId.value = contato.id
    form.value = {
      nome: contato.nome,
      telefone: contato.telefone,
      conexao: contato.conexao,
      eh_grupo: contato.eh_grupo || false
    }
  }

  const cancelarEdicao = () => {
    editandoId.value = null
    form.value = { nome: '', telefone: '', conexao: 'whatsapp', eh_grupo: false }
  }

  const excluir = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este contato?')) return
    erro.value = ''
    try {
      await excluirContato(id)
      await carregarContatos()
    } catch (err) {
      erro.value = err.response?.data?.erro || 'Erro ao excluir contato'
    }
  }

  const arquivar = async (id) => {
    await arquivarContato(id)
    await carregarContatos()
  }

  const desarquivar = async (id) => {
    await desarquivarContato(id)
    await carregarContatos()
  }

  const importarArquivo = (evento) => {
    const arquivo = evento.target.files[0]
    if (!arquivo) return

    const leitor = new FileReader()
    leitor.onload = async (e) => {
      const texto = e.target.result
      const linhas = texto.split('\n').map(l => l.trim()).filter(Boolean)

      const contatosImportar = linhas.map(linha => {
        const [nome, telefone, conexao] = linha.split(',').map(v => v?.trim())
        return { nome, telefone, conexao: conexao || 'whatsapp' }
      })

      try {
        const resultado = await importarContatos(contatosImportar)
        mensagemImportacao.value = resultado.msg
        await carregarContatos()
      } catch (err) {
        mensagemImportacao.value = err.response?.data?.erro || 'Erro ao importar contatos'
      }
    }
    leitor.readAsText(arquivo)
    evento.target.value = ''
  }

  const voltarParaChat = () => {
    router.push('/app/chamados')
  }

  const abrirChamado = async (contato) => {
    try {
      const novoChamado = await criarChamado(contato.id)
      await assumirChamado(novoChamado.id)
      router.push({ path: '/app/chamados', query: { abrir: novoChamado.id } })
    } catch (err) {
      erro.value = err.response?.data?.erro || 'Erro ao abrir chamado'
    }
  }

  onMounted(carregarContatos)

  return {
    contatos,
    carregando,
    mensagem,
    erro,
    mensagemImportacao,
    filtroBusca,
    filtroConexao,
    filtroTipo,
    mostrarArquivados,
    editandoId,
    form,
    carregarContatos,
    buscarComFiltro,
    salvarContato,
    editarContato,
    cancelarEdicao,
    excluir,
    arquivar,
    desarquivar,
    importarArquivo,
    voltarParaChat,
    abrirChamado
  }
}