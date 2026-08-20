import { useEffect, useState } from 'react'
import { ref, onValue, push, remove, update } from 'firebase/database'
import { db } from '../firebase.js'

function useDbList(path) {
  const [items, setItems] = useState([])

  useEffect(() => {
    const r = ref(db, path)
    const unsub = onValue(r, (snapshot) => {
      const val = snapshot.val() || {}
      const list = Object.entries(val).map(([id, data]) => ({ id, ...data }))
      setItems(list)
    })
    return unsub
  }, [path])

  return items
}

export function useCategories() {
  return useDbList('categories')
}

export function useSeasons() {
  return useDbList('seasons')
}

export function useEpisodes() {
  return useDbList('episodes')
}

// ---------- Categorías ----------
export async function addCategory(name) {
  return push(ref(db, 'categories'), { name })
}
export async function updateCategory(id, name) {
  return update(ref(db, `categories/${id}`), { name })
}
export async function deleteCategory(id) {
  return remove(ref(db, `categories/${id}`))
}

// ---------- Temporadas ----------
export async function addSeason(number, title, categoryId, colorA, colorB) {
  return push(ref(db, 'seasons'), {
    number,
    title: title || `Temporada ${number}`,
    categoryId: categoryId || null,
    colorA: colorA || null,
    colorB: colorB || null,
  })
}
export async function updateSeason(id, data) {
  return update(ref(db, `seasons/${id}`), data)
}
export async function deleteSeason(id) {
  return remove(ref(db, `seasons/${id}`))
}

// ---------- Episodios ----------
export async function addEpisode(seasonId, title, url, order = 0, number = null) {
  return push(ref(db, 'episodes'), { seasonId, title, url, order, number })
}
export async function deleteEpisode(id) {
  return remove(ref(db, `episodes/${id}`))
}
export async function updateEpisode(id, data) {
  return update(ref(db, `episodes/${id}`), data)
}
export async function setEpisodeOrder(id, order) {
  return update(ref(db, `episodes/${id}`), { order })
}
