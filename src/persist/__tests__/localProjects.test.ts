import { describe, test, expect, beforeEach } from 'vitest';
import * as local from '../localProjects.js';

beforeEach(() => {
  localStorage.removeItem(local.STORAGE_KEY);
});

describe('persist/localProjects', () => {
  test('save + loadAll roundtrip', () => {
    const state = { rooms: [{ id: 'r1' }], objects: [] };
    const entry = local.saveProject('Mein Projekt', state);
    expect(entry.data).toEqual(state);
    expect(entry.at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    const all = local.loadAllSaved();
    expect(all['Mein Projekt']?.data).toEqual(state);
  });

  test('listSavedNames reflects entries', () => {
    local.saveProject('A', { rooms: [] });
    local.saveProject('B', { rooms: [] });
    expect(local.listSavedNames().sort()).toEqual(['A', 'B']);
  });

  test('deleteProject entfernt nur den spezifischen Key', () => {
    local.saveProject('A', { rooms: [] });
    local.saveProject('B', { rooms: [] });
    local.deleteProject('A');
    expect(local.listSavedNames()).toEqual(['B']);
    // No-op bei unbekanntem Namen — kein Crash
    local.deleteProject('doesnt-exist');
    expect(local.listSavedNames()).toEqual(['B']);
  });

  test('getProject liefert null für unbekannte Namen', () => {
    local.saveProject('A', { rooms: [{ id: 'r' }] });
    expect(local.getProject('A')?.data?.rooms).toEqual([{ id: 'r' }]);
    expect(local.getProject('nope')).toBeNull();
  });

  test('countExcluding zählt alle außer dem gegebenen Namen', () => {
    local.saveProject('A', {});
    local.saveProject('B', {});
    local.saveProject('C', {});
    expect(local.countExcluding('B')).toBe(2);
    expect(local.countExcluding('X')).toBe(3); // nicht-existent → alle zählen
  });

  test('loadAllSaved toleriert defekten JSON-Content (kein Crash)', () => {
    localStorage.setItem(local.STORAGE_KEY, '{not json');
    expect(local.loadAllSaved()).toEqual({});
  });
});
