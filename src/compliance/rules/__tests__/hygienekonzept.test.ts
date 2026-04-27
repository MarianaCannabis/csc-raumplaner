import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Rule } from '../../types.js';
import '../hygienekonzept.js';
import { listRules } from '../../registry.js';

const LS_KEY = 'csc-kcang-application';

function makeApp(overrides: Partial<{ haendewaschen: boolean; desinfektion: boolean;
  schaedlingsbekaempfung: boolean; abfallentsorgung: boolean; schulung_personal: boolean; }> = {}) {
  return {
    vereinsdaten: { name: '', adresse: '', mitgliederzahl: 0,
      praeventionsbeauftragter: { name: '', schulungsnachweis: '' } },
    raeume: [],
    compliance: { status: {}, notizen: '' },
    hygienekonzept: {
      haendewaschen: false, desinfektion: false, schaedlingsbekaempfung: false,
      abfallentsorgung: false, schulung_personal: false, notizen: '',
      ...overrides,
    },
    suchtberatung: { kontakt_name: '', kontakt_email: '', kontakt_telefon: '', konzept_text: '' },
    sicherheit: {
      brandschutz: { vorhanden: false, notizen: '' },
      notausgang: { vorhanden: false, notizen: '' },
      sichtschutz_p14: { vorhanden: false, notizen: '' },
      poi_distanz_p13: { bestaetigt: false, entfernung_m: 0 },
    },
    notizen: '',
    meta: { erstellt_am: '', geaendert_am: '', version: 1, cloud_sync: false },
  };
}

function getRule(): Rule {
  const r = listRules().find((x) => x.id === 'hygienekonzept');
  if (!r) throw new Error('hygienekonzept rule not registered');
  return r;
}

describe('hygienekonzept compliance rule', () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => { store[k] = v; },
      removeItem: (k: string) => { delete store[k]; },
      clear: () => { for (const k of Object.keys(store)) delete store[k]; },
    });
  });

  it('fails when wizard never opened', () => {
    const r = getRule().check({ rooms: [], objects: [] });
    expect(r.passed).toBe(false);
    expect(r.details).toMatch(/KCanG-Antrag/);
  });

  it('fails with detailed missing-list when partial', () => {
    localStorage.setItem(LS_KEY, JSON.stringify(makeApp({
      haendewaschen: true, desinfektion: true,
    })));
    const r = getRule().check({ rooms: [], objects: [] });
    expect(r.passed).toBe(false);
    expect(r.details).toContain('Schädlingsbekämpfung');
    expect(r.details).toContain('Abfallentsorgung');
    expect(r.details).toContain('Personalschulung');
  });

  it('passes when all 5 items checked', () => {
    localStorage.setItem(LS_KEY, JSON.stringify(makeApp({
      haendewaschen: true, desinfektion: true, schaedlingsbekaempfung: true,
      abfallentsorgung: true, schulung_personal: true,
    })));
    const r = getRule().check({ rooms: [], objects: [] });
    expect(r.passed).toBe(true);
    expect(r.details).toMatch(/5 Hygiene/);
  });

  it('fails on JSON parse error gracefully', () => {
    localStorage.setItem(LS_KEY, 'not-json');
    const r = getRule().check({ rooms: [], objects: [] });
    expect(r.passed).toBe(false);
  });
});
