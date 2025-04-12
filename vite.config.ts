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
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('error', (err) => {
            const currentPort = new URL(options.target).port;
            const nextPort = parseInt(currentPort) + 1;
            options.target = `http://localhost:${nextPort}`;
          });
        }
      }
    },
  },
});