import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Loader2, Search, Send } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { extrairErro } from '../utils/format'

const classeInput =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary'
const classeLabel = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500'

const estadoInicial = {
  nome: '',
  telefone: '',
  bairro: '',
  cidade: '',
  dormitorios: '',
  preco_min: '',
  preco_max: '',
  observacoes: '',
}

export default function DemandaPage() {
  const { submeterDemanda } = useApp()
  const [form, setForm] = useState(estadoInicial)
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  const submeter = async (evento) => {
    evento.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      await submeterDemanda({
        ...form,
        preco_min: form.preco_min ? Number(form.preco_min) : null,
        preco_max: form.preco_max ? Number(form.preco_max) : null,
        dormitorios: form.dormitorios ? Number(form.dormitorios) : null,
      })
      setSucesso(true)
      setForm(estadoInicial)
    } catch (e) {
      setErro(extrairErro(e, 'Não foi possível enviar sua busca. Tente novamente.'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-primary"
        >
          <ArrowLeft size={15} /> Voltar para os imóveis
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
              <Search size={22} />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Não achou o que procura?
              </h1>
              <p className="text-sm text-slate-500">
                Cadastre o perfil do imóvel desejado e nossa equipe faz a busca
                ativa no mercado para você.
              </p>
            </div>
          </div>

          {sucesso ? (
            <div className="flex flex-col items-center gap-3 py-14 text-center">
              <CheckCircle2 size={52} className="text-green-600" />
              <p className="text-lg font-semibold text-slate-900">Busca cadastrada!</p>
              <p className="max-w-md text-sm text-slate-600">
                Recebemos seu pedido e entraremos em contato assim que
                encontrarmos um imóvel com esse perfil.
              </p>
              <button
                type="button"
                onClick={() => setSucesso(false)}
                className="mt-2 text-sm font-semibold text-primary hover:underline"
              >
                Cadastrar outra busca
              </button>
            </div>
          ) : (
            <form onSubmit={submeter} className="mt-7 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={classeLabel} htmlFor="demanda-nome">Seu nome *</label>
                <input
                  id="demanda-nome" type="text" required minLength={2} maxLength={120}
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className={classeInput} placeholder="Nome completo"
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="demanda-telefone">WhatsApp / Telefone *</label>
                <input
                  id="demanda-telefone" type="tel" required minLength={8} maxLength={30}
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  className={classeInput} placeholder="(11) 98765-4321"
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="demanda-bairro">Bairro desejado</label>
                <input
                  id="demanda-bairro" type="text" maxLength={120}
                  value={form.bairro}
                  onChange={(e) => setForm({ ...form, bairro: e.target.value })}
                  className={classeInput} placeholder="Ex.: Moema"
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="demanda-cidade">Cidade</label>
                <input
                  id="demanda-cidade" type="text" maxLength={120}
                  value={form.cidade}
                  onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                  className={classeInput} placeholder="Ex.: São Paulo"
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="demanda-dormitorios">Dormitórios (mínimo)</label>
                <select
                  id="demanda-dormitorios"
                  value={form.dormitorios}
                  onChange={(e) => setForm({ ...form, dormitorios: e.target.value })}
                  className={classeInput}
                >
                  <option value="">Qualquer um</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n === 5 ? '5 ou mais' : n}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={classeLabel} htmlFor="demanda-preco-min">Preço mín.</label>
                  <input
                    id="demanda-preco-min" type="number" min={0} step="100"
                    value={form.preco_min}
                    onChange={(e) => setForm({ ...form, preco_min: e.target.value })}
                    className={classeInput} placeholder="R$"
                  />
                </div>
                <div>
                  <label className={classeLabel} htmlFor="demanda-preco-max">Preço máx.</label>
                  <input
                    id="demanda-preco-max" type="number" min={0} step="100"
                    value={form.preco_max}
                    onChange={(e) => setForm({ ...form, preco_max: e.target.value })}
                    className={classeInput} placeholder="R$"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className={classeLabel} htmlFor="demanda-obs">Detalhes adicionais</label>
                <textarea
                  id="demanda-obs" rows={3} maxLength={2000}
                  value={form.observacoes}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                  className={classeInput}
                  placeholder="Ex.: perto de escola, aceita financiamento, precisa ter vaga coberta..."
                />
              </div>

              {erro && (
                <div className="sm:col-span-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {erro}
                </div>
              )}

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={enviando}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {enviando ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Enviando...
                    </>
                  ) : (
                    <>
                      <Send size={16} /> Quero ser avisado
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
