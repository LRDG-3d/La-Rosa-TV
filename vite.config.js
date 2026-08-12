import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ⚠️ Cambia "la-rosa" por el nombre EXACTO de tu repositorio en GitHub
// (necesario para que las rutas de assets funcionen en GitHub Pages)
export default defineConfig({
  plugins: [react()],
  base: '/la-rosa/',
})
