import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the static build can be deployed under any path (hash routing, no server rewrites).
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5181 },
  build: { chunkSizeWarningLimit: 1500 },
});
