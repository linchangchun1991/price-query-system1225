import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 1. 安全地加载环境变量
  // 使用 (process as any).cwd() 绕过 TS 类型检查，确保在 Node 环境下正常运行
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    base: './', 
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
      commonjsOptions: {
        transformMixedEsModules: true, // 关键：允许混合模块转换，修复某些库的兼容性
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'lucide-react'],
            ai: ['@google/genai']
          }
        }
      }
    },
    // 2. 注入全局变量，Google GenAI SDK 需要读取 process.env.API_KEY
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env': {} // 防止其他库访问 process.env 报错
    },
    // 3. 强制预构建依赖，解决 ESM/CJS 互操作问题
    optimizeDeps: {
      include: ['@google/genai', 'react', 'react-dom', 'html2canvas']
    }
  };
});