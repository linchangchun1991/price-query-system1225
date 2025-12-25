import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Critical: Set root to current directory to support flat structure
  root: '.',
  // Resolve alias to ensure imports work smoothly
  resolve: {
    alias: {
      '@': '.',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
  }
});