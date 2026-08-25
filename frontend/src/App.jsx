import { useEffect } from 'react'
import { Link, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import BotaoDemanda from './components/BotaoDemanda'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import PropertyDetails from './pages/PropertyDetails'
import DemandaPage from './pages/DemandaPage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

function LayoutPublico() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <BotaoDemanda />
    </div>
  )
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<LayoutPublico />}>
          <Route path="/" element={<Home />} />
          <Route path="/imovel/:id" element={<PropertyDetails />} />
          <Route path="/demanda" element={<DemandaPage />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <div className="flex min-h-screen flex-col items-center justify-center gap-4">
              <p className="text-5xl font-bold text-primary">404</p>
              <p className="text-slate-600">Página não encontrada.</p>
              <Link to="/" className="font-medium text-primary hover:underline">
                Voltar ao início
              </Link>
            </div>
          }
        />
      </Routes>
    </>
  )
}
