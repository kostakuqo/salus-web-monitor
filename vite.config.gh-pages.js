import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      strict: false
    }
  },
  build: {
    rollupOptions: {
      input: new URL('./index.html', import.meta.url).pathname
    }
  },
  base: '/salus-web-monitor/',
});