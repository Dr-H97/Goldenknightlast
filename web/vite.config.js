import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  // Load env variables based on mode
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  
  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5000,
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        },
        '/ws': {
          target: process.env.VITE_BACKEND_WS_URL || 'ws://localhost:3000',
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
      strictPort: true,
      // Explicitly set allowed hosts
      allowedHosts: [
        // Development & Deployment hosts
        'localhost', 
        '0.0.0.0', 
        '127.0.0.1', 
        // Replit hosts
        '.repl.co', 
        '.replit.dev', 
        '.repl.run', 
        '.replit.app', 
        // Railway hosts
        '.railway.app',
        // Vercel hosts
        '.vercel.app',
        // Custom domains can go here
        'chess-club.vercel.app',
        'golden-knight-chess-club.vercel.app'
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
  };
});
