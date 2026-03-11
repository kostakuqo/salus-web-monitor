import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/salus-web-monitor/',  // numele exact al repository-ului tău
  plugins: [react()],
})