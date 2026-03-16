import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // permite acces la toate rutele fără 404
    fs: {
      strict: false
    }
  },
  build: {
    rollupOptions: {
      input: '/index.html'
    }
  },
  base: '/'
});