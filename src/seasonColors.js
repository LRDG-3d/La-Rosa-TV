// Paleta de gradientes por temporada (tema glass azul/rosa).
// Se puede sobreescribir desde Firebase en /seasonColors/{season} si quieres
// personalizar colores sin tocar el código (mismo patrón que LRDG_TV).
export const seasonColors = {
  1: { from: '#3E7BFA', to: '#FF5CA8' },
  2: { from: '#5FA8FF', to: '#FF8FC4' },
  3: { from: '#3E7BFA', to: '#FF8FC4' },
  default: { from: '#4C86FF', to: '#FF66B2' },
}

export function getSeasonGradient(season, overrides = {}) {
  const c = overrides[season] || seasonColors[season] || seasonColors.default
  return `linear-gradient(150deg, ${c.from}66, ${c.to}66)`
}
