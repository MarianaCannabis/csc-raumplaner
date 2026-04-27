import { registerRule } from '../registry.js';
import { getKCanGApp } from './_kcangData.js';

// KCanG § 23: jeder CSC muss eine Suchtberatungsstelle benennen, an
// die Mitglieder bei Verdacht auf problematischen Konsum vermittelt
// werden. Erfasst im KCanG-Wizard Section E. Pflichtfelder:
// Kontakt-Name + min. ein Kanal (E-Mail oder Telefon).
registerRule({
  id: 'suchtberatung',
  label: 'Suchtberatungsstelle benannt (§ 23 KCanG)',
  category: 'member',
  severity: 'high',
  modes: ['room'],
  check() {
    const app = getKCanGApp();
    if (!app) return { passed: false, details: 'KCanG-Antrag noch nicht angelegt' };
    const s = app.suchtberatung;
    const name = s.kontakt_name.trim();
    if (!name) return { passed: false, details: 'Kein Kontakt-Name eingetragen' };
    const hasContact = s.kontakt_email.trim() || s.kontakt_telefon.trim();
    if (!hasContact) {
      return { passed: false, details: `${name} eingetragen, aber kein E-Mail/Telefon` };
    }
    return { passed: true, details: `Eingetragen: ${name}` };
  },
});
