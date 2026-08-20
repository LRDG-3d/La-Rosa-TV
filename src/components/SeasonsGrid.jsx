import { getSeasonGradientForSeason, ALL_GRADIENT, ALL_ID } from '../seasonColors.js'

export default function SeasonsGrid({ seasons, activeSeason, onSelect }) {
  return (
    <div className="seasons">
      <button
        className={`season-btn all-btn ${activeSeason === ALL_ID ? 'active' : ''}`}
        style={{ '--season-grad': ALL_GRADIENT }}
        onClick={() => onSelect(ALL_ID)}
      >
        <span className="season-dot" style={{ background: ALL_GRADIENT }}></span>
        Todas las temporadas
      </button>

      {seasons.length === 0 && (
        <p className="empty-note">Aún no hay temporadas cargadas.</p>
      )}

      {seasons
        .slice()
        .sort((a, b) => a.number - b.number)
        .map((season) => {
          const grad = getSeasonGradientForSeason(season)
          return (
            <button
              key={season.id}
              className={`season-btn ${activeSeason === season.id ? 'active' : ''}`}
              style={{ '--season-grad': grad }}
              onClick={() => onSelect(season.id)}
            >
              <span className="season-dot" style={{ background: grad }}></span>
              {season.title || `Temporada ${season.number}`}
            </button>
          )
        })}
    </div>
  )
}
