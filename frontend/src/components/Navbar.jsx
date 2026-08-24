import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Building2, Heart, Menu, Phone, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import {
  BRAND_NAME,
  TELEFONE_EXIBICAO,
  WHATSAPP_NUMBER,
} from '../config/brand'

const links = [
  { to: '/', label: 'Início' },
  { to: '/?transacao=venda', label: 'Comprar', transacao: 'venda' },
  { to: '/?transacao=aluguel', label: 'Alugar', transacao: 'aluguel' },
]

export default function Navbar() {
  const [aberto, setAberto] = useState(false)
  const { favoritos } = useApp()

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
            <Building2 size={20} />
          </span>
          <span className="text-lg font-bold text-slate-900">{BRAND_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className="text-sm font-medium text-slate-600 transition hover:text-primary"
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/?favoritos=1"
            className="relative flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-primary"
          >
            <Heart size={16} />
            Favoritos
            {favoritos.length > 0 && (
              <span className="absolute -right-4 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-white">
                {favoritos.length}
              </span>
            )}
          </Link>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            <Phone size={15} />
            {TELEFONE_EXIBICAO}
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setAberto(!aberto)}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          aria-label="Abrir menu"
        >
          {aberto ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {aberto && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setAberto(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/?favoritos=1"
              onClick={() => setAberto(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Favoritos ({favoritos.length})
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
