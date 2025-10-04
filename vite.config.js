
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/p2p-nexus/',
  server: {
    port: 3000,
    host: true
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true
  },
  optimizeDeps: {
    exclude: ['ipfs-core']
  }
});
