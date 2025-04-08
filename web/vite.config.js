import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    proxy: {
      '/api': {
        target: 'http://0.0.0.0:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      '/ws': {
        target: 'ws://0.0.0.0:3000',
        ws: true,
        changeOrigin: true,
        secure: false
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
    watch: {
      usePolling: true,
      interval: 1000,
    },
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    // Allow all hosts for Replit environment
    strictPort: false,
    // Allow all hosts access for Replit
    allowedHosts: [
      'localhost', 
      '0.0.0.0', 
      '127.0.0.1', 
      '.repl.co', 
      '.replit.dev', 
      '.repl.run', 
      '.replit.app', 
      '5f081c2efe38', 
      '770c0eb0-ea44-423a-bcae-0704eaf85366-00-3aex3huoublv2.worf.replit.dev'
    ]
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
