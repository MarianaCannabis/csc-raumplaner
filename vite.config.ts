import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';

export default defineConfig({
  base: '/csc-raumplaner/',
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: 'index.html',
    },
  },
  plugins: [checker({ typescript: true })],
});
