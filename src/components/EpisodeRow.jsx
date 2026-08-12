import EpisodeCard from './EpisodeCard'

export default function EpisodeRow({ title, icon, episodes, emptyText, badge, onSelect, getProgress }) {
  return (
    <section className="section">
      <div className="section-head">
        <h2><span className="icon">{icon}</span> {title}</h2>
        <span className="count">{episodes.length ? `${episodes.length} episodios` : ''}</span>
      </div>
      {episodes.length ? (
        <div className="row">
          {episodes.map((ep) => (
            <EpisodeCard
              key={ep.id}
              episode={ep}
              badge={badge}
              progress={getProgress ? getProgress(ep.id) : null}
              onClick={onSelect}
            />
          ))}
        </div>
      ) : (
        <div className="empty">{emptyText}</div>
      )}
    </section>
  )
}
