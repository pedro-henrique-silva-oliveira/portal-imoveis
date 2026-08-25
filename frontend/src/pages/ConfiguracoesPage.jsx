import { useEffect, useState } from 'react'
import { CheckCircle2, Copy, KeyRound, Loader2, Rss, Save } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { extrairErro } from '../utils/format'

const classeInput =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary'
const classeLabel = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500'

const campos = [
  {
    nome: 'brand_name',
    rotulo: 'Nome do site',
    dica: 'Aparece no menu, rodapé, título da aba e mensagens do WhatsApp.',
    tipo: 'text',
    obrigatorio: true,
    max: 60,
  },
  {
    nome: 'creci',
    rotulo: 'CRECI',
    dica: 'Exibido no rodapé do site.',
    tipo: 'text',
    max: 40,
  },
  {
    nome: 'whatsapp_number',
    rotulo: 'WhatsApp (somente números)',
    dica: 'Com DDD e código do país. Exemplo: 5511987654321',
    tipo: 'tel',
    obrigatorio: true,
    max: 15,
  },
  {
    nome: 'telefone_exibicao',
    rotulo: 'Telefone exibido',
    dica: 'Formatado como preferir. Exemplo: (11) 98765-4321',
    tipo: 'text',
    max: 25,
  },
  {
    nome: 'email_contato',
    rotulo: 'E-mail de contato',
    dica: 'Exibido no rodapé do site.',
    tipo: 'email',
    obrigatorio: true,
    max: 120,
  },
]

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const FEEDS = [
  { portal: 'VivaReal', url: `${API_BASE}/api/feed/vivareal.xml` },
  { portal: 'ZAP', url: `${API_BASE}/api/feed/zap.xml` },
  { portal: 'OLX', url: `${API_BASE}/api/feed/olx.xml` },
]

export default function ConfiguracoesPage() {
  const { config, salvarConfig, alterarSenha } = useApp()
  const [form, setForm] = useState({
    brand_name: '',
    creci: '',
    whatsapp_number: '',
    telefone_exibicao: '',
    email_contato: '',
  })
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState('')
  const [erro, setErro] = useState('')

  const [senhas, setSenhas] = useState({ atual: '', nova: '', confirma: '' })
  const [trocandoSenha, setTrocandoSenha] = useState(false)
  const [senhaOk, setSenhaOk] = useState('')
  const [erroSenha, setErroSenha] = useState('')
  const [copiado, setCopiado] = useState('')

  const copiarFeed = async (feed) => {
    try {
      await navigator.clipboard.writeText(feed.url)
    } catch {
      window.prompt('Copie a URL do feed:', feed.url)
    }
    setCopiado(feed.portal)
    setTimeout(() => setCopiado(''), 2000)
  }

  useEffect(() => {
    setForm({
      brand_name: config.brand_name || '',
      creci: config.creci || '',
      whatsapp_number: config.whatsapp_number || '',
      telefone_exibicao: config.telefone_exibicao || '',
      email_contato: config.email_contato || '',
    })
  }, [config])

  const submeter = async (evento) => {
    evento.preventDefault()
    setErro('')
    setSucesso('')
    setSalvando(true)
    try {
      const dados = await salvarConfig(form)
      setSucesso(dados.mensagem || 'Configurações salvas com sucesso.')
    } catch (e) {
      setErro(extrairErro(e, 'Não foi possível salvar as configurações.'))
    } finally {
      setSalvando(false)
    }
  }

  const submeterSenha = async (evento) => {
    evento.preventDefault()
    setErroSenha('')
    setSenhaOk('')
    if (senhas.nova !== senhas.confirma) {
      setErroSenha('A confirmação não confere com a senha nova.')
      return
    }
    if (senhas.nova.length < 6) {
      setErroSenha('A senha nova deve ter pelo menos 6 caracteres.')
      return
    }
    setTrocandoSenha(true)
    try {
      const dados = await alterarSenha(senhas.atual, senhas.nova)
      setSenhaOk(dados.mensagem || 'Senha alterada com sucesso.')
      setSenhas({ atual: '', nova: '', confirma: '' })
    } catch (e) {
      setErroSenha(extrairErro(e, 'Não foi possível alterar a senha.'))
    } finally {
      setTrocandoSenha(false)
    }
  }

  const campoSenha = (nome, rotulo, autoComplete) => (
    <div>
      <label className={classeLabel} htmlFor={nome}>
        {rotulo}
      </label>
      <input
        id={nome}
        type="password"
        required
        minLength={nome === 'senha-atual' ? 1 : 6}
        maxLength={100}
        autoComplete={autoComplete}
        value={senhas[nome === 'senha-atual' ? 'atual' : nome === 'senha-nova' ? 'nova' : 'confirma']}
        onChange={(e) =>
          setSenhas({
            ...senhas,
            [nome === 'senha-atual' ? 'atual' : nome === 'senha-nova' ? 'nova' : 'confirma']:
              e.target.value,
          })
        }
        className={classeInput}
      />
    </div>
  )

  return (
    <>
      <section className="mt-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">Dados do site</h2>
        <p className="mt-1 text-sm text-slate-500">
          As alterações valem para todo o site imediatamente após salvar.
        </p>

        <form onSubmit={submeter} className="mt-6 grid gap-5 md:grid-cols-2">
          {campos.map((campo) => (
            <div key={campo.nome} className={campo.nome === 'creci' ? '' : 'md:col-span-1'}>
              <label className={classeLabel} htmlFor={campo.nome}>
                {campo.rotulo}
                {campo.obrigatorio && <span className="text-red-500"> *</span>}
              </label>
              <input
                id={campo.nome}
                type={campo.tipo}
                required={campo.obrigatorio}
                maxLength={campo.max}
                value={form[campo.nome]}
                onChange={(e) => setForm({ ...form, [campo.nome]: e.target.value })}
                className={classeInput}
              />
              <p className="mt-1 text-xs text-slate-400">{campo.dica}</p>
            </div>
          ))}

          <div className="md:col-span-2">
            {erro && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {erro}
              </div>
            )}
            {sucesso && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                <CheckCircle2 size={16} /> {sucesso}
              </div>
            )}
            <button
              type="submit"
              disabled={salvando}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {salvando ? 'Salvando...' : 'Salvar configurações'}
            </button>
          </div>
        </form>
      </div>
      </section>

      <section className="mt-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <KeyRound size={18} className="text-primary" />
            Alterar senha do painel
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            O hash é gerado automaticamente pelo sistema. Você nunca precisa
            mexer no Railway para trocar a senha.
          </p>

          <form onSubmit={submeterSenha} className="mt-5 grid gap-5 md:grid-cols-3">
            {campoSenha('senha-atual', 'Senha atual', 'current-password')}
            {campoSenha('senha-nova', 'Senha nova (mínimo 6 caracteres)', 'new-password')}
            {campoSenha('confirma-senha', 'Confirmar senha nova', 'new-password')}

            <div className="md:col-span-3">
              {erroSenha && (
                <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {erroSenha}
                </div>
              )}
              {senhaOk && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  <CheckCircle2 size={16} /> {senhaOk}
                </div>
              )}
              <button
                type="submit"
                disabled={trocandoSenha}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {trocandoSenha ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <KeyRound size={16} />
                )}
                {trocandoSenha ? 'Alterando...' : 'Alterar senha'}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="mt-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Rss size={18} className="text-primary" />
            Feeds XML para portais (VivaReal, ZAP, OLX)
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Cole a URL correspondente no painel do portal para publicar seu
            estoque automaticamente. As fotos já saem com marca d'água.
          </p>
          <ul className="mt-4 space-y-2">
            {FEEDS.map((feed) => (
              <li
                key={feed.portal}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5"
              >
                <span className="w-20 flex-shrink-0 text-sm font-bold text-slate-700">
                  {feed.portal}
                </span>
                <code className="min-w-0 flex-1 truncate rounded bg-white px-2 py-1 text-xs text-slate-600">
                  {feed.url}
                </code>
                <button
                  type="button"
                  onClick={() => copiarFeed(feed)}
                  aria-label={`Copiar URL do feed ${feed.portal}`}
                  className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-white"
                >
                  {copiado === feed.portal ? (
                    <>
                      <CheckCircle2 size={13} className="text-green-600" /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy size={13} /> Copiar
                    </>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
