import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import pkg from './package.json' with { type: 'json' };

// Single source of truth für die App-Version: package.json. Wird an zwei
// Stellen injiziert:
//   - define.__APP_VERSION__  → global identifier in allen .js/.ts Files
//   - transformIndexHtml      → String-Replace von __APP_VERSION__ in
//                                index.html (define wirkt nicht auf HTML)
const APP_VERSION = pkg.version;

export default defineConfig({
  base: '/csc-raumplaner/',
  root: '.',
  publicDir: 'public',
  define: {
    __APP_VERSION__: JSON.stringify(APP_VERSION),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: 'index.html',
    },
  },
  plugins: [
    checker({ typescript: true }),
    {
      name: 'csc-version-html-inject',
      transformIndexHtml(html) {
        return html.replace(/__APP_VERSION__/g, APP_VERSION);
      },
    },
  ],
});
