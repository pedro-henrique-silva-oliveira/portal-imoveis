import { Building2, Mail, Phone } from 'lucide-react'
import {
  BRAND_NAME,
  CRECI,
  DEFAULT_CITY,
  DEFAULT_STATE,
  EMAIL_CONTATO,
  TELEFONE_EXIBICAO,
} from '../config/brand'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
              <Building2 size={20} />
            </span>
            <span className="text-lg font-bold">{BRAND_NAME}</span>
          </div>
          <p className="mt-3 text-sm text-slate-600">{CRECI}</p>
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
              {TELEFONE_EXIBICAO}
            </li>
            <li className="flex items-center gap-2">
              <Mail size={15} className="text-primary" />
              {EMAIL_CONTATO}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
            Navegação
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>
              <a href="/?transacao=venda" className="hover:text-primary">
                Comprar
              </a>
            </li>
            <li>
              <a href="/?transacao=aluguel" className="hover:text-primary">
                Alugar
              </a>
            </li>
            <li>
              <a href="/admin/login" className="hover:text-primary">
                Área do corretor
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {BRAND_NAME}. Todos os direitos reservados.
      </div>
    </footer>
  )
}
