import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { StoreProvider } from './context/StoreContext'
import HomePage from './pages/HomePage'
import AdminLogin from './pages/AdminLogin'
import AdminProducts from './pages/AdminProducts'
import AdminOrders from './pages/AdminOrders'
import AdminResetPassword from './pages/AdminResetPassword'
import { supabase } from './lib/supabase'

function AdminGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setIsAuthenticated(Boolean(data.session)))
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setIsAuthenticated(Boolean(session)))
    return () => data.subscription.unsubscribe()
  }, [])

  if (isAuthenticated === null) return <div className="min-h-screen bg-[#1a1e1f]" />
  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <StoreProvider>
      <CartProvider>
        <BrowserRouter basename={new URL(import.meta.env.BASE_URL, window.location.origin).pathname}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/reset" element={<AdminResetPassword />} />
            <Route path="/admin/products" element={<AdminGuard><AdminProducts /></AdminGuard>} />
            <Route path="/admin/orders" element={<AdminGuard><AdminOrders /></AdminGuard>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </StoreProvider>
  )
}
