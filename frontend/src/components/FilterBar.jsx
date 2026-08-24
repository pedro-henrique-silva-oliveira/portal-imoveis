import { RotateCcw } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { TIPOS_IMOVEL, TRANSACOES } from '../config/brand'

const classeInput =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary'

export default function FilterBar() {
  const { filtros, setFiltros, limparFiltros } = useApp()

  const atualizar = (campo) => (evento) => {
    setFiltros({ [campo]: evento.target.value })
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        <select value={filtros.transacao} onChange={atualizar('transacao')} className={classeInput}>
          <option value="">Comprar ou alugar</option>
          {TRANSACOES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <select value={filtros.tipo} onChange={atualizar('tipo')} className={classeInput}>
          <option value="">Tipo de imóvel</option>
          {TIPOS_IMOVEL.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Cidade"
          value={filtros.cidade}
          onChange={atualizar('cidade')}
          className={classeInput}
        />

        <input
          type="text"
          placeholder="Bairro"
          value={filtros.bairro}
          onChange={atualizar('bairro')}
          className={classeInput}
        />

        <input
          type="number"
          min="0"
          placeholder="Preço mín."
          value={filtros.precoMin}
          onChange={atualizar('precoMin')}
          className={classeInput}
        />

        <input
          type="number"
          min="0"
          placeholder="Preço máx."
          value={filtros.precoMax}
          onChange={atualizar('precoMax')}
          className={classeInput}
        />

        <select
          value={filtros.quartosMin}
          onChange={atualizar('quartosMin')}
          className={classeInput}
        >
          <option value="">Quartos</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}+ quartos
            </option>
          ))}
        </select>

        <select
          value={filtros.ordem}
          onChange={(evento) => setFiltros({ ordem: evento.target.value })}
          className={classeInput}
        >
          <option value="recentes">Mais recentes</option>
          <option value="preco_asc">Menor preço</option>
          <option value="preco_desc">Maior preço</option>
          <option value="area_desc">Maior área</option>
        </select>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={limparFiltros}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-primary"
        >
          <RotateCcw size={13} />
          Limpar filtros
        </button>
      </div>
    </div>
  )
}
