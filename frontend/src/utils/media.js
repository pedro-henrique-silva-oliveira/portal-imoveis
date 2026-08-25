const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

/** URL da foto otimizada servida pelo backend (redimensionada + comprimida). */
export const urlFoto = (imovelId, indice = 0) =>
  `${API_BASE}/api/imoveis/${imovelId}/fotos/${indice}`

export default urlFoto
