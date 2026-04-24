import { describe, test, expect, beforeEach } from 'vitest';
import * as versions from '../versionHistory.js';

beforeEach(() => {
  localStorage.removeItem(versions.STORAGE_KEY);
});

describe('persist/versionHistory', () => {
  test('listVersions leer, wenn nichts gespeichert', () => {
    expect(versions.listVersions()).toEqual([]);
  });

  test('pushVersion prepends + persistiert', () => {
    versions.pushVersion({ rooms: [{ id: 'a' }] }, 'erste');
    const list = versions.listVersions();
    expect(list.length).toBe(1);
    expect(list[0]?.label).toBe('erste');
    expect(list[0]?.ts ?? 0).toBeGreaterThan(0);
  });

  test('neueste Version kommt nach vorne', () => {
    versions.pushVersion({}, 'alt');
    versions.pushVersion({}, 'neu');
    const list = versions.listVersions();
    expect(list[0]?.label).toBe('neu');
    expect(list[1]?.label).toBe('alt');
  });

  test('MAX_VERSIONS wird eingehalten (älteste fallen hinten raus)', () => {
    for (let i = 0; i < versions.MAX_VERSIONS + 3; i++) {
      versions.pushVersion({}, `v${i}`);
    }
    const list = versions.listVersions();
    expect(list.length).toBe(versions.MAX_VERSIONS);
    // Der neueste ist vorne — v(MAX+2)
    expect(list[0]?.label).toBe(`v${versions.MAX_VERSIONS + 2}`);
    // Der älteste im Buffer ist Index (MAX-1). v0, v1, v2 sind rausgefallen.
    expect(list[list.length - 1]?.label).toBe('v3');
  });

  test('removeVersion löscht den richtigen Eintrag', () => {
    versions.pushVersion({}, 'a');
    versions.pushVersion({}, 'b');
    versions.pushVersion({}, 'c');
    // Aktuell: [c, b, a]
    versions.removeVersion(1); // b raus
    const list = versions.listVersions();
    expect(list.map((v) => v.label)).toEqual(['c', 'a']);
    // Out-of-range: no-op
    versions.removeVersion(99);
    expect(versions.listVersions().length).toBe(2);
  });

  test('getVersion liefert null für out-of-range', () => {
    versions.pushVersion({}, 'a');
    expect(versions.getVersion(0)?.label).toBe('a');
    expect(versions.getVersion(5)).toBeNull();
  });

  test('listVersions toleriert defekten JSON (kein Crash)', () => {
    localStorage.setItem(versions.STORAGE_KEY, 'not-an-array');
    expect(versions.listVersions()).toEqual([]);
  });
});
