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
      // Post-Build: public/sw.js wird von Vite verbatim nach dist/sw.js
      // kopiert (kein Transform-Pipe). Deshalb hier nachträglich per
      // writeBundle-Hook den __APP_VERSION__-Platzhalter ersetzen, damit
      // der Service-Worker-Cache-Key mit jedem Release bumpt.
      async writeBundle(options) {
        const { readFile, writeFile, access } = await import('node:fs/promises');
        const { join } = await import('node:path');
        const outDir = options.dir || 'dist';
        const swPath = join(outDir, 'sw.js');
        try {
          await access(swPath);
          const contents = await readFile(swPath, 'utf8');
          if (contents.includes('__APP_VERSION__')) {
            await writeFile(swPath, contents.replace(/__APP_VERSION__/g, APP_VERSION), 'utf8');
          }
        } catch {
          // sw.js nicht da → kein Fehler, einfach nichts tun.
        }
      },
    },
  ],
});
