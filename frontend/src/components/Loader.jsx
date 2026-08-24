import { Loader2 } from 'lucide-react'

export default function Loader({ texto = 'Carregando...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500">
      <Loader2 size={36} className="animate-spin text-primary" />
      <p className="text-sm">{texto}</p>
    </div>
  )
}
