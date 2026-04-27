import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Rule } from '../../types.js';
import '../suchtberatung.js';
import { listRules } from '../../registry.js';

const LS_KEY = 'csc-kcang-application';

function makeApp(overrides: Partial<{ kontakt_name: string; kontakt_email: string; kontakt_telefon: string; }> = {}) {
  return {
    vereinsdaten: { name: '', adresse: '', mitgliederzahl: 0,
      praeventionsbeauftragter: { name: '', schulungsnachweis: '' } },
    raeume: [],
    compliance: { status: {}, notizen: '' },
    hygienekonzept: {
      haendewaschen: false, desinfektion: false, schaedlingsbekaempfung: false,
      abfallentsorgung: false, schulung_personal: false, notizen: '',
    },
    suchtberatung: {
      kontakt_name: '', kontakt_email: '', kontakt_telefon: '', konzept_text: '',
      ...overrides,
    },
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
  const r = listRules().find((x) => x.id === 'suchtberatung');
  if (!r) throw new Error('suchtberatung rule not registered');
  return r;
}

describe('suchtberatung compliance rule', () => {
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

  it('fails when kontakt_name leer', () => {
    localStorage.setItem(LS_KEY, JSON.stringify(makeApp()));
    const r = getRule().check({ rooms: [], objects: [] });
    expect(r.passed).toBe(false);
    expect(r.details).toMatch(/Kontakt-Name/);
  });

  it('fails when name set but kein E-Mail/Telefon', () => {
    localStorage.setItem(LS_KEY, JSON.stringify(makeApp({ kontakt_name: 'Beratungsstelle X' })));
    const r = getRule().check({ rooms: [], objects: [] });
    expect(r.passed).toBe(false);
    expect(r.details).toMatch(/kein E-Mail\/Telefon/);
    expect(r.details).toContain('Beratungsstelle X');
  });

  it('passes mit Name + E-Mail', () => {
    localStorage.setItem(LS_KEY, JSON.stringify(makeApp({
      kontakt_name: 'Suchtberatung XY', kontakt_email: 'info@example.de',
    })));
    const r = getRule().check({ rooms: [], objects: [] });
    expect(r.passed).toBe(true);
    expect(r.details).toContain('Suchtberatung XY');
  });

  it('passes mit Name + Telefon', () => {
    localStorage.setItem(LS_KEY, JSON.stringify(makeApp({
      kontakt_name: 'Caritas', kontakt_telefon: '030-12345',
    })));
    const r = getRule().check({ rooms: [], objects: [] });
    expect(r.passed).toBe(true);
  });

  it('fails on JSON parse error gracefully', () => {
    localStorage.setItem(LS_KEY, 'not-json');
    const r = getRule().check({ rooms: [], objects: [] });
    expect(r.passed).toBe(false);
  });

  it('Metadata: category=member, severity=high, modes=[room]', () => {
    const r = getRule();
    expect(r.category).toBe('member');
    expect(r.severity).toBe('high');
    expect(r.modes).toEqual(['room']);
  });
});
