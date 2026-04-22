import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import { readFileSync } from 'node:fs';
import pkg from './package.json' with { type: 'json' };

// Single source of truth für die App-Version: package.json. Wird an zwei
// Stellen injiziert:
//   - define.__APP_VERSION__  → global identifier in allen .js/.ts Files
//   - transformIndexHtml      → String-Replace von __APP_VERSION__ in
//                                index.html (define wirkt nicht auf HTML)
const APP_VERSION = pkg.version;

// P17: Catalog-Daten-Extraktion. BUILTIN + ARCH-Arrays werden aus
// data/*.json geladen und zur Build-Zeit in index.html injiziert — die
// Arrays sind 665 Zeilen Daten, die aus dem HTML-Monolith raus sollten.
// Runtime-Verhalten identisch: BUILTIN/ARCH bleiben synchron verfügbar
// beim Inline-Script-Execution, nur Source-Line-Count der index.html
// schrumpft. Die Arrays werden beim Build als kompaktes JSON-Literal
// injiziert (kein per-Element pretty-print, sonst bläht es wieder auf).
function loadCatalog(name: string) {
  return readFileSync(`./data/${name}.json`, 'utf8').trim();
}
const BUILTIN_JSON = loadCatalog('builtin');
const ARCH_JSON = loadCatalog('arch');

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
        return html
          .replace(/__APP_VERSION__/g, APP_VERSION)
          // P17: Catalog-Daten-Injection. Die Platzhalter sind valide JS-
          // Identifier, sodass index.html auch ohne Build direkt im Browser
          // loadable bliebe (für reine Preview-Zwecke zeigt die App dann
          // leere Arrays — kein Crash). Der Vite-dev-Server ersetzt sie
          // trotzdem wie im Prod-Build.
          .replace(/__CSC_BUILTIN_JSON__/g, BUILTIN_JSON)
          .replace(/__CSC_ARCH_JSON__/g, ARCH_JSON);
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
