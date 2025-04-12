import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
    proxy: {
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/content': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/users': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/roles': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/settings': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/search': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/interactions': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    },
  },
});