import { getSeasonGradient } from '../seasonColors'

export default function EpisodeCard({ episode, badge, progress, onClick }) {
  return (
    <div className="card" onClick={() => onClick(episode)}>
      <div className="thumb" style={{ background: getSeasonGradient(episode.season) }}>
        {badge && <div className="badge">{badge}</div>}
        <div className="ring">
          <svg viewBox="0 0 24 24" fill="#fff" width="14" height="14">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        {progress ? <div className="progress-bar" style={{ width: `${progress}%` }} /> : null}
      </div>
      <div className="card-body">
        <div className="meta">T{episode.season} · E{episode.ep}</div>
        <h3>{episode.title}</h3>
        <div className="dur">Capítulo completo</div>
      </div>
    </div>
  )
}
