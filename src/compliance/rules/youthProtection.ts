import { registerRule } from '../registry.js';

// Jugendschutz (18+): secured entrance object placed AND an organizational
// age-verification process documented in project meta. Both are required —
// a secured door alone doesn't verify age; a checkbox alone leaves entry
// to anyone passing through.
registerRule({
  id: 'youthProtection',
  label: 'Jugendschutz (18+) am Eingang',
  category: 'youth',
  severity: 'critical',
  check({ objects, meta }) {
    const hasSecureEntry = objects.some((o) => o.typeId === 'at-sec');
    const hasAgeProcess = meta?.ageVerification === true;
    if (hasSecureEntry && hasAgeProcess) {
      return { passed: true, details: 'Sicherheitseingang + Altersprüfung vorhanden' };
    }
    const missing: string[] = [];
    if (!hasSecureEntry) missing.push('Sicherheitseingang (typeId=at-sec)');
    if (!hasAgeProcess) missing.push('Altersprüfung-Checkbox im Projekt');
    return { passed: false, details: 'Fehlt: ' + missing.join(', ') };
  },
});
