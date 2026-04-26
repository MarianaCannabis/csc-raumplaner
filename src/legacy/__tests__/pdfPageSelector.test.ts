import { describe, it, expect, beforeEach } from 'vitest';
import { promptForPages, closeSelector, parseRange } from '../pdfPageSelector.js';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('parseRange', () => {
  it('"alle" → 1..N', () => {
    expect(parseRange('alle', 5)).toEqual({ pages: [1, 2, 3, 4, 5] });
    expect(parseRange('all', 3)).toEqual({ pages: [1, 2, 3] });
    expect(parseRange('*', 2)).toEqual({ pages: [1, 2] });
    expect(parseRange('', 4)).toEqual({ pages: [1, 2, 3, 4] });
  });

  it('Range "1-3" → [1,2,3]', () => {
    expect(parseRange('1-3', 5)).toEqual({ pages: [1, 2, 3] });
  });

  it('Liste "1,3,5" → [1,3,5]', () => {
    expect(parseRange('1,3,5', 5)).toEqual({ pages: [1, 3, 5] });
  });

  it('Mix "1-3,7" → [1,2,3,7]', () => {
    expect(parseRange('1-3,7', 10)).toEqual({ pages: [1, 2, 3, 7] });
  });

  it('Dedup + Sort: "5,2,3,2-4" → [2,3,4,5]', () => {
    expect(parseRange('5,2,3,2-4', 10)).toEqual({ pages: [2, 3, 4, 5] });
  });

  it('Out-of-range: error', () => {
    const r = parseRange('1-99', 5);
    expect('error' in r).toBe(true);
  });

  it('Invalid: error', () => {
    const r = parseRange('abc', 5);
    expect('error' in r).toBe(true);
  });
});

describe('promptForPages', () => {
  it('numPages=1 + threshold=1 → auto, kein Modal', async () => {
    const result = await promptForPages(1, { autoSelectThreshold: 1 });
    expect(result).toEqual([1]);
    expect(document.getElementById('m-pdf-page-selector')).toBeNull();
  });

  it('numPages=5 + threshold=1: Modal erscheint', async () => {
    const promise = promptForPages(5);
    expect(document.getElementById('m-pdf-page-selector')).not.toBeNull();
    expect(document.getElementById('pps-range')).not.toBeNull();
    expect(document.getElementById('pps-ok')).not.toBeNull();
    // Cleanup damit promise auflöst
    document.getElementById('pps-cancel')!.dispatchEvent(new MouseEvent('click'));
    await promise;
  });

  it('cancel-button → empty array', async () => {
    const promise = promptForPages(5);
    document.getElementById('pps-cancel')!.dispatchEvent(new MouseEvent('click'));
    const r = await promise;
    expect(r).toEqual([]);
    expect(document.getElementById('m-pdf-page-selector')).toBeNull();
  });

  it('ok-button + range "1-3" → [1,2,3]', async () => {
    const promise = promptForPages(5);
    const input = document.getElementById('pps-range') as HTMLInputElement;
    input.value = '1-3';
    document.getElementById('pps-ok')!.dispatchEvent(new MouseEvent('click'));
    const r = await promise;
    expect(r).toEqual([1, 2, 3]);
  });

  it('ok-button + invalid range → bleibt offen, error angezeigt', async () => {
    const promise = promptForPages(5);
    const input = document.getElementById('pps-range') as HTMLInputElement;
    input.value = '99';
    document.getElementById('pps-ok')!.dispatchEvent(new MouseEvent('click'));
    expect(document.getElementById('m-pdf-page-selector')).not.toBeNull();
    const errEl = document.getElementById('pps-error');
    expect(errEl?.textContent).toContain('außerhalb');
    // Cleanup für nächsten Test
    document.getElementById('pps-cancel')!.dispatchEvent(new MouseEvent('click'));
    await promise;
  });

  it('ESC-Key → empty array (cancel)', async () => {
    const promise = promptForPages(5);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    const r = await promise;
    expect(r).toEqual([]);
  });

  it('maxSelectablePages limit greift', async () => {
    const promise = promptForPages(20, { maxSelectablePages: 5 });
    const input = document.getElementById('pps-range') as HTMLInputElement;
    input.value = 'alle';
    document.getElementById('pps-ok')!.dispatchEvent(new MouseEvent('click'));
    const r = await promise;
    expect(r.length).toBe(5);
    expect(r).toEqual([1, 2, 3, 4, 5]);
  });
});
