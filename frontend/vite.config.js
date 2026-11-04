import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// El catálogo de validaciones vive en ../shared y lo comparten backend y frontend.
const shared = fileURLToPath(new URL('../shared', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@shared': shared } },
  server: {
    port: 5174,
    strictPort: true,
    host: '127.0.0.1',
    fs: { allow: [fileURLToPath(new URL('..', import.meta.url))] },
    proxy: {
      '/api': {
        target: process.env.ALTOKE_API_TARGET || 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
    },
  },
});
