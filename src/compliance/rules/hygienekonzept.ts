import { registerRule } from '../registry.js';
import { getKCanGApp } from './_kcangData.js';

// KCanG § 14 i.V.m. Hygiene-Verordnungen: das Hygienekonzept
// (Händewaschen, Flächendesinfektion, Schädlingsbekämpfung,
// Abfallentsorgung, Personalschulung) muss vor Aufnahme der
// Abgabe-Tätigkeit dokumentiert sein. Erfasst im KCanG-Wizard
// Section D — die Regel prüft Vollständigkeit der 5 Check-Items.
registerRule({
  id: 'hygienekonzept',
  label: 'Hygienekonzept dokumentiert (KCanG § 14 + Hygiene-VO)',
  category: 'member',
  severity: 'high',
  modes: ['room'],
  check() {
    const app = getKCanGApp();
    if (!app) return { passed: false, details: 'KCanG-Antrag noch nicht angelegt' };
    const h = app.hygienekonzept;
    const items: Array<[boolean, string]> = [
      [h.haendewaschen,          'Händewaschmöglichkeit'],
      [h.desinfektion,           'Flächendesinfektion'],
      [h.schaedlingsbekaempfung, 'Schädlingsbekämpfung'],
      [h.abfallentsorgung,       'Abfallentsorgung'],
      [h.schulung_personal,      'Personalschulung'],
    ];
    const missing = items.filter(([ok]) => !ok).map(([, lbl]) => lbl);
    if (missing.length === 0) {
      return { passed: true, details: 'Alle 5 Hygiene-Items dokumentiert' };
    }
    return { passed: false, details: `Fehlt: ${missing.join(', ')}` };
  },
});
