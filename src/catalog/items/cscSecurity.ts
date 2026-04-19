import type { CatalogItem } from '../types.js';

// Ergänzende CSC-Sicherheitstechnik, die im Legacy-BUILTIN nicht vorkommt.
// Bewusst schmal: Doubletten zu sec-* Items werden vermieden.
export const CSC_SECURITY: CatalogItem[] = [
  { id: 'csc-safe-wand-klein', cat: '🔐 CSC-Sicherheit', icon: '🔒', name: 'Wandtresor klein (30×30×30)', w: 0.3, d: 0.3, h: 0.3, col: 0x1a1a1a, material: 'metal' },
  { id: 'csc-safe-stand-gr',   cat: '🔐 CSC-Sicherheit', icon: '🔒', name: 'Standtresor groß (90cm)',     w: 0.6, d: 0.5, h: 0.9, col: 0x222222, material: 'metal' },
  { id: 'csc-sec-schrank',     cat: '🔐 CSC-Sicherheit', icon: '🗄', name: 'Verschließbarer Sicherheitsschrank', w: 0.8, d: 0.5, h: 1.8, col: 0x2a2a2a, material: 'metal' },
];
