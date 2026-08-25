import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Bath,
  BedDouble,
  BedSingle,
  Car,
  CheckCircle2,
  Loader2,
  MapPin,
  MessageCircle,
  Ruler,
  Send,
} from 'lucide-react'
import FloatingWhatsApp from '../components/WhatsAppFloat'
import ImageGallery from '../components/ImageGallery'
import Loader from '../components/Loader'
import PropertyMap from '../components/PropertyMap'
import { useApp } from '../context/AppContext'
import { FEATURES_DISPONIVEIS } from '../config/brand'
import { extrairErro, formatarBRL } from '../utils/format'

const classeInput =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary'
const classeLabel = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500'

export default function PropertyDetails() {
  const { id } = useParams()
  const { getImovel, submeterLead, config } = useApp()

  const [imovel, setImovel] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [lead, setLead] = useState({ nome: '', email: '', telefone: '', mensagem: '' })
  const [enviandoLead, setEnviandoLead] = useState(false)
  const [leadEnviado, setLeadEnviado] = useState(false)
  const [erroLead, setErroLead] = useState('')

  useEffect(() => {
    let ativo = true
    setCarregando(true)
    setErro('')
    getImovel(id)
      .then((dados) => {
        if (ativo) setImovel(dados)
      })
      .catch((e) => {
        if (ativo) setErro(extrairErro(e, 'Imóvel não encontrado.'))
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })
    return () => {
      ativo = false
    }
  }, [id, getImovel])

  if (carregando) return <Loader texto="Carregando imóvel..." />

  if (erro || !imovel) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-24">
        <p className="text-lg text-slate-600">{erro || 'Imóvel não encontrado.'}</p>
        <Link to="/" className="flex items-center gap-2 font-medium text-primary hover:underline">
          <ArrowLeft size={16} /> Voltar à listagem
        </Link>
      </div>
    )
  }

  const localizacao = [imovel.bairro, imovel.cidade].filter(Boolean).join(', ')
  const mensagemWhats =
    `Olá! Vi o imóvel "${imovel.titulo}" (${formatarBRL(imovel.preco)}) ` +
    `no site da ${config.brand_name} e gostaria de mais informações. (Ref. #${imovel.id})`

  const enviarLead = async (evento) => {
    evento.preventDefault()
    setErroLead('')
    setEnviandoLead(true)
    try {
      await submeterLead({
        nome: lead.nome,
        email: lead.email,
        telefone: lead.telefone,
        mensagem: lead.mensagem,
        imovel_id: imovel.id,
      })
      setLeadEnviado(true)
      setLead({ nome: '', email: '', telefone: '', mensagem: '' })
    } catch (e) {
      setErroLead(extrairErro(e))
    } finally {
      setEnviandoLead(false)
    }
  }

  const featuresAtivas = FEATURES_DISPONIVEIS.filter(
    (f) => imovel.features?.[f.key],
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link to="/" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
        <ArrowLeft size={16} /> Voltar à listagem
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <ImageGallery imovelId={imovel.id} fotos={imovel.fotos} titulo={imovel.titulo} />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase text-primary">
                {imovel.transacao === 'venda' ? 'Venda' : 'Aluguel'}
              </span>
              <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold uppercase text-slate-600">
                {imovel.tipo}
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-bold sm:text-3xl">{imovel.titulo}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-slate-500">
              <MapPin size={16} /> {localizacao || 'Localização não informada'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-5">
            {[
              { icone: BedDouble, rotulo: 'Quartos', valor: imovel.quartos },
              { icone: BedSingle, rotulo: 'Suítes', valor: imovel.suites },
              { icone: Bath, rotulo: 'Banheiros', valor: imovel.banheiros },
              { icone: Car, rotulo: 'Vagas', valor: imovel.vagas },
              ...(imovel.area > 0
                ? [{ icone: Ruler, rotulo: 'Área', valor: `${imovel.area} m²` }]
                : []),
            ].map(({ icone: Icone, rotulo, valor }) => (
              <div key={rotulo} className="flex flex-col items-center gap-1 text-center">
                <Icone size={22} className="text-primary" />
                <span className="text-sm font-semibold">{valor}</span>
                <span className="text-xs text-slate-500">{rotulo}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Sobre o imóvel</h2>
            <p className="mt-2 whitespace-pre-line break-words leading-relaxed text-slate-700">
              {imovel.descricao || 'Sem descrição cadastrada.'}
            </p>

            {featuresAtivas.length > 0 && (
              <>
                <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Características
                </h3>
                <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {featuresAtivas.map((feature) => (
                    <li key={feature.key} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 size={16} className="text-green-600" />
                      {feature.label}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Localização</h2>
            <PropertyMap
              latitude={imovel.latitude}
              longitude={imovel.longitude}
              titulo={imovel.titulo}
            />
          </section>
        </div>

        <aside className="min-w-0 space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-3xl font-bold text-primary">{formatarBRL(imovel.preco)}</p>
            <p className="mt-1 text-sm text-slate-500">
              {imovel.transacao === 'venda' ? 'Valor de venda' : 'Valor do aluguel mensal'}
            </p>

            <a href={`https://wa.me/${config.whatsapp_number}?text=${encodeURIComponent(mensagemWhats)}`}
              target="_blank" rel="noreferrer"
              className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-600">
              <MessageCircle size={18} /> Falar no WhatsApp
            </a>

            <p className="mt-2 text-center text-xs text-slate-400">Ref. #{imovel.id}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Tenho interesse</h2>
            {leadEnviado ? (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
                Mensagem enviada com sucesso! Nossa equipe entrará em contato em breve.
              </div>
            ) : (
              <form onSubmit={enviarLead} className="mt-3 space-y-3">
                <input type="text" required minLength={2} placeholder="Seu nome"
                  value={lead.nome}
                  onChange={(e) => setLead({ ...lead, nome: e.target.value })}
                  className={classeInput} />
                <input type="email" required placeholder="Seu e-mail"
                  value={lead.email}
                  onChange={(e) => setLead({ ...lead, email: e.target.value })}
                  className={classeInput} />
                <input type="tel" required placeholder="Telefone / WhatsApp"
                  value={lead.telefone}
                  onChange={(e) => setLead({ ...lead, telefone: e.target.value })}
                  className={classeInput} />
                <textarea rows={3} placeholder="Mensagem (opcional)"
                  value={lead.mensagem}
                  onChange={(e) => setLead({ ...lead, mensagem: e.target.value })}
                  className={classeInput} />
                {erroLead && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{erroLead}</p>
                )}
                <button type="submit" disabled={enviandoLead}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60">
                  {enviandoLead ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                  Enviar mensagem
                </button>
              </form>
            )}
          </div>
        </aside>
      </div>

      <FloatingWhatsApp mensagem={mensagemWhats} />
    </div>
  )
}
