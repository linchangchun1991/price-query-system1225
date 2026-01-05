import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    root: '.',
    base: './',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      // Removed manualChunks to let Vite handle chunking automatically
    },
    // Define process.env to avoid "process is not defined" in browser
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    optimizeDeps: {
      include: ['@google/genai']
    }
  };
});