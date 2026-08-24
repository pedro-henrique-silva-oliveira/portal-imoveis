import axios from 'axios'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { extrairErro } from '../utils/format'

const TOKEN_KEY = 'imob_token'
const FAV_KEY = 'imob_favoritos'

const FiltrosPadrao = {
  transacao: '',
  tipo: '',
  cidade: '',
  bairro: '',
  precoMin: '',
  precoMax: '',
  quartosMin: '',
  ordem: 'recentes',
}

const AppContext = createContext(null)

function criarApi() {
  const instancia = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  })
  instancia.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })
  return instancia
}

export function AppProvider({ children }) {
  const api = useMemo(criarApi, [])

  const [itens, setItens] = useState([])
  const [total, setTotal] = useState(0)
  const [paginas, setPaginas] = useState(1)
  const [pagina, setPaginaEstado] = useState(1)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [filtros, setFiltrosEstado] = useState(FiltrosPadrao)

  const [favoritos, setFavoritos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(FAV_KEY)) || []
    } catch {
      return []
    }
  })

  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')

  useEffect(() => {
    localStorage.setItem(FAV_KEY, JSON.stringify(favoritos))
  }, [favoritos])

  const montarParams = useCallback((obj) => {
    const params = {}
    Object.entries(obj || {}).forEach(([chave, valor]) => {
      if (valor !== '' && valor !== null && valor !== undefined) {
        params[chave] = valor
      }
    })
    return params
  }, [])

  const carregarImoveis = useCallback(
    async (overrides = {}) => {
      setCarregando(true)
      setErro('')
      try {
        const { data } = await api.get('/api/imoveis', {
          params: { page: pagina, ...montarParams(filtros), ...overrides },
        })
        setItens(data.items)
        setTotal(data.total)
        setPaginas(data.pages)
      } catch (e) {
        setErro(extrairErro(e))
      } finally {
        setCarregando(false)
      }
    },
    [api, filtros, pagina, montarParams],
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      carregarImoveis()
    }, 250)
    return () => clearTimeout(timer)
  }, [carregarImoveis])

  const setFiltros = useCallback((atualizacao) => {
    setFiltrosEstado((atual) => ({
      ...atual,
      ...(typeof atualizacao === 'function' ? atualizacao(atual) : atualizacao),
    }))
    setPaginaEstado(1)
  }, [])

  const limparFiltros = useCallback(() => {
    setFiltrosEstado(FiltrosPadrao)
    setPaginaEstado(1)
  }, [])

  const setPagina = useCallback((nova) => {
    setPaginaEstado(nova)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const alternarFavorito = useCallback((id) => {
    setFavoritos((atuais) =>
      atuais.includes(id) ? atuais.filter((f) => f !== id) : [...atuais, id],
    )
  }, [])

  const getImovel = useCallback(
    async (id) => {
      const { data } = await api.get(`/api/imoveis/${id}`)
      return data
    },
    [api],
  )

  const submeterLead = useCallback(
    async (dados) => {
      const { data } = await api.post('/api/leads', dados)
      return data
    },
    [api],
  )

  const login = useCallback(
    async (username, password) => {
      const { data } = await api.post('/api/auth/login', { username, password })
      localStorage.setItem(TOKEN_KEY, data.access_token)
      setToken(data.access_token)
      return data
    },
    [api],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken('')
  }, [])

  const salvarImovel = useCallback(
    async (dados, id) => {
      if (id) {
        const { data } = await api.put(`/api/imoveis/${id}`, dados)
        return data
      }
      const { data } = await api.post('/api/imoveis', dados)
      return data
    },
    [api],
  )

  const excluirImovel = useCallback(
    async (id) => {
      const { data } = await api.delete(`/api/imoveis/${id}`)
      return data
    },
    [api],
  )

  const listarTodosImoveis = useCallback(async () => {
    const { data } = await api.get('/api/imoveis', {
      params: { page: 1, per_page: 60 },
    })
    return data.items
  }, [api])

  const buscarMetricas = useCallback(async () => {
    const { data } = await api.get('/api/admin/metrics')
    return data
  }, [api])

  const buscarLeads = useCallback(async () => {
    const { data } = await api.get('/api/admin/leads')
    return data
  }, [api])

  const excluirLead = useCallback(
    async (id) => {
      const { data } = await api.delete(`/api/admin/leads/${id}`)
      return data
    },
    [api],
  )

  const valor = useMemo(
    () => ({
      itens,
      total,
      paginas,
      pagina,
      carregando,
      erro,
      filtros,
      favoritos,
      autenticado: !!token,
      setFiltros,
      limparFiltros,
      setPagina,
      alternarFavorito,
      carregarImoveis,
      getImovel,
      submeterLead,
      login,
      logout,
      salvarImovel,
      excluirImovel,
      listarTodosImoveis,
      buscarMetricas,
      buscarLeads,
      excluirLead,
    }),
    [
      itens,
      total,
      paginas,
      pagina,
      carregando,
      erro,
      filtros,
      favoritos,
      token,
      setFiltros,
      limparFiltros,
      setPagina,
      alternarFavorito,
      carregarImoveis,
      getImovel,
      submeterLead,
      login,
      logout,
      salvarImovel,
      excluirImovel,
      listarTodosImoveis,
      buscarMetricas,
      buscarLeads,
      excluirLead,
    ],
  )

  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>
}

export function useApp() {
  const contexto = useContext(AppContext)
  if (!contexto) {
    throw new Error('useApp deve ser usado dentro de AppProvider')
  }
  return contexto
}
