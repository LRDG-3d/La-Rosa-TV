import { useState, useEffect } from 'react'
import Header from '../components/Header'
import EpisodeRow from '../components/EpisodeRow'
import VideoModal from '../components/VideoModal'
import { useEpisodes } from '../hooks/useEpisodes'

const WATCH_KEY = 'laRosaWatchHistory'

function getWatchHistory() {
  try {
    return JSON.parse(localStorage.getItem(WATCH_KEY)) || []
  } catch {
    return []
  }
}

function recordWatch(episodeId) {
  const history = getWatchHistory().filter((h) => h.id !== episodeId)
  history.unshift({ id: episodeId, timestamp: Date.now(), progress: 0 })
  localStorage.setItem(WATCH_KEY, JSON.stringify(history.slice(0, 20)))
}

export default function Home() {
  const { episodes, loading } = useEpisodes()
  const [active, setActive] = useState(null)
  const [history, setHistory] = useState(getWatchHistory())

  useEffect(() => {
    setHistory(getWatchHistory())
  }, [active])

  const handleSelect = (episode) => {
    recordWatch(episode.id)
    setHistory(getWatchHistory())
    setActive(episode)
  }

  const nuevos = [...episodes]
    .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
    .slice(0, 10)

  const populares = [...episodes].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10)

  const volverAVer = history
    .map((h) => {
      const ep = episodes.find((e) => e.id === h.id)
      return ep ? { ...ep, progress: h.progress } : null
    })
    .filter(Boolean)

  const getProgress = (id) => {
    const h = history.find((x) => x.id === id)
    return h ? h.progress || 12 : null
  }

  return (
    <>
      <Header />

      <section className="hero">
        <div className="eyebrow">Fe · Esperanza · Segundas oportunidades</div>
        <h1>📺 Capítulos de la Rosa</h1>
        <p>Sigue las historias que han acompañado a millones de familias, lunes a viernes a las 7:30 p.m. ✨</p>
      </section>

      {loading ? (
        <div className="loading">Cargando episodios…</div>
      ) : (
        <>
          <EpisodeRow
            title="Nuevos episodios"
            icon="✨"
            episodes={nuevos}
            badge="Nuevo"
            emptyText="Aún no hay episodios nuevos. Súbelos desde el panel de admin."
            onSelect={handleSelect}
          />
          <EpisodeRow
            title="Volver a ver"
            icon="↩️"
            episodes={volverAVer}
            emptyText="Todavía no has visto ningún capítulo. Los que veas aparecerán aquí."
            onSelect={handleSelect}
            getProgress={getProgress}
          />
          <EpisodeRow
            title="Episodios populares"
            icon="🔥"
            episodes={populares}
            badge="Popular"
            emptyText="Aún no hay datos de popularidad."
            onSelect={handleSelect}
          />
        </>
      )}

      <footer>La Rosa 🌹 — proyecto personal, sin fines comerciales</footer>

      <VideoModal episode={active} onClose={() => setActive(null)} />
    </>
  )
}
