export function formatarBRL(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor || 0)
}

export function formatarData(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function extrairErro(erro, padrao = 'Erro de conexão com o servidor.') {
  const detalhe = erro?.response?.data?.detail
  if (typeof detalhe === 'string') return detalhe
  if (Array.isArray(detalhe) && detalhe.length > 0) {
    const primeiro = detalhe[0]
    if (primeiro?.msg) {
      const campo = Array.isArray(primeiro.loc)
        ? primeiro.loc.filter((p) => p !== 'body').join('.')
        : ''
      return campo ? `${campo}: ${primeiro.msg}` : primeiro.msg
    }
  }
  return padrao
}
