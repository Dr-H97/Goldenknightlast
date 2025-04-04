import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    },
    fs: {
      strict: false,
      allow: ['.']
    },
    hmr: {
      clientPort: 443,
      host: '0.0.0.0'
    },
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    // Allow all hosts for Replit environment
    strictPort: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020'
    }
  },
  build: {
    target: 'es2020'
  }
});
