import { describe, it, expect } from 'vitest';

// P13: Hard-invariant-Tests gegen den importierten Katalog. Läuft via
// Vitest in jsdom-Env; import.meta.env.BASE_URL ist per Vitest-Config
// stabil, daher können die Item-Files (die `import.meta.env.BASE_URL` für
// modelUrls nutzen) sauber importiert werden.
import { CHAIRS } from '../items/furnitureChairs.js';
import { TABLES } from '../items/furnitureTables.js';
import { SOFAS } from '../items/furnitureSofas.js';
import { KITCHEN } from '../items/kitchen.js';
import { SANITARY } from '../items/sanitary.js';
import { LIGHTING } from '../items/lighting.js';
import { OFFICE } from '../items/office.js';
import { DOORS } from '../items/doors.js';
import { WINDOWS } from '../items/windows.js';
import { PLANTS_DECO } from '../items/plantsDeco.js';
import { FIRE_SAFETY } from '../items/fireSafety.js';
import { CSC_GROW } from '../items/cscGrow.js';
import { CSC_SECURITY } from '../items/cscSecurity.js';
import { CSC_DISPENSE } from '../items/cscDispense.js';
import type { CatalogItem } from '../types.js';

// Deckt alle CatalogItem[]-Files ab. PrimitiveCatalogItem[]-Files
// (events, messe, primitives, cscExpansion) haben eine erweiterte Shape
// und werden separat geprüft falls nötig — hier geht es um den klassischen
// Möbel/CSC-Katalog.
const ALL_ITEMS: CatalogItem[] = [
  ...CHAIRS, ...TABLES, ...SOFAS, ...KITCHEN, ...SANITARY, ...LIGHTING,
  ...OFFICE, ...DOORS, ...WINDOWS, ...PLANTS_DECO, ...FIRE_SAFETY,
  ...CSC_GROW, ...CSC_SECURITY, ...CSC_DISPENSE,
];

describe('catalog — hard invariants', () => {
  it('has no duplicate ids across loaded categories', () => {
    const seen = new Map<string, string[]>();
    for (const it of ALL_ITEMS) {
      const arr = seen.get(it.id) ?? [];
      arr.push(it.name);
      seen.set(it.id, arr);
    }
    const dupes = [...seen.entries()].filter(([, names]) => names.length > 1);
    expect(dupes, `duplicate ids: ${JSON.stringify(dupes)}`).toEqual([]);
  });

  it('has no NaN / zero / negative dimensions', () => {
    const bad = ALL_ITEMS.filter((it) =>
      !Number.isFinite(it.w) || it.w <= 0 ||
      !Number.isFinite(it.d) || it.d <= 0 ||
      !Number.isFinite(it.h) || it.h <= 0,
    );
    expect(bad, `items with invalid dimensions: ${bad.map((i) => i.id).join(', ')}`).toEqual([]);
  });

  it('has no implausibly large items (>20 m on any axis)', () => {
    const huge = ALL_ITEMS.filter((it) => it.w > 20 || it.d > 20 || it.h > 20);
    expect(huge, `items > 20 m: ${huge.map((i) => `${i.id}(${i.w}×${i.d}×${i.h})`).join(', ')}`).toEqual([]);
  });

  it('every item has id, cat, name, icon', () => {
    const missing = ALL_ITEMS.filter((it) =>
      !it.id || !it.cat || !it.name || !it.icon,
    );
    expect(missing).toEqual([]);
  });

  it('id has no whitespace or uppercase', () => {
    const bad = ALL_ITEMS.filter((it) => /\s/.test(it.id) || /[A-Z]/.test(it.id));
    expect(bad, `ids with whitespace/uppercase: ${bad.map((i) => i.id).join(', ')}`).toEqual([]);
  });
});

describe('catalog — coverage per major category', () => {
  // Minimal-Erwartung: jede Basis-Möbelkategorie liefert mind. N Items.
  // Wenn eine Datei auf 0 fällt, sagt uns der Test dass eine Umstrukturierung
  // oder Export-Fehler stattgefunden hat.
  const EXPECTATIONS: Record<string, number> = {
    CHAIRS: 5,
    TABLES: 3,
    SOFAS: 3,
    DOORS: 3,
    WINDOWS: 2,
    LIGHTING: 3,
    PLANTS_DECO: 3,
    FIRE_SAFETY: 2,
    CSC_GROW: 3,
    CSC_SECURITY: 3,
    CSC_DISPENSE: 3,
  };
  const LOADED: Record<string, CatalogItem[]> = {
    CHAIRS, TABLES, SOFAS, DOORS, WINDOWS, LIGHTING, PLANTS_DECO, FIRE_SAFETY,
    CSC_GROW, CSC_SECURITY, CSC_DISPENSE,
  };

  it.each(Object.entries(EXPECTATIONS))(
    '%s has at least %i items',
    (name, min) => {
      // fix/e2e-green Bug D: noUncheckedIndexedAccess markierte `arr` als
      // möglicherweise undefined. Wir wissen dass name aus EXPECTATIONS kommt
      // und in LOADED existiert (siehe Record-Type oben), deshalb assertion.
      const arr = LOADED[name];
      expect(arr, `catalog ${name} must be loaded`).toBeDefined();
      expect(arr!.length).toBeGreaterThanOrEqual(min);
    },
  );
});
