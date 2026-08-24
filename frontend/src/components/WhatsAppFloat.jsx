import { MessageCircle } from 'lucide-react'
import { WHATSAPP_NUMBER } from '../config/brand'

export default function WhatsAppFloat({ mensagem }) {
  const texto = encodeURIComponent(mensagem || 'Olá! Gostaria de mais informações.')
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${texto}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition hover:scale-105 hover:bg-green-600"
    >
      <MessageCircle size={26} />
    </a>
  )
}
