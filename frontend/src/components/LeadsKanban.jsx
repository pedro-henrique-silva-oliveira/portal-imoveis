import { ArrowLeft, ArrowRight, MessageCircle, Trash2 } from 'lucide-react'

export const ESTAGIOS = [
  { id: 'novo', rotulo: 'Novo lead', cor: 'bg-slate-500' },
  { id: 'em_contato', rotulo: 'Em contato', cor: 'bg-blue-500' },
  { id: 'visita_agendada', rotulo: 'Visita agendada', cor: 'bg-violet-500' },
  { id: 'proposta', rotulo: 'Proposta', cor: 'bg-amber-500' },
  { id: 'fechado', rotulo: 'Fechado', cor: 'bg-green-600' },
  { id: 'perdido', rotulo: 'Perdido', cor: 'bg-red-500' },
]

export default function LeadsKanban({ leads, aoMudarStatus, aoExcluir }) {
  const indiceEstagio = (status) =>
    ESTAGIOS.findIndex((e) => e.id === (status || 'novo'))

  const mover = (lead, direcao) => {
    const atual = indiceEstagio(lead.status)
    const destino = ESTAGIOS[atual + direcao]
    if (destino) aoMudarStatus(lead, destino.id)
  }

  return (
    <div className="mt-6 flex gap-3 overflow-x-auto pb-3">
      {ESTAGIOS.map((estagio) => {
        const cartoes = leads.filter((l) => (l.status || 'novo') === estagio.id)
        return (
          <div
            key={estagio.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              const id = Number(e.dataTransfer.getData('text/plain'))
              const lead = leads.find((l) => l.id === id)
              if (lead && (lead.status || 'novo') !== estagio.id) {
                aoMudarStatus(lead, estagio.id)
              }
            }}
            className="flex w-64 flex-shrink-0 flex-col rounded-xl border border-slate-200 bg-slate-50"
          >
            <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2.5">
              <span className={`h-2.5 w-2.5 rounded-full ${estagio.cor}`} />
              <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
                {estagio.rotulo}
              </span>
              <span className="ml-auto rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {cartoes.length}
              </span>
            </div>

            <div className="flex min-h-[280px] flex-col gap-2 p-2">
              {cartoes.map((lead) => {
                const pos = indiceEstagio(lead.status)
                return (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', String(lead.id))}
                    className="cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:border-primary/40 active:cursor-grabbing"
                  >
                    <p className="text-sm font-bold text-slate-900">{lead.nome}</p>
                    <a
                      href={`https://wa.me/55${String(lead.telefone).replace(/\D/g, '').replace(/^0+/, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 flex items-center gap-1 text-xs font-medium text-green-700 hover:underline"
                    >
                      <MessageCircle size={12} /> {lead.telefone}
                    </a>
                    {lead.mensagem && (
                      <p className="mt-1.5 line-clamp-2 text-xs text-slate-500" title={lead.mensagem}>
                        {lead.mensagem}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={pos === 0}
                          onClick={() => mover(lead, -1)}
                          aria-label="Mover para trás"
                          className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-30"
                        >
                          <ArrowLeft size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={pos === ESTAGIOS.length - 1}
                          onClick={() => mover(lead, 1)}
                          aria-label="Mover para frente"
                          className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-30"
                        >
                          <ArrowRight size={14} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => aoExcluir(lead)}
                        aria-label={`Excluir lead ${lead.nome}`}
                        className="rounded-md p-1.5 text-slate-300 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}

              {cartoes.length === 0 && (
                <p className="py-6 text-center text-xs text-slate-400">
                  Arraste um card aqui
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
