import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function ProtectedRoute({ children }) {
  const { autenticado } = useApp()

  if (!autenticado) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}
