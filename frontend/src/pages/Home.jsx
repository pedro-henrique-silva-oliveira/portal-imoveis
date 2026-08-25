import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  CalendarCheck,
  Heart,
  MessageCircle,
  SearchX,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import FilterBar from '../components/FilterBar'
import FormDemanda from '../components/FormDemanda'
import Loader from '../components/Loader'
import Pagination from '../components/Pagination'
import PropertyCard from '../components/PropertyCard'
import { useApp } from '../context/AppContext'

const diferenciais = [
  { icone: ShieldCheck, titulo: 'Imóveis verificados', texto: 'Documentação conferida' },
  { icone: CalendarCheck, titulo: 'Visita facilitada', texto: 'Agende pelo site' },
  { icone: MessageCircle, titulo: 'Fale agora', texto: 'Atendimento no WhatsApp' },
]

export default function Home() {
  const { itens, total, carregando, erro, filtros, setFiltros, favoritos, config } = useApp()
  const [somenteFavoritos, setSomenteFavoritos] = useState(false)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const transacao = searchParams.get('transacao')
    const tipo = searchParams.get('tipo')
    const favorito = searchParams.get('favoritos')
    if (transacao || tipo || favorito) {
      setSomenteFavoritos(favorito === '1')
      setFiltros((atual) => ({
        ...atual,
        transacao: transacao || atual.transacao,
        tipo: tipo || atual.tipo,
      }))
    }
  }, [searchParams, setFiltros])

  const itensVisiveis = useMemo(
    () => (somenteFavoritos ? itens.filter((i) => favoritos.includes(i.id)) : itens),
    [itens, somenteFavoritos, favoritos],
  )

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-primary)] via-[color-mix(in_srgb,var(--color-primary)_75%,#0f172a)] to-[var(--color-secondary)] text-white">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-1/4 top-10 hidden h-40 w-40 rounded-full border border-white/15 lg:block" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.2fr_auto]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur">
              <Sparkles size={14} />
              Imóveis selecionados
            </span>

            <h1 className="mt-6 max-w-xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Encontre o imóvel{' '}
              <span className="underline decoration-white/60 decoration-4 underline-offset-8">
                dos seus sonhos
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/85 sm:text-lg">
              Casas, apartamentos e imóveis comerciais para comprar ou alugar,
              com atendimento especializado de ponta a ponta.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() =>
                  document.getElementById('imoveis')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-slate-100"
              >
                Ver imóveis
                <ArrowRight size={16} />
              </button>
              <a
                href={`https://wa.me/${config.whatsapp_number}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                <MessageCircle size={16} />
                Falar no WhatsApp
              </a>
            </div>
          </div>

          <ul className="hidden w-72 flex-col gap-4 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur lg:flex">
            {diferenciais.map(({ icone: Icone, titulo, texto }) => (
              <li key={titulo} className="flex items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <Icone size={20} />
                </span>
                <span>
                  <span className="block text-sm font-bold">{titulo}</span>
                  <span className="block text-xs text-white/75">{texto}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="imoveis" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 scroll-mt-20">
        <FilterBar />

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            {carregando
              ? 'Buscando imóveis...'
              : `${total} ${total === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}`}
          </p>
          <button
            type="button"
            onClick={() => setSomenteFavoritos(!somenteFavoritos)}
            className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              somenteFavoritos
                ? 'border-secondary bg-secondary text-white'
                : 'border-slate-300 text-slate-600 hover:border-secondary hover:text-secondary'
            }`}
          >
            <Heart size={15} fill={somenteFavoritos ? 'currentColor' : 'none'} />
            Favoritos ({favoritos.length})
          </button>
        </div>

        {erro && (
          <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {erro}
          </div>
        )}

        {carregando ? (
          <Loader texto="Carregando imóveis..." />
        ) : itensVisiveis.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-slate-500">
            <SearchX size={48} />
            <p>Nenhum imóvel encontrado com os filtros atuais.</p>
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {itensVisiveis.map((imovel) => (
                <PropertyCard key={imovel.id} imovel={imovel} />
              ))}
            </div>
            {!somenteFavoritos && <Pagination />}
          </>
        )}
        <FormDemanda />
      </section>
    </>
  )
}
