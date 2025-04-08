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
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      '/ws': {
        target: 'ws://localhost:3000',
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
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    // Allow all hosts for Replit environment
    strictPort: true,
    // Explicitly set allowed hosts
    allowedHosts: [
      // Replit hosts
      '770c0eb0-ea44-423a-bcae-0704eaf85366-00-3aex3huoublv2.worf.replit.dev', 
      'localhost', 
      '0.0.0.0', 
      '127.0.0.1', 
      '.repl.co', 
      '.replit.dev', 
      '.repl.run', 
      '.replit.app', 
      // Railway hosts
      '.railway.app',
      'chess-club-app.up.railway.app',
      'chess-club-app-production.up.railway.app',
      'chess-club-app.railway.app',
      'golden-knight-chess-club.up.railway.app',
      // Other hosts
      'b533dc8e9f4e'
    ]
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020'
    }
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: true,
    // Ensure relative paths work correctly
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  }
});
