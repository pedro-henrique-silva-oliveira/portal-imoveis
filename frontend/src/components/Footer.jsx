import { Building2, Mail, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { DEFAULT_CITY, DEFAULT_STATE } from '../config/brand'

export default function Footer() {
  const { config } = useApp()

  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
              <Building2 size={20} />
            </span>
            <span className="text-lg font-bold">{config.brand_name}</span>
          </div>
          <p className="mt-3 text-sm text-slate-600">{config.creci}</p>
          <p className="mt-1 text-sm text-slate-600">
            {DEFAULT_CITY} - {DEFAULT_STATE}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
            Contato
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <Phone size={15} className="text-primary" />
              {config.telefone_exibicao}
            </li>
            <li className="flex items-center gap-2">
              <Mail size={15} className="text-primary" />
              {config.email_contato}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
            Navegação
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>
              <Link to="/?transacao=venda" className="hover:text-primary">
                Comprar
              </Link>
            </li>
            <li>
              <Link to="/?transacao=aluguel" className="hover:text-primary">
                Alugar
              </Link>
            </li>
            <li>
              <Link to="/admin/login" className="hover:text-primary">
                Área do corretor
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {config.brand_name}. Todos os direitos reservados.
      </div>
    </footer>
  )
}
