import { Link, useLocation } from 'react-router-dom'
import { Search } from 'lucide-react'

export default function BotaoDemanda() {
  const { pathname } = useLocation()

  if (pathname === '/demanda') return null

  return (
    <Link
      to="/demanda"
      className="fixed bottom-[104px] right-6 z-50 flex h-12 items-center gap-2 rounded-full bg-primary px-4 text-white shadow-lg transition hover:scale-105 hover:brightness-110"
      aria-label="Não achou o que procura? Cadastrar busca"
    >
      <Search size={20} />
      <span className="hidden text-sm font-bold sm:inline">
        Não achou o que procura?
      </span>
    </Link>
  )
}
