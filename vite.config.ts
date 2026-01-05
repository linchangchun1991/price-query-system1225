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
        // Removed manualChunks for 'ai' to let Vite handle chunking automatically
        // This prevents build failure if resolution is tricky
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'lucide-react']
          }
        }
      }
    },
    // Polyfill process.env for GenAI SDK
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env': {} 
    },
    optimizeDeps: {
      include: ['@google/genai', 'react', 'react-dom', 'html2canvas']
    }
  };
});