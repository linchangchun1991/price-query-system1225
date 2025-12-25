import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Explicitly set the root to the current directory to avoid /src lookup issues
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});