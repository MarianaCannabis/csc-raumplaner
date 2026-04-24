import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import * as autosave from '../autosave.js';

beforeEach(() => {
  localStorage.removeItem(autosave.STORAGE_KEY);
  localStorage.removeItem(autosave.TS_KEY);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('persist/autosave', () => {
  test('readAutosave liefert null, wenn kein Record da', () => {
    expect(autosave.readAutosave()).toBeNull();
  });

  test('writeAutosave + readAutosave roundtrip (ProjectState)', () => {
    const state = { rooms: [{ id: 'a' }, { id: 'b' }] };
    autosave.writeAutosave(state);
    const record = autosave.readAutosave();
    expect(record).not.toBeNull();
    expect(record?.saved).toBe(JSON.stringify(state));
    expect(record?.roomCount).toBe(2);
    expect(record?.ts).toBeGreaterThan(0);
  });

  test('writeAutosave akzeptiert bereits-serialisierten String', () => {
    const json = JSON.stringify({ rooms: [] });
    autosave.writeAutosave(json);
    expect(autosave.readAutosave()?.saved).toBe(json);
  });

  test('stale Records (> MAX_AGE_MS) werden als null behandelt', () => {
    autosave.writeAutosave({ rooms: [] });
    // TS-Key manuell in die Vergangenheit schieben
    const oldTs = Date.now() - autosave.MAX_AGE_MS - 1000;
    localStorage.setItem(autosave.TS_KEY, String(oldTs));
    expect(autosave.readAutosave()).toBeNull();
  });

  test('clearAutosave entfernt beide Keys', () => {
    autosave.writeAutosave({ rooms: [] });
    expect(localStorage.getItem(autosave.STORAGE_KEY)).not.toBeNull();
    autosave.clearAutosave();
    expect(localStorage.getItem(autosave.STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(autosave.TS_KEY)).toBeNull();
  });

  test('roomCount bleibt undefined bei defektem JSON-Blob', () => {
    localStorage.setItem(autosave.STORAGE_KEY, '{not json');
    localStorage.setItem(autosave.TS_KEY, String(Date.now()));
    const record = autosave.readAutosave();
    expect(record).not.toBeNull();
    expect(record?.roomCount).toBeUndefined();
  });
});
