import { useAuth } from '../context/AuthContext.jsx'
import AdminLogin from '../pages/AdminLogin.jsx'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <p className="empty-note">Cargando...</p>
  if (!user) return <AdminLogin />
  return children
}
