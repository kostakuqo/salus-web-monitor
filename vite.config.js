import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      strict: false
    },
    proxy: {
      // toate request-urile către /api vor fi redirecționate la backend-ul tău de pe 5000
      '/api': 'http://localhost:5000'
    }
  },
  build: {
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html')  // ← fix aici
    }
  },
  base: '/',
});