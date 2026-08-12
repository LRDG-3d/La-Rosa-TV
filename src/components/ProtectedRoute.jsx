import { useAuth } from '../hooks/useAuth'
import Login from '../pages/Login'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="loading">Cargando…</div>
  if (!user) return <Login />
  return children
}
