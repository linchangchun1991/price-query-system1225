import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    base: './', // Use relative paths for assets
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
    },
    // Polyfill process.env for the Google GenAI SDK and app code
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env': {} // Fallback for other process.env accesses
    },
    // Force pre-bundling of the GenAI SDK to avoid CommonJS/ESM interop issues
    optimizeDeps: {
      include: ['@google/genai', 'react', 'react-dom']
    }
  };
});