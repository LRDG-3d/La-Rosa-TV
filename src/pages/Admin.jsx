import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { ref, remove } from 'firebase/database'
import { auth, db } from '../firebase'
import { useAuth } from '../hooks/useAuth'
import { useEpisodes } from '../hooks/useEpisodes'
import ProtectedRoute from '../components/ProtectedRoute'
import AdminEpisodeForm from '../components/AdminEpisodeForm'

function AdminDashboard() {
  const { user } = useAuth()
  const { episodes, loading } = useEpisodes()
  const [editingEpisode, setEditingEpisode] = useState(null)

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este capítulo? 🗑️')) return
    await remove(ref(db, `episodes/${id}`))
  }

  const sorted = [...episodes].sort((a, b) => (a.season - b.season) || (a.ep - b.ep))

  return (
    <div className="admin-wrap">
      <header className="admin-header">
        <h1>🛠️ Panel de administración — La Rosa</h1>
        <div className="admin-user">
          <span>{user.email}</span>
          <button className="btn-ghost" onClick={() => signOut(auth)}>Cerrar sesión</button>
        </div>
      </header>

      <div className="admin-grid">
        <AdminEpisodeForm
          editingEpisode={editingEpisode}
          onDone={() => setEditingEpisode(null)}
        />

        <div className="admin-list">
          <h3>📚 Capítulos ({episodes.length})</h3>
          {loading && <p>Cargando…</p>}
          {!loading && !episodes.length && <p className="empty">Aún no hay capítulos subidos.</p>}
          {sorted.map((ep) => (
            <div className="admin-row" key={ep.id}>
              <div>
                <strong>T{ep.season} · E{ep.ep}</strong> — {ep.title}
                <div className="admin-row-meta">{ep.dateAdded} · {ep.views || 0} vistas</div>
              </div>
              <div className="admin-row-actions">
                <button onClick={() => setEditingEpisode(ep)}>✏️</button>
                <button onClick={() => handleDelete(ep.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Admin() {
  return (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  )
}
