// Lee un archivo .js (como los que exportan un objeto con "episodios")
// o .json y devuelve una lista limpia de { number, title }.
export async function parseEpisodesFile(file) {
  const text = await file.text()

  let data
  if (file.name.endsWith('.json')) {
    data = JSON.parse(text)
  } else {
    // Archivo .js tipo "export const temporada1 = {...}; export default temporada1;"
    let cleaned = text
      .replace(/export\s+default\s+[a-zA-Z0-9_]+;?/g, '')
      .replace(/export\s+const\s+[a-zA-Z0-9_]+\s*=/, '')
      .trim()
      .replace(/;\s*$/, '')

    // eslint-disable-next-line no-new-func
    data = new Function('"use strict"; return (' + cleaned + ')')()
  }

  const list = Array.isArray(data)
    ? data
    : data.episodios || data.episodes || data.capitulos || []

  return list
    .map((ep) => ({
      number: ep.numero ?? ep.number ?? ep.num ?? null,
      title: ep.titulo ?? ep.title ?? ep.nombre ?? '',
    }))
    .filter((ep) => ep.title)
}
