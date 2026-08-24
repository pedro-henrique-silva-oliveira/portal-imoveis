import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'

function janelaPaginas(atual, total) {
  const inicio = Math.max(1, atual - 2)
  const fim = Math.min(total, inicio + 4)
  const paginas = []
  for (let i = Math.max(1, fim - 4); i <= fim; i++) {
    paginas.push(i)
  }
  return paginas
}

export default function Pagination() {
  const { pagina, paginas, setPagina } = useApp()

  if (paginas <= 1) return null

  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Paginação">
      <button
        type="button"
        onClick={() => setPagina(pagina - 1)}
        disabled={pagina <= 1}
        className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Página anterior"
      >
        <ChevronLeft size={18} />
      </button>

      {janelaPaginas(pagina, paginas).map((numero) => (
        <button
          key={numero}
          type="button"
          onClick={() => setPagina(numero)}
          className={`h-10 w-10 rounded-lg text-sm font-semibold transition ${
            numero === pagina
              ? 'bg-primary text-white'
              : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          {numero}
        </button>
      ))}

      <button
        type="button"
        onClick={() => setPagina(pagina + 1)}
        disabled={pagina >= paginas}
        className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Próxima página"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  )
}
