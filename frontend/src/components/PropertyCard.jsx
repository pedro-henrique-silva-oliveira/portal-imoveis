import { Link } from 'react-router-dom'
import {
  Bath,
  BedDouble,
  Building2,
  Car,
  Heart,
  MapPin,
  Ruler,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatarBRL } from '../utils/format'
import { urlFoto } from '../utils/media'

export default function PropertyCard({ imovel }) {
  const { favoritos, alternarFavorito } = useApp()
  const ehFavorito = favoritos.includes(imovel.id)
  const temFoto = (imovel.fotos?.length || 0) > 0
  const foto = temFoto ? urlFoto(imovel.id, 0) : null

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg">
      <Link to={`/imovel/${imovel.id}`} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
          {foto ? (
            <img
              src={foto}
              alt={imovel.titulo}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-300">
              <Building2 size={56} />
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase text-white">
            {imovel.transacao === 'venda' ? 'Venda' : 'Aluguel'}
          </span>
        </div>

        <div className="p-4">
          <p className="text-lg font-bold text-primary">{formatarBRL(imovel.preco)}</p>
          <h3 className="mt-1 line-clamp-1 font-semibold text-slate-900">
            {imovel.titulo}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
            <MapPin size={14} />
            {[imovel.bairro, imovel.cidade].filter(Boolean).join(', ') || '-'}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <BedDouble size={15} /> {imovel.quartos}
            </span>
            <span className="flex items-center gap-1">
              <Bath size={15} /> {imovel.banheiros}
            </span>
            <span className="flex items-center gap-1">
              <Car size={15} /> {imovel.vagas}
            </span>
            {imovel.area > 0 && (
              <span className="flex items-center gap-1">
                <Ruler size={15} /> {imovel.area} m²
              </span>
            )}
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={() => alternarFavorito(imovel.id)}
        aria-label={ehFavorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        className={`absolute right-3 top-3 rounded-full p-2 shadow transition ${
          ehFavorito
            ? 'bg-secondary text-white'
            : 'bg-white/90 text-slate-500 hover:text-secondary'
        }`}
      >
        <Heart size={18} fill={ehFavorito ? 'currentColor' : 'none'} />
      </button>
    </div>
  )
}
