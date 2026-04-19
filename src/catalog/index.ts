import type { CatalogItem } from './types.js';

// CSC-Primitive (P3.2a) — keine externen Assets erforderlich.
import { CSC_GROW } from './items/cscGrow.js';
import { CSC_DISPENSE } from './items/cscDispense.js';
import { CSC_SECURITY } from './items/cscSecurity.js';
import { FIRE_SAFETY } from './items/fireSafety.js';
import { DOORS } from './items/doors.js';
import { WINDOWS } from './items/windows.js';

// GLTF-basierte Kategorien (Kenney Furniture Kit 2.0 + Quaternius "Ultimate
// House Interior Pack" via poly.pizza, beides CC0).
import { CHAIRS } from './items/furnitureChairs.js';
import { TABLES } from './items/furnitureTables.js';
import { SOFAS } from './items/furnitureSofas.js';
import { KITCHEN } from './items/kitchen.js';
import { OFFICE } from './items/office.js';
import { SANITARY } from './items/sanitary.js';
import { PLANTS_DECO } from './items/plantsDeco.js';
import { LIGHTING } from './items/lighting.js';

export const NEW_CATALOG: CatalogItem[] = [
  ...CSC_GROW,
  ...CSC_DISPENSE,
  ...CSC_SECURITY,
  ...FIRE_SAFETY,
  ...DOORS,
  ...WINDOWS,
  ...CHAIRS,
  ...TABLES,
  ...SOFAS,
  ...KITCHEN,
  ...OFFICE,
  ...SANITARY,
  ...PLANTS_DECO,
  ...LIGHTING,
];
