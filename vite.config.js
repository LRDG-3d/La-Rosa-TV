import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base relativa: funciona sin importar el nombre exacto del repo o mayúsculas/minúsculas
export default defineConfig({
  plugins: [react()],
  base: './',
})
