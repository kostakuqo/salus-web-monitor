import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/salus-web-monitor/',  // <--- foarte important
  plugins: [react()],
});