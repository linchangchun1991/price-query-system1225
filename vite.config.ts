import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    root: '.',
    base: './',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', '@google/genai', 'lucide-react']
          }
        }
      }
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