import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Use process.cwd() to get the root directory.
  // Fix: Cast process to any to avoid "Property 'cwd' does not exist on type 'Process'"
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    base: './', 
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
      rollupOptions: {
        // Ensure we do NOT treat @google/genai as external, we want it bundled.
      }
    },
    // Polyfill process.env
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Prevent crash if code accesses process.env elsewhere
      'process.env': {} 
    },
    // Explicitly include the SDK in optimization to handle ESM/CJS interop
    optimizeDeps: {
      include: ['@google/genai', 'react', 'react-dom']
    }
  };
});