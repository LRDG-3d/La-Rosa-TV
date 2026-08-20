import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getSeasonGradientForSeason, getSeasonColorsForSeason } from '../seasonColors.js'
import { parseEpisodesFile } from '../data/importEpisodes.js'
import {
  useCategories, useSeasons, useEpisodes,
  addCategory, updateCategory, deleteCategory,
  addSeason, updateSeason, deleteSeason,
  addEpisode, deleteEpisode, updateEpisode, setEpisodeOrder,
} from '../data/db.js'

const TABS = ['Episodios', 'Temporadas', 'Categorías']
const ALL_CATS = 'ALL_CATS'
const NO_CATEGORY = 'NO_CATEGORY'

export default function AdminDashboard() {
  const { logout } = useAuth()
  const categories = useCategories()
  const seasons = useSeasons()
  const episodes = useEpisodes()

  const [tab, setTab] = useState('Episodios')
  const [saveError, setSaveError] = useState('')

  return (
    <div className="admin-wrap">
      <div className="admin-topbar">
        <h1>Panel de admin</h1>
        <button className="dl-btn" onClick={logout}>Cerrar sesión</button>
      </div>

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`admin-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {saveError && <p className="admin-error" style={{ margin: '12px 0' }}>{saveError}</p>}

      {tab === 'Episodios' && (
        <EpisodesTab
          seasons={seasons}
          episodes={episodes}
          categories={categories}
          setSaveError={setSaveError}
        />
      )}

      {tab === 'Temporadas' && (
        <SeasonsTab
          seasons={seasons}
          categories={categories}
          setSaveError={setSaveError}
        />
      )}

      {tab === 'Categorías' && (
        <CategoriesTab categories={categories} setSaveError={setSaveError} />
      )}
    </div>
  )
}

function CategoryFilterBar({ categories, value, onChange }) {
  return (
    <div className="admin-season-bar">
      <button
        className={`category-btn ${value === NO_CATEGORY ? 'active' : ''}`}
        onClick={() => onChange(NO_CATEGORY)}
      >
        Versión 1
      </button>
      <button
        className={`category-btn ${value === ALL_CATS ? 'active' : ''}`}
        onClick={() => onChange(ALL_CATS)}
      >
        Todas las categorías
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          className={`category-btn ${value === c.id ? 'active' : ''}`}
          onClick={() => onChange(c.id)}
        >
          {c.name}
        </button>
      ))}
    </div>
  )
}

function EpisodesTab({ seasons, episodes, categories, setSaveError }) {
  const [categoryFilter, setCategoryFilter] = useState(NO_CATEGORY)
  const [selectedSeason, setSelectedSeason] = useState('')
  const [epNumber, setEpNumber] = useState('')
  const [epTitle, setEpTitle] = useState('')
  const [epUrl, setEpUrl] = useState('')

  const filteredSeasons = (
    categoryFilter === ALL_CATS
      ? seasons
      : categoryFilter === NO_CATEGORY
      ? seasons.filter((s) => !s.categoryId)
      : seasons.filter((s) => s.categoryId === categoryFilter)
  )
    .slice()
    .sort((a, b) => a.number - b.number)

  const seasonId = filteredSeasons.some((s) => s.id === selectedSeason)
    ? selectedSeason
    : filteredSeasons[0]?.id || ''

  const list = episodes
    .filter((ep) => ep.seasonId === seasonId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  function handleCategoryChange(catId) {
    setCategoryFilter(catId)
    setSelectedSeason('')
  }

  const [importFile, setImportFile] = useState(null)
  const [importPattern, setImportPattern] = useState('')
  const [importing, setImporting] = useState(false)
  const [importMsg, setImportMsg] = useState('')

  async function handleImport(e) {
    e.preventDefault()
    if (!importFile || !seasonId) return
    setImporting(true)
    setImportMsg('')
    try {
      setSaveError('')
      const parsed = await parseEpisodesFile(importFile)
      if (parsed.length === 0) {
        setSaveError('No se encontraron episodios en ese archivo.')
        setImporting(false)
        return
      }
      const season = filteredSeasons.find((s) => s.id === seasonId)
      const startOrder = list.length

      await Promise.all(
        parsed.map((ep, i) => {
          const url = importPattern
            ? importPattern
                .replace(/{season}/g, season?.number ?? '')
                .replace(/{episodio}/g, ep.number ?? '')
                .replace(/{episode}/g, ep.number ?? '')
            : ''
          return addEpisode(seasonId, ep.title, url, startOrder + i, ep.number)
        })
      )

      setImportMsg(`Se importaron ${parsed.length} episodios.`)
      setImportFile(null)
      e.target.reset()
    } catch (err) {
      console.error(err)
      setSaveError('No se pudo importar el archivo: ' + err.message)
    } finally {
      setImporting(false)
    }
  }

  async function handleAddEpisode(e) {
    e.preventDefault()
    if (!seasonId || !epTitle.trim() || !epUrl.trim()) return
    try {
      setSaveError('')
      await addEpisode(
        seasonId,
        epTitle.trim(),
        epUrl.trim(),
        list.length,
        epNumber ? Number(epNumber) : null
      )
      setEpNumber('')
      setEpTitle('')
      setEpUrl('')
    } catch (err) {
      console.error(err)
      setSaveError('No se pudo guardar el episodio: ' + err.message)
    }
  }

  const [editingId, setEditingId] = useState(null)
  const [editNumber, setEditNumber] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editUrl, setEditUrl] = useState('')

  function startEdit(ep) {
    setEditingId(ep.id)
    setEditNumber(ep.number ?? '')
    setEditTitle(ep.title ?? '')
    setEditUrl(ep.url ?? '')
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function saveEdit(id) {
    if (!editTitle.trim() || !editUrl.trim()) return
    try {
      setSaveError('')
      await updateEpisode(id, {
        number: editNumber ? Number(editNumber) : null,
        title: editTitle.trim(),
        url: editUrl.trim(),
      })
      setEditingId(null)
    } catch (err) {
      console.error(err)
      setSaveError('No se pudo actualizar el episodio: ' + err.message)
    }
  }

  async function move(index, direction) {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= list.length) return
    const a = list[index]
    const b = list[targetIndex]
    try {
      setSaveError('')
      await Promise.all([
        setEpisodeOrder(a.id, b.order ?? targetIndex),
        setEpisodeOrder(b.id, a.order ?? index),
      ])
    } catch (err) {
      console.error(err)
      setSaveError('No se pudo reordenar: ' + err.message)
    }
  }

  return (
    <section className="admin-section">
      <CategoryFilterBar categories={categories} value={categoryFilter} onChange={handleCategoryChange} />

      {filteredSeasons.length === 0 ? (
        <p className="empty-note">No hay temporadas aquí. Crea una en la pestaña "Temporadas".</p>
      ) : (
        <>
          <div className="admin-season-bar">
            {filteredSeasons.map((s) => (
              <button
                key={s.id}
                className={`season-btn ${seasonId === s.id ? 'active' : ''}`}
                style={{ '--season-grad': getSeasonGradientForSeason(s) }}
                onClick={() => setSelectedSeason(s.id)}
              >
                {s.title || `Temporada ${s.number}`}
              </button>
            ))}
          </div>

          <form className="admin-form admin-import-form" onSubmit={handleImport}>
            <input
              type="file"
              accept=".js,.json"
              onChange={(e) => setImportFile(e.target.files[0] || null)}
            />
            <input
              placeholder="Patrón de link (opcional), ej: .../T{season}-E{episodio}.mp4"
              value={importPattern}
              onChange={(e) => setImportPattern(e.target.value)}
            />
            <button type="submit" className="dl-btn" disabled={!importFile || importing}>
              {importing ? 'Importando...' : 'Importar archivo'}
            </button>
          </form>
          {importMsg && <p className="empty-note" style={{ color: 'var(--cyan)' }}>{importMsg}</p>}

          <form className="admin-form" onSubmit={handleAddEpisode}>
            <input
              type="number"
              placeholder="N.º episodio"
              value={epNumber}
              onChange={(e) => setEpNumber(e.target.value)}
              style={{ maxWidth: 110 }}
            />
            <input
              placeholder="Título del episodio"
              value={epTitle}
              onChange={(e) => setEpTitle(e.target.value)}
            />
            <input
              placeholder="Link de descarga"
              value={epUrl}
              onChange={(e) => setEpUrl(e.target.value)}
            />
            <button type="submit" className="dl-btn">Añadir</button>
          </form>

          <ul className="admin-list">
            {list.length === 0 && (
              <p className="empty-note">No hay episodios en esta temporada todavía.</p>
            )}
            {list.map((ep, i) => (
              <li key={ep.id} className={editingId === ep.id ? 'admin-list-editing' : ''}>
                {editingId === ep.id ? (
                  <div className="admin-edit-row">
                    <input
                      type="number"
                      placeholder="N.º"
                      value={editNumber}
                      onChange={(e) => setEditNumber(e.target.value)}
                      style={{ maxWidth: 70 }}
                    />
                    <input
                      placeholder="Título"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <input
                      placeholder="Link"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                    />
                    <button className="dl-btn" onClick={() => saveEdit(ep.id)}>Guardar</button>
                    <button className="admin-delete" onClick={cancelEdit}>Cancelar</button>
                  </div>
                ) : (
                  <>
                    <span className="admin-order-controls">
                      <button
                        className="order-btn"
                        disabled={i === 0}
                        onClick={() => move(i, -1)}
                        aria-label="Mover arriba"
                      >
                        ↑
                      </button>
                      <button
                        className="order-btn"
                        disabled={i === list.length - 1}
                        onClick={() => move(i, 1)}
                        aria-label="Mover abajo"
                      >
                        ↓
                      </button>
                    </span>
                    <span style={{ flex: 1 }}>
                      {ep.number != null ? `Ep. ${ep.number} — ${ep.title}` : ep.title}
                    </span>
                    <button className="admin-edit-btn" onClick={() => startEdit(ep)}>Editar</button>
                    <button className="admin-delete" onClick={() => deleteEpisode(ep.id)}>Eliminar</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

function SeasonsTab({ seasons, categories, setSaveError }) {
  const [categoryFilter, setCategoryFilter] = useState(NO_CATEGORY)
  const [seasonNumber, setSeasonNumber] = useState('')
  const [seasonTitle, setSeasonTitle] = useState('')
  const [seasonCategory, setSeasonCategory] = useState('')
  const [colorA, setColorA] = useState('#ff3b4e')
  const [colorB, setColorB] = useState('#22e5ff')

  const visibleSeasons = (
    categoryFilter === ALL_CATS
      ? seasons
      : categoryFilter === NO_CATEGORY
      ? seasons.filter((s) => !s.categoryId)
      : seasons.filter((s) => s.categoryId === categoryFilter)
  )
    .slice()
    .sort((a, b) => a.number - b.number)

  function handleCategoryChange(catId) {
    setCategoryFilter(catId)
    setSeasonCategory(catId === ALL_CATS || catId === NO_CATEGORY ? '' : catId)
  }

  async function handleAddSeason(e) {
    e.preventDefault()
    if (!seasonNumber) return
    try {
      setSaveError('')
      await addSeason(Number(seasonNumber), seasonTitle.trim(), seasonCategory || null, colorA, colorB)
      setSeasonNumber('')
      setSeasonTitle('')
    } catch (err) {
      console.error(err)
      setSaveError('No se pudo guardar la temporada: ' + err.message)
    }
  }

  const [editingId, setEditingId] = useState(null)
  const [editNumber, setEditNumber] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editColorA, setEditColorA] = useState('#ff3b4e')
  const [editColorB, setEditColorB] = useState('#22e5ff')

  function startEdit(s) {
    setEditingId(s.id)
    setEditNumber(s.number ?? '')
    setEditTitle(s.title ?? '')
    setEditCategory(s.categoryId ?? '')
    const [a, b] = getSeasonColorsForSeason(s)
    setEditColorA(a)
    setEditColorB(b)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function saveEdit(id) {
    if (!editNumber) return
    try {
      setSaveError('')
      await updateSeason(id, {
        number: Number(editNumber),
        title: editTitle.trim() || `Temporada ${editNumber}`,
        categoryId: editCategory || null,
        colorA: editColorA,
        colorB: editColorB,
      })
      setEditingId(null)
    } catch (err) {
      console.error(err)
      setSaveError('No se pudo actualizar la temporada: ' + err.message)
    }
  }

  return (
    <section className="admin-section">
      <CategoryFilterBar categories={categories} value={categoryFilter} onChange={handleCategoryChange} />

      <form className="admin-form" onSubmit={handleAddSeason}>
        <input
          type="number"
          placeholder="Número"
          value={seasonNumber}
          onChange={(e) => setSeasonNumber(e.target.value)}
        />
        <input
          placeholder="Título (opcional)"
          value={seasonTitle}
          onChange={(e) => setSeasonTitle(e.target.value)}
        />
        <select value={seasonCategory} onChange={(e) => setSeasonCategory(e.target.value)}>
          <option value="">Sin categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <label className="admin-color-label">
          Color 1
          <input type="color" value={colorA} onChange={(e) => setColorA(e.target.value)} />
        </label>
        <label className="admin-color-label">
          Color 2
          <input type="color" value={colorB} onChange={(e) => setColorB(e.target.value)} />
        </label>
        <button type="submit" className="dl-btn">Añadir</button>
      </form>

      <ul className="admin-list">
        {visibleSeasons.length === 0 && (
          <p className="empty-note">No hay temporadas aquí.</p>
        )}
        {visibleSeasons.map((s) => (
          <li key={s.id} className={editingId === s.id ? 'admin-list-editing' : ''}>
            {editingId === s.id ? (
              <div className="admin-edit-row">
                <input
                  type="number"
                  placeholder="Número"
                  value={editNumber}
                  onChange={(e) => setEditNumber(e.target.value)}
                  style={{ maxWidth: 80 }}
                />
                <input
                  placeholder="Título"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                  <option value="">Sin categoría</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <label className="admin-color-label">
                  <input type="color" value={editColorA} onChange={(e) => setEditColorA(e.target.value)} />
                </label>
                <label className="admin-color-label">
                  <input type="color" value={editColorB} onChange={(e) => setEditColorB(e.target.value)} />
                </label>
                <button className="dl-btn" onClick={() => saveEdit(s.id)}>Guardar</button>
                <button className="admin-delete" onClick={cancelEdit}>Cancelar</button>
              </div>
            ) : (
              <>
                <span
                  className="season-dot"
                  style={{ background: getSeasonGradientForSeason(s), width: 14, height: 14 }}
                ></span>
                <span style={{ flex: 1 }}>{s.title || `Temporada ${s.number}`}</span>
                <button className="admin-edit-btn" onClick={() => startEdit(s)}>Editar</button>
                <button className="admin-delete" onClick={() => deleteSeason(s.id)}>Eliminar</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

function CategoriesTab({ categories, setSaveError }) {
  const [categoryName, setCategoryName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  async function handleAddCategory(e) {
    e.preventDefault()
    if (!categoryName.trim()) return
    try {
      setSaveError('')
      await addCategory(categoryName.trim())
      setCategoryName('')
    } catch (err) {
      console.error(err)
      setSaveError('No se pudo guardar la categoría: ' + err.message)
    }
  }

  function startEdit(c) {
    setEditingId(c.id)
    setEditName(c.name)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function saveEdit(id) {
    if (!editName.trim()) return
    try {
      setSaveError('')
      await updateCategory(id, editName.trim())
      setEditingId(null)
    } catch (err) {
      console.error(err)
      setSaveError('No se pudo actualizar la categoría: ' + err.message)
    }
  }

  return (
    <section className="admin-section">
      <form className="admin-form" onSubmit={handleAddCategory}>
        <input
          placeholder="Nombre de la categoría"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
        />
        <button type="submit" className="dl-btn">Añadir</button>
      </form>
      <ul className="admin-list">
        {categories.map((c) => (
          <li key={c.id} className={editingId === c.id ? 'admin-list-editing' : ''}>
            {editingId === c.id ? (
              <div className="admin-edit-row">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <button className="dl-btn" onClick={() => saveEdit(c.id)}>Guardar</button>
                <button className="admin-delete" onClick={cancelEdit}>Cancelar</button>
              </div>
            ) : (
              <>
                <span style={{ flex: 1 }}>{c.name}</span>
                <button className="admin-edit-btn" onClick={() => startEdit(c)}>Editar</button>
                <button className="admin-delete" onClick={() => deleteCategory(c.id)}>Eliminar</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
