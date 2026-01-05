import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Safe process.cwd() access for Node environment
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    base: './', 
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        // CRITICAL FIX: Tell Vite NOT to bundle this package.
        // It will be resolved at runtime via the importmap in index.html.
        external: ['@google/genai'],
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'lucide-react']
          },
          // Optional: Global variable fallback if not using ESM (not strictly needed for esm.sh but good practice)
          globals: {
            '@google/genai': 'GoogleGenAI'
          }
        }
      }
    },
    // Polyfill process.env for the application code
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env': {} 
    },
    optimizeDeps: {
      // Exclude genai from pre-bundling since we are loading it from CDN
      exclude: ['@google/genai'],
      include: ['react', 'react-dom', 'html2canvas']
    }
  };
});