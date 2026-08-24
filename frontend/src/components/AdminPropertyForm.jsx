import { useState } from 'react'
import { Loader2, MapPin, Plus, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { extrairErro } from '../utils/format'
import { FEATURES_DISPONIVEIS, TIPOS_IMOVEL, TRANSACOES } from '../config/brand'

const classeInput =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary'
const classeLabel = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500'

const estadoInicial = {
  titulo: '',
  descricao: '',
  preco: '',
  tipo: 'casa',
  transacao: 'venda',
  quartos: '0',
  suites: '0',
  banheiros: '0',
  vagas: '0',
  area: '',
  cep: '',
  endereco: '',
  bairro: '',
  cidade: '',
  latitude: '',
  longitude: '',
}

const MAX_FOTOS = 15

export default function AdminPropertyForm({ imovel, onSucesso, onCancelar }) {
  const { salvarImovel } = useApp()
  const [form, setForm] = useState(() => {
    if (!imovel) return estadoInicial
    const novo = { ...estadoInicial }
    Object.keys(estadoInicial).forEach((chave) => {
      const valor = imovel[chave]
      novo[chave] = valor === null || valor === undefined ? '' : String(valor)
    })
    return novo
  })
  const [fotos, setFotos] = useState(imovel?.fotos || [])
  const [features, setFeatures] = useState(imovel?.features || {})
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [statusGeo, setStatusGeo] = useState('')

  const atualizar = (campo) => (evento) => {
    setForm((atual) => ({ ...atual, [campo]: evento.target.value }))
  }

  const adicionarFotos = (eventos) => {
    const arquivos = Array.from(eventos.target.files || [])
    const vagas = MAX_FOTOS - fotos.length
    if (arquivos.length > vagas) {
      alert(`Máximo de ${MAX_FOTOS} fotos.`)
    }
    arquivos.slice(0, Math.max(vagas, 0)).forEach((arquivo) => {
      const leitor = new FileReader()
      leitor.onload = () =>
        setFotos((atuais) => [...atuais, leitor.result].slice(0, MAX_FOTOS))
      leitor.readAsDataURL(arquivo)
    })
    eventos.target.value = ''
  }

  const removerFoto = (indice) => {
    setFotos((atuais) => atuais.filter((_, i) => i !== indice))
  }

  const alternarFeature = (chave) => {
    setFeatures((atuais) => ({ ...atuais, [chave]: !atuais[chave] }))
  }

  const buscarCep = async () => {
    const cepLimpo = form.cep.replace(/\D/g, '')
    if (cepLimpo.length !== 8) {
      setStatusGeo('Digite um CEP com 8 dígitos.')
      return
    }
    setStatusGeo('Buscando endereço e coordenadas...')
    let enderecoBase = null
    try {
      const resposta = await fetch(`https://cep.awesomeapi.com.br/json/${cepLimpo}`)
      if (!resposta.ok) throw new Error()
      const dados = await resposta.json()
      enderecoBase = {
        endereco: `${dados.address_type || ''} ${dados.address || ''}`.trim(),
        bairro: dados.district || '',
        cidade: dados.city || '',
        latitude: dados.lat ? String(dados.lat) : '',
        longitude: dados.lng ? String(dados.lng) : '',
      }
    } catch {
      try {
        const resposta = await fetch(
          `https://brasilapi.com.br/api/cep/v2/${cepLimpo}`,
        )
        if (!resposta.ok) throw new Error()
        const dados = await resposta.json()
        enderecoBase = {
          endereco: dados.street || '',
          bairro: dados.neighborhood || '',
          cidade: dados.city || '',
          latitude: dados.location?.coordinates?.latitude
            ? String(dados.location.coordinates.latitude)
            : '',
          longitude: dados.location?.coordinates?.longitude
            ? String(dados.location.coordinates.longitude)
            : '',
        }
      } catch {
        enderecoBase = null
      }
    }

    if (!enderecoBase) {
      setStatusGeo('CEP não encontrado. Preencha manualmente.')
      return
    }

    if (!enderecoBase.latitude || !enderecoBase.longitude) {
      try {
        const consulta = encodeURIComponent(
          `${enderecoBase.endereco}, ${enderecoBase.bairro}, ${enderecoBase.cidade}, Brasil`,
        )
        const resposta = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${consulta}`,
        )
        const dados = await resposta.json()
        if (dados?.[0]) {
          enderecoBase.latitude = dados[0].lat
          enderecoBase.longitude = dados[0].lon
        }
      } catch {
        setStatusGeo('Endereço preenchido, mas sem coordenadas automáticas.')
      }
    }

    setForm((atual) => ({ ...atual, ...enderecoBase }))
    setStatusGeo(
      enderecoBase.latitude
        ? 'Endereço e coordenadas preenchidos!'
        : 'Endereço preenchido. Coordenadas não encontradas.',
    )
  }

  const submeter = async (evento) => {
    evento.preventDefault()
    setErro('')
    if (!form.titulo.trim() || !form.preco) {
      setErro('Informe pelo menos o título e o preço.')
      return
    }
    setCarregando(true)
    try {
      const payload = {
        titulo: form.titulo.trim(),
        descricao: form.descricao,
        preco: parseFloat(form.preco),
        tipo: form.tipo,
        transacao: form.transacao,
        quartos: parseInt(form.quartos, 10) || 0,
        suites: parseInt(form.suites, 10) || 0,
        banheiros: parseInt(form.banheiros, 10) || 0,
        vagas: parseInt(form.vagas, 10) || 0,
        area: parseFloat(form.area) || 0,
        cep: form.cep,
        endereco: form.endereco,
        bairro: form.bairro,
        cidade: form.cidade,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        fotos,
        features,
      }
      await salvarImovel(payload, imovel?.id)
      onSucesso()
    } catch (e) {
      setErro(extrairErro(e))
    } finally {
      setCarregando(false)
    }
  }

  return (
    <form onSubmit={submeter} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={classeLabel}>Título *</label>
          <input type="text" value={form.titulo} onChange={atualizar('titulo')} className={classeInput} required />
        </div>
        <div>
          <label className={classeLabel}>Preço (R$) *</label>
          <input type="number" min="0" step="0.01" value={form.preco} onChange={atualizar('preco')} className={classeInput} required />
        </div>
        <div>
          <label className={classeLabel}>Tipo</label>
          <select value={form.tipo} onChange={atualizar('tipo')} className={classeInput}>
            {TIPOS_IMOVEL.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={classeLabel}>Transação</label>
          <select value={form.transacao} onChange={atualizar('transacao')} className={classeInput}>
            {TRANSACOES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={classeLabel}>Descrição</label>
        <textarea rows={4} value={form.descricao} onChange={atualizar('descricao')} className={classeInput} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div>
          <label className={classeLabel}>Quartos</label>
          <input type="number" min="0" value={form.quartos} onChange={atualizar('quartos')} className={classeInput} />
        </div>
        <div>
          <label className={classeLabel}>Suítes</label>
          <input type="number" min="0" value={form.suites} onChange={atualizar('suites')} className={classeInput} />
        </div>
        <div>
          <label className={classeLabel}>Banheiros</label>
          <input type="number" min="0" value={form.banheiros} onChange={atualizar('banheiros')} className={classeInput} />
        </div>
        <div>
          <label className={classeLabel}>Vagas</label>
          <input type="number" min="0" value={form.vagas} onChange={atualizar('vagas')} className={classeInput} />
        </div>
        <div>
          <label className={classeLabel}>Área (m²)</label>
          <input type="number" min="0" step="0.01" value={form.area} onChange={atualizar('area')} className={classeInput} />
        </div>
      </div>

      <fieldset className="rounded-lg border border-slate-200 p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Localização e geocodificação
        </legend>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={classeLabel}>CEP</label>
            <div className="flex gap-2">
              <input type="text" placeholder="00000-000" value={form.cep} onChange={atualizar('cep')} className={classeInput} />
              <button
                type="button"
                onClick={buscarCep}
                className="flex flex-shrink-0 items-center gap-1 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-white transition hover:brightness-110"
              >
                <MapPin size={14} />
                Buscar CEP
              </button>
            </div>
            {statusGeo && <p className="mt-1 text-xs text-slate-500">{statusGeo}</p>}
          </div>
          <div>
            <label className={classeLabel}>Endereço</label>
            <input type="text" value={form.endereco} onChange={atualizar('endereco')} className={classeInput} />
          </div>
          <div>
            <label className={classeLabel}>Bairro</label>
            <input type="text" value={form.bairro} onChange={atualizar('bairro')} className={classeInput} />
          </div>
          <div>
            <label className={classeLabel}>Cidade</label>
            <input type="text" value={form.cidade} onChange={atualizar('cidade')} className={classeInput} />
          </div>
          <div>
            <label className={classeLabel}>Latitude</label>
            <input type="text" value={form.latitude} onChange={atualizar('latitude')} className={classeInput} placeholder="-23.5505" />
          </div>
          <div>
            <label className={classeLabel}>Longitude</label>
            <input type="text" value={form.longitude} onChange={atualizar('longitude')} className={classeInput} placeholder="-46.6333" />
          </div>
        </div>
      </fieldset>

      <div>
        <label className={classeLabel}>
          Fotos ({fotos.length}/{MAX_FOTOS}) - convertidas automaticamente para Base64
        </label>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 transition hover:border-primary hover:text-primary">
          <Plus size={18} />
          Adicionar imagens
          <input type="file" accept="image/*" multiple onChange={adicionarFotos} className="hidden" />
        </label>
        {fotos.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {fotos.map((foto, indice) => (
              <div key={indice} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200">
                <img src={foto} alt={`Prévia ${indice + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removerFoto(indice)}
                  aria-label="Remover foto"
                  className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white opacity-0 transition group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <span className={classeLabel}>Características</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {FEATURES_DISPONIVEIS.map((feature) => (
            <label key={feature.key} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={!!features[feature.key]}
                onChange={() => alternarFeature(feature.key)}
                className="h-4 w-4 accent-[var(--color-primary)]"
              />
              {feature.label}
            </label>
          ))}
        </div>
      </div>

      {erro && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700">{erro}</p>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancelar}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={carregando}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {carregando && <Loader2 size={16} className="animate-spin" />}
          {imovel ? 'Salvar alterações' : 'Cadastrar imóvel'}
        </button>
      </div>
    </form>
  )
}
