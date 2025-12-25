import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Ensure Vite looks for files in the current directory (flat structure)
  root: '.', 
  // Base path for asset URLs
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});