import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Heart, SearchX } from 'lucide-react'
import FilterBar from '../components/FilterBar'
import Loader from '../components/Loader'
import Pagination from '../components/Pagination'
import PropertyCard from '../components/PropertyCard'
import { useApp } from '../context/AppContext'
import { DEFAULT_CITY } from '../config/brand'

export default function Home() {
  const { itens, total, carregando, erro, filtros, setFiltros, favoritos } = useApp()
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
      <section className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="max-w-2xl text-3xl font-bold sm:text-4xl">
            Encontre o imóvel dos seus sonhos em {DEFAULT_CITY}
          </h1>
          <p className="mt-3 max-w-xl text-white/90">
            Casas, apartamentos, terrenos e imóveis comerciais para comprar ou alugar,
            com atendimento especializado de ponta a ponta.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
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
      </section>
    </>
  )
}
