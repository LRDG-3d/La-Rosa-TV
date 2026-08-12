import { useState, useEffect } from 'react'
import { ref, push, update, serverTimestamp } from 'firebase/database'
import { db } from '../firebase'

const emptyForm = { title: '', season: 1, ep: 1, dateAdded: '', views: 0, videoUrl: '' }

export default function AdminEpisodeForm({ editingEpisode, onDone }) {
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editingEpisode) {
      const { id, ...rest } = editingEpisode
      setForm({ ...emptyForm, ...rest })
    } else {
      setForm({ ...emptyForm, dateAdded: new Date().toISOString().slice(0, 10) })
    }
  }, [editingEpisode])

  const handleChange = (field) => (e) => {
    const value = field === 'season' || field === 'ep' || field === 'views'
      ? Number(e.target.value)
      : e.target.value
    setForm((f) => ({ ...f, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingEpisode) {
        await update(ref(db, `episodes/${editingEpisode.id}`), form)
      } else {
        await push(ref(db, 'episodes'), { ...form, createdAt: serverTimestamp() })
      }
      onDone()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h3>{editingEpisode ? '✏️ Editar capítulo' : '➕ Subir nuevo capítulo'}</h3>

      <label>Título</label>
      <input value={form.title} onChange={handleChange('title')} required />

      <div className="form-row">
        <div>
          <label>Temporada</label>
          <input type="number" min="1" value={form.season} onChange={handleChange('season')} required />
        </div>
        <div>
          <label>Episodio</label>
          <input type="number" min="1" value={form.ep} onChange={handleChange('ep')} required />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>Fecha agregado</label>
          <input type="date" value={form.dateAdded} onChange={handleChange('dateAdded')} required />
        </div>
        <div>
          <label>Vistas</label>
          <input type="number" min="0" value={form.views} onChange={handleChange('views')} />
        </div>
      </div>

      <label>URL del video</label>
      <input value={form.videoUrl} onChange={handleChange('videoUrl')} placeholder="https://..." />

      <div className="form-actions">
        <button type="submit" disabled={saving}>
          {saving ? 'Guardando…' : editingEpisode ? 'Guardar cambios' : 'Subir capítulo'}
        </button>
        {editingEpisode && (
          <button type="button" className="btn-ghost" onClick={onDone}>Cancelar</button>
        )}
      </div>
    </form>
  )
}
