import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/salus-web-monitor/',  // numele exact al repo-ului tău
  plugins: [react()],
})