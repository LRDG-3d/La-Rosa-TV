export default function VideoModal({ episode, onClose }) {
  if (!episode) return null
  return (
    <div className="modal-backdrop open" onClick={(e) => e.target.classList.contains('modal-backdrop') && onClose()}>
      <div className="modal">
        <div className="modal-video">
          {episode.videoUrl ? (
            <video src={episode.videoUrl} controls autoPlay style={{ width: '100%', height: '100%' }} />
          ) : (
            'Aquí se cargaría el reproductor de video 🎬'
          )}
        </div>
        <div className="modal-info">
          <div>
            <h3>{episode.title}</h3>
            <p>Temporada {episode.season} · Episodio {episode.ep}</p>
          </div>
          <button className="close-btn" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}
