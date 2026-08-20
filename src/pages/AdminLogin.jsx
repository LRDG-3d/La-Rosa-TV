import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function AdminLogin() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
    } catch (err) {
      setError('Correo o contraseña incorrectos.')
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-card" onSubmit={handleSubmit}>
        <h1>Acceso admin</h1>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="admin-error">{error}</p>}
        <button type="submit" className="dl-btn">Entrar</button>
      </form>
    </div>
  )
}
