import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// TĀVA — flagship demo. HMR is enabled by default in Vite; no backend server is
// required because every workflow in this project runs in the browser.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5183,
    host: true,
  },
  preview: {
    port: 4183,
    host: true,
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 700,
  },
});
