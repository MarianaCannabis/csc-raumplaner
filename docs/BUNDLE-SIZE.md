# Bundle-Size-Doku

Stand v1.0.0 (2026-04-21) — aus `npm run build`-Output.

## Initial-Load (first paint)

| Chunk | Raw | Gzip |
|---|---:|---:|
| `index.html` (inline Legacy-JS) | 1.341 MB | **352 KB** |
| `index-*.js` (TS-Entry + catalogs) | 241 KB | **64 KB** |
| `three.module-*.js` (three r184) | 717 KB | **183 KB** |
| `GLTFLoader-*.js` (async) | 44 KB | **13 KB** |
| **Total initial** | ~2.3 MB | **~612 KB gz** |

## Beurteilung

- **Über dem 500-KB-Ziel.** Haupttreiber: `three.module` mit 183 KB gz
  (Three.js + Post-Processing), `index.html` mit 352 KB (enthält das
  21k-Line-Legacy-JS + alle UI-CSS).
- Legacy-Inline-JS könnte in ein separates Bundle extrahiert werden
  (Scope-sensitiv, da Three-Globals + module-type-Interplay).

## Optimierungs-Kandidaten (v1.1+)

| Maßnahme | Est. Einsparung | Aufwand |
|---|---|---|
| JPG→WebP für ambientCG-Texturen (~80 MB Assets) | -40% Asset-Download | niedrig |
| EffectComposer + UnrealBloomPass lazy-load | 15-20 KB gz | mittel |
| Legacy-Inline-JS in separates chunk | 50-100 KB gz auf nicht-index-routes | hoch |
| Catalog-Items lazy load per Kategorie | 5-10 KB gz | mittel |

## Nicht-Initial (on-demand)

- HDRI-Dateien (public/hdri/*.hdr): lazy-geladen
- ambientCG-Texturen (public/textures/**): lazy-geladen beim ersten
  Mesh-Render
- Kenney/Quaternius-GLBs (public/models/**): per GLTFLoader bei Bedarf
- Supabase-Auth-Endpoint: preconnect via `<link rel="preconnect">`
