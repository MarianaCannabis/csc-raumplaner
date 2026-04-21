import { describe, it, expect, beforeEach } from 'vitest';
import { beginLoading, endLoading, wrapInSpinner } from './loadingState.js';

describe('loadingState', () => {
  let btn: HTMLButtonElement;

  beforeEach(() => {
    btn = document.createElement('button');
    btn.innerHTML = '💾 Speichern';
    document.body.appendChild(btn);
  });

  it('beginLoading disables + replaces content + stores original', () => {
    beginLoading(btn, 'Speichern…');
    expect(btn.disabled).toBe(true);
    expect(btn.innerHTML).toContain('spinner');
    expect(btn.innerHTML).toContain('Speichern…');
    expect(btn.getAttribute('data-orig-html')).toBe('💾 Speichern');
  });

  it('endLoading restores original markup + re-enables', () => {
    beginLoading(btn, 'Warte…');
    endLoading(btn);
    expect(btn.disabled).toBe(false);
    expect(btn.innerHTML).toBe('💾 Speichern');
    expect(btn.getAttribute('data-orig-html')).toBe(null);
  });

  it('endLoading is idempotent when called without beginLoading', () => {
    expect(() => endLoading(btn)).not.toThrow();
    expect(btn.innerHTML).toBe('💾 Speichern');
    expect(btn.disabled).toBe(false);
  });

  it('wrapInSpinner restores even when fn throws', async () => {
    await expect(
      wrapInSpinner(btn, async () => {
        expect(btn.disabled).toBe(true);
        throw new Error('api-down');
      }),
    ).rejects.toThrow('api-down');
    expect(btn.disabled).toBe(false);
    expect(btn.innerHTML).toBe('💾 Speichern');
  });

  it('wrapInSpinner returns fn result', async () => {
    const result = await wrapInSpinner(btn, async () => 42);
    expect(result).toBe(42);
    expect(btn.disabled).toBe(false);
  });

  it('nested beginLoading calls do not corrupt original', () => {
    beginLoading(btn, 'outer');
    beginLoading(btn, 'inner');
    endLoading(btn);
    // After first restore the original should be back
    expect(btn.innerHTML).toBe('💾 Speichern');
  });
});
