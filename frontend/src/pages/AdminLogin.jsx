import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Building2, Loader2, Lock } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { extrairErro } from '../utils/format'
import { BRAND_NAME } from '../config/brand'

export default function AdminLogin() {
  const { login, autenticado } = useApp()
  const navigate = useNavigate()
  const [credenciais, setCredenciais] = useState({ username: '', password: '' })
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    document.title = `Painel - ${BRAND_NAME}`
  }, [])

  if (autenticado) {
    return <Navigate to="/admin" replace />
  }

  const submeter = async (evento) => {
    evento.preventDefault()
    setErro('')
    setCarregando(true)
    try {
      await login(credenciais.username, credenciais.password)
      navigate('/admin', { replace: true })
    } catch (e) {
      setErro(extrairErro(e))
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={submeter}
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-md"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
            <Lock size={22} />
          </span>
          <h1 className="text-xl font-bold">Painel Administrativo</h1>
          <p className="text-sm text-slate-500">{BRAND_NAME}</p>
        </div>

        <div className="mt-6 space-y-4">
          <input
            type="text"
            required
            placeholder="Usuário"
            autoComplete="username"
            value={credenciais.username}
            onChange={(e) => setCredenciais({ ...credenciais, username: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="password"
            required
            placeholder="Senha"
            autoComplete="current-password"
            value={credenciais.password}
            onChange={(e) => setCredenciais({ ...credenciais, password: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {erro && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700">{erro}</p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {carregando && <Loader2 size={16} className="animate-spin" />}
            Entrar
          </button>

          <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <Building2 size={12} /> Acesso restrito a corretores autorizados
          </p>
        </div>
      </form>
    </div>
  )
}
