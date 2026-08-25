import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Building2,
  ClipboardList,
  ExternalLink,
  KeyRound,
  LogOut,
  Mail,
  Pencil,
  Plus,
  Settings,
  Tag,
  Trash2,
} from 'lucide-react'
import AdminPropertyForm from '../components/AdminPropertyForm'
import LeadsKanban from '../components/LeadsKanban'
import Loader from '../components/Loader'
import ConfiguracoesPage from './ConfiguracoesPage'
import { useApp } from '../context/AppContext'
import { extrairErro, formatarBRL, formatarData } from '../utils/format'
import { TIPOS_IMOVEL } from '../config/brand'

const classeInput =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary'

function CardMetrica({ icone: Icone, rotulo, valor, cor }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className={`flex h-11 w-11 items-center justify-center rounded-lg text-white ${cor}`}>
        <Icone size={20} />
      </span>
      <div>
        <p className="text-2xl font-bold">{valor}</p>
        <p className="text-xs uppercase tracking-wide text-slate-500">{rotulo}</p>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const {
    logout,
    listarTodosImoveis,
    excluirImovel,
    buscarMetricas,
    buscarLeads,
    excluirLead,
    alterarStatusLead,
    listarDemandas,
    excluirDemanda,
    alterarStatusDemanda,
    config,
  } = useApp()

  const [aba, setAba] = useState('imoveis')
  const [metricas, setMetricas] = useState(null)
  const [imoveis, setImoveis] = useState([])
  const [leads, setLeads] = useState([])
  const [demandas, setDemandas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [formAberto, setFormAberto] = useState(false)
  const [imovelEdicao, setImovelEdicao] = useState(null)

  const carregarDados = useCallback(async () => {
    setCarregando(true)
    setErro('')
    try {
      const [dadosMetricas, listaImoveis, listaLeads, listaDemandas] = await Promise.all([
        buscarMetricas(),
        listarTodosImoveis(),
        buscarLeads(),
        listarDemandas(),
      ])
      setMetricas(dadosMetricas)
      setImoveis(listaImoveis)
      setLeads(listaLeads)
      setDemandas(listaDemandas)
    } catch (e) {
      if (e?.response?.status === 401) {
        logout()
        return
      }
      setErro(extrairErro(e))
    } finally {
      setCarregando(false)
    }
  }, [buscarMetricas, listarTodosImoveis, buscarLeads, listarDemandas, logout])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  const abrirNovoImovel = () => {
    setImovelEdicao(null)
    setFormAberto(true)
  }

  const abrirEdicao = (imovel) => {
    setImovelEdicao(imovel)
    setFormAberto(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const removerImovel = async (imovel) => {
    if (!window.confirm(`Excluir o imóvel "${imovel.titulo}"?`)) return
    try {
      await excluirImovel(imovel.id)
      await carregarDados()
    } catch (e) {
      alert(extrairErro(e))
    }
  }

  const removerLead = async (lead) => {
    if (!window.confirm(`Excluir o lead de ${lead.nome}?`)) return
    try {
      await excluirLead(lead.id)
      setLeads((atual) => atual.filter((l) => l.id !== lead.id))
    } catch (e) {
      alert(extrairErro(e))
    }
  }

  const moverLead = async (lead, novoStatus) => {
    const statusAnterior = lead.status
    setLeads((atual) =>
      atual.map((l) => (l.id === lead.id ? { ...l, status: novoStatus } : l)),
    )
    try {
      await alterarStatusLead(lead.id, novoStatus)
    } catch (e) {
      setLeads((atual) =>
        atual.map((l) => (l.id === lead.id ? { ...l, status: statusAnterior } : l)),
      )
      alert(extrairErro(e))
    }
  }

  const removerDemanda = async (demanda) => {
    if (!window.confirm(`Excluir a demanda de ${demanda.nome}?`)) return
    try {
      await excluirDemanda(demanda.id)
      setDemandas((atual) => atual.filter((d) => d.id !== demanda.id))
    } catch (e) {
      alert(extrairErro(e))
    }
  }

  const alternarAtendida = async (demanda) => {
    const novoValor = !demanda.atendida
    setDemandas((atual) =>
      atual.map((d) => (d.id === demanda.id ? { ...d, atendida: novoValor } : d)),
    )
    try {
      await alterarStatusDemanda(demanda.id, novoValor)
    } catch (e) {
      setDemandas((atual) =>
        atual.map((d) => (d.id === demanda.id ? { ...d, atendida: !novoValor } : d)),
      )
      alert(extrairErro(e))
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
              <Building2 size={18} />
            </span>
            <div>
              <p className="text-sm font-bold leading-tight">Painel Administrativo</p>
              <p className="text-xs leading-tight text-slate-500">{config.brand_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              <ExternalLink size={14} /> Ver site
            </Link>
            <button
              type="button"
              onClick={() => {
                logout()
                navigate('/admin/login', { replace: true })
              }}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
            >
              <LogOut size={14} /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {erro && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {erro}
          </div>
        )}

        {carregando ? (
          <Loader texto="Carregando painel..." />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              <CardMetrica icone={Building2} rotulo="Total de imóveis" valor={metricas.total_imoveis} cor="bg-primary" />
              <CardMetrica icone={Tag} rotulo="Para venda" valor={metricas.venda} cor="bg-green-600" />
              <CardMetrica icone={KeyRound} rotulo="Para locação" valor={metricas.aluguel} cor="bg-secondary" />
              <CardMetrica icone={Mail} rotulo="Leads recebidos" valor={metricas.leads} cor="bg-slate-600" />
              <CardMetrica icone={ClipboardList} rotulo="Demandas de busca" valor={demandas.length} cor="bg-amber-500" />
            </div>

            <div className="mt-8 -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 [&::-webkit-scrollbar]:hidden [&]:scrollbar-width-none">
              {[
                { id: 'imoveis', label: 'Imóveis' },
                { id: 'leads', label: `CRM de Leads (${leads.length})` },
                { id: 'demandas', label: `Demandas (${demandas.length})` },
                { id: 'config', label: 'Configurações' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAba(item.id)}
                  className={`flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition ${
                    aba === item.id
                      ? 'bg-primary text-white'
                      : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.id === 'config' && <Settings size={14} />}
                  {item.label}
                </button>
              ))}
            </div>

            {aba === 'imoveis' && (
              <section className="mt-6">
                {formAberto ? (
                  <AdminPropertyForm
                    imovel={imovelEdicao}
                    onCancelar={() => setFormAberto(false)}
                    onSucesso={async () => {
                      setFormAberto(false)
                      await carregarDados()
                    }}
                  />
                ) : (
                  <>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={abrirNovoImovel}
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                      >
                        <Plus size={16} /> Novo imóvel
                      </button>
                    </div>

                    <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                      <table className="w-full min-w-[720px] text-left text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                          <tr>
                            <th className="px-4 py-3">Imóvel</th>
                            <th className="px-4 py-3">Tipo</th>
                            <th className="px-4 py-3">Preço</th>
                            <th className="px-4 py-3">Cidade</th>
                            <th className="px-4 py-3 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {imoveis.map((imovel) => (
                            <tr key={imovel.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  {imovel.fotos?.[0] ? (
                                    <img src={imovel.fotos[0]} alt="" className="h-12 w-16 flex-shrink-0 rounded-md object-cover" />
                                  ) : (
                                    <span className="flex h-12 w-16 flex-shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-300">
                                      <Building2 size={20} />
                                    </span>
                                  )}
                                  <div className="min-w-0">
                                    <p className="truncate font-medium text-slate-900">{imovel.titulo}</p>
                                    <p className="text-xs capitalize text-slate-500">
                                      {imovel.transacao} · Ref. #{imovel.id}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 capitalize">
                                {TIPOS_IMOVEL.find((t) => t.value === imovel.tipo)?.label || imovel.tipo}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 font-semibold">{formatarBRL(imovel.preco)}</td>
                              <td className="px-4 py-3 text-slate-600">{imovel.cidade || '-'}</td>
                              <td className="px-4 py-3">
                                <div className="flex justify-end gap-2">
                                  <Link
                                    to={`/imovel/${imovel.id}`}
                                    target="_blank"
                                    aria-label="Ver no site"
                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-primary"
                                  >
                                    <ExternalLink size={16} />
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => abrirEdicao(imovel)}
                                    aria-label="Editar"
                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-primary"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removerImovel(imovel)}
                                    aria-label="Excluir"
                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {imoveis.length === 0 && (
                        <p className="py-10 text-center text-sm text-slate-500">
                          Nenhum imóvel cadastrado ainda.
                        </p>
                      )}
                    </div>
                  </>
                )}
              </section>
            )}

            {aba === 'leads' && (
              <section className="mt-6">
                <p className="text-sm text-slate-500">
                  Arraste os cards entre as colunas (ou use as setas) para
                  acompanhar cada cliente no funil de vendas.
                </p>
                <LeadsKanban leads={leads} aoMudarStatus={moverLead} aoExcluir={removerLead} />
                {leads.length === 0 && (
                  <div className="rounded-xl border border-slate-200 bg-white py-10 text-center shadow-sm">
                    <p className="text-sm text-slate-500">Nenhum lead recebido ainda.</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Os contatos do formulário "Tenho interesse" aparecem aqui.
                    </p>
                  </div>
                )}
              </section>
            )}

            {aba === 'demandas' && (
              <section className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Contato</th>
                      <th className="px-4 py-3">Perfil desejado</th>
                      <th className="px-4 py-3">Detalhes</th>
                      <th className="px-4 py-3">Recebido</th>
                      <th className="px-4 py-3 text-center">Atendida</th>
                      <th className="px-4 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {demandas.map((demanda) => (
                      <tr key={demanda.id} className={`align-top hover:bg-slate-50 ${demanda.atendida ? 'opacity-60' : ''}`}>
                        <td className="px-4 py-3 font-medium">{demanda.nome}</td>
                        <td className="px-4 py-3 text-slate-600">
                          <p>{demanda.telefone}</p>
                          {demanda.email && <p>{demanda.email}</p>}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          <p>
                            {[demanda.bairro, demanda.cidade].filter(Boolean).join(', ') || 'Qualquer região'}
                          </p>
                          <p className="text-xs">
                            {[
                              demanda.dormitorios ? `${demanda.dormitorios}+ dorm.` : null,
                              demanda.preco_min || demanda.preco_max
                                ? `R$ ${Number(demanda.preco_min || 0).toLocaleString('pt-BR')} - ${Number(demanda.preco_max || 0).toLocaleString('pt-BR')}`
                                : null,
                            ].filter(Boolean).join(' · ') || 'Sem restrições'}
                          </p>
                        </td>
                        <td className="max-w-xs px-4 py-3 text-slate-600">
                          <p className="line-clamp-2" title={demanda.observacoes}>
                            {demanda.observacoes || '-'}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                          {formatarData(demanda.data_criacao)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={!!demanda.atendida}
                            onChange={() => alternarAtendida(demanda)}
                            aria-label={`Marcar demanda de ${demanda.nome} como atendida`}
                            className="h-5 w-5 cursor-pointer accent-green-600"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => removerDemanda(demanda)}
                              aria-label="Excluir demanda"
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {demandas.length === 0 && (
                  <p className="py-10 text-center text-sm text-slate-500">
                    Nenhuma demanda de busca recebida ainda.
                  </p>
                )}
              </section>
            )}

            {aba === 'config' && <ConfiguracoesPage />}
          </>
        )}
      </main>
    </div>
  )
}
