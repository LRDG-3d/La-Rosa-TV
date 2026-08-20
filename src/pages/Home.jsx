import { useState } from 'react'
import TopBar from '../components/TopBar.jsx'
import SideMenu from '../components/SideMenu.jsx'
import SeasonsGrid from '../components/SeasonsGrid.jsx'
import { useSeasons, useEpisodes, useCategories } from '../data/db.js'
import { ALL_ID, getSeasonColorsForSeason } from '../seasonColors.js'

const NO_CATEGORY = 'NO_CATEGORY'

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSeasonId, setActiveSeasonId] = useState(null)
  const [activeCategoryId, setActiveCategoryId] = useState(null)

  const categories = useCategories()
  const allSeasons = useSeasons()
  const episodes = useEpisodes()

  const effectiveCategoryId = activeCategoryId ?? NO_CATEGORY

  let seasons
  if (effectiveCategoryId === NO_CATEGORY) {
    seasons = allSeasons.filter((s) => !s.categoryId)
  } else {
    seasons = allSeasons.filter((s) => s.categoryId === effectiveCategoryId)
  }

  const currentSeasonId = activeSeasonId || seasons[0]?.id || null
  const showingAll = currentSeasonId === ALL_ID

  const seasonsById = Object.fromEntries(allSeasons.map((s) => [s.id, s]))

  const visibleEpisodes = showingAll
    ? episodes
        .filter((ep) => seasons.some((s) => s.id === ep.seasonId))
        .sort((a, b) => {
          const sa = seasonsById[a.seasonId]?.number ?? 0
          const sb = seasonsById[b.seasonId]?.number ?? 0
          if (sa !== sb) return sa - sb
          return (a.order ?? 0) - (b.order ?? 0)
        })
    : episodes
        .filter((ep) => ep.seasonId === currentSeasonId)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  const [colorA, colorB] = showingAll
    ? ['#3b82f6', '#a855f7']
    : getSeasonColorsForSeason(seasonsById[currentSeasonId])

  const pageBackground = {
    background: `radial-gradient(circle at 15% 10%, ${colorA}33, transparent 45%),
                 radial-gradient(circle at 85% 90%, ${colorB}33, transparent 45%),
                 var(--bg)`,
  }

  function handleSelectCategory(catId) {
    setActiveCategoryId(catId)
    setActiveSeasonId(null)
  }

  return (
    <div className="page-bg" style={pageBackground}>
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <TopBar onMenuClick={() => setMenuOpen(true)} />

      <header className="page-header">
        <h1>Descargas</h1>
        <p>Selecciona una temporada</p>
      </header>

      <div className="category-bar">
        <button
          className={`category-btn ${effectiveCategoryId === NO_CATEGORY ? 'active' : ''}`}
          onClick={() => handleSelectCategory(NO_CATEGORY)}
        >
          Versión 1
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`category-btn ${effectiveCategoryId === c.id ? 'active' : ''}`}
            onClick={() => handleSelectCategory(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      <SeasonsGrid
        seasons={seasons}
        activeSeason={currentSeasonId}
        onSelect={setActiveSeasonId}
      />

      <div className="list">
        {visibleEpisodes.length === 0 && (
          <p className="empty-note">No hay episodios todavía.</p>
        )}
        {visibleEpisodes.map((ep) => {
          const season = seasonsById[ep.seasonId]
          return (
            <div className="episode" key={ep.id}>
              <div className="ep-info">
                <div className="ep-title">
                  {ep.number != null ? `Ep. ${ep.number} — ${ep.title}` : ep.title}
                </div>
                {showingAll && season && (
                  <div className="ep-meta">{season.title || `Temporada ${season.number}`}</div>
                )}
              </div>
              <a className="dl-btn" href={ep.url} download target="_blank" rel="noopener noreferrer">
                Descargar
              </a>
            </div>
          )
        })}
      </div>
    </div>
  )
}
