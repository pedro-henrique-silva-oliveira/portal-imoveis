import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, Save } from 'lucide-react'
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

export default function ConfiguracoesPage() {
  const { config, salvarConfig } = useApp()
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

  return (
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
  )
}
