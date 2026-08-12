import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase'

// Escucha en tiempo real el nodo /episodes de Firebase Realtime Database.
// Estructura esperada en Firebase:
// episodes: {
//   "-Nxxxx": { title, season, ep, dateAdded, views, videoUrl }
// }
export function useEpisodes() {
  const [episodes, setEpisodes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const episodesRef = ref(db, 'episodes')
    const unsub = onValue(episodesRef, (snapshot) => {
      const data = snapshot.val() || {}
      const list = Object.entries(data).map(([id, value]) => ({ id, ...value }))
      setEpisodes(list)
      setLoading(false)
    })
    return unsub
  }, [])

  return { episodes, loading }
}
