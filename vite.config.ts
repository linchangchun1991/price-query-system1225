import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Force Vite to assume the current directory is the project root
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});