import { useState } from 'react'
import { Building2, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ImageGallery({ fotos = [], titulo }) {
  const [indice, setIndice] = useState(0)

  if (!fotos.length) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center rounded-xl bg-slate-100 text-slate-300">
        <Building2 size={72} />
      </div>
    )
  }

  const anterior = () => setIndice((i) => (i - 1 + fotos.length) % fotos.length)
  const proxima = () => setIndice((i) => (i + 1) % fotos.length)

  return (
    <div>
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-100">
        <img
          src={fotos[indice]}
          alt={`${titulo} - foto ${indice + 1}`}
          className="h-full w-full object-cover"
        />

        {fotos.length > 1 && (
          <>
            <button
              type="button"
              onClick={anterior}
              aria-label="Foto anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-700 shadow transition hover:bg-white"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={proxima}
              aria-label="Próxima foto"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-700 shadow transition hover:bg-white"
            >
              <ChevronRight size={20} />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
              {indice + 1} / {fotos.length}
            </span>
          </>
        )}
      </div>

      {fotos.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {fotos.map((foto, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndice(i)}
              className={`h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === indice ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={foto} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
