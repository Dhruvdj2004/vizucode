import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Never ship source maps to production — the readable TS source stays private.
    sourcemap: false,
  },
  server: {
    proxy: {
      // Forward API calls to the Express server (npm run server).
      '/api': 'http://localhost:4000',
    },
  },
});
