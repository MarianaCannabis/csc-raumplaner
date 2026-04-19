import { registerRule } from '../registry.js';

// KCanG § 14: Sichtschutz. Betreiber-Vorgabe in diesem Projekt: ALLE
// Fenster mit Sichtschutzfolie ausgestattet. Das ist eine organisatorische
// Zusicherung — auf Geometrie-Ebene (pro Fenster ein separates Screening-
// Objekt im selben Raum) wird nicht geprüft. Wenn das Flag gesetzt ist und
// Fenster existieren, zählt die Regel als erfüllt.
//
// Window detection: legacy catalog prefixes (aw-*) plus generic
// window/fenster/schaufenster type-id matches, so the rule still fires
// if later catalog additions use freer naming.
const WINDOW_MATCH = /window|fenster|schaufenster|^aw-/i;

registerRule({
  id: 'visualScreen',
  label: 'Sichtschutz aller Fenster (§ 14 KCanG)',
  category: 'screen',
  severity: 'high',
  check({ objects, meta }) {
    const windows = objects.filter((o) => WINDOW_MATCH.test(String(o.typeId)));
    if (windows.length === 0) {
      return { passed: true, details: 'Keine Fenster im Grundriss' };
    }
    if (meta?.windowsFilmed === true) {
      return {
        passed: true,
        details: `${windows.length} Fenster laut Projekt-Meta foliert`,
      };
    }
    return {
      passed: false,
      details: `${windows.length} Fenster vorhanden — Projekt-Flag "Alle Fenster foliert" nicht gesetzt`,
    };
  },
});
