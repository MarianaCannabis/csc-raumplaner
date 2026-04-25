import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { toast } from '../toast.js';

describe('toast', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('appends a div.toast.<type> with the message', () => {
    toast('Hallo', 'g');
    const el = document.body.querySelector('.toast.g') as HTMLElement;
    expect(el).not.toBeNull();
    expect(el.textContent).toBe('Hallo');
  });

  it('defaults to type "g" when not specified', () => {
    toast('Default');
    expect(document.body.querySelector('.toast.g')).not.toBeNull();
  });

  it('starts fade after 2300ms and removes after 2650ms', () => {
    toast('Bye', 'r');
    const el = document.body.querySelector('.toast.r') as HTMLElement;
    expect(el).not.toBeNull();

    vi.advanceTimersByTime(2299);
    expect(el.style.opacity).toBe('');
    vi.advanceTimersByTime(1);
    expect(el.style.opacity).toBe('0');
    vi.advanceTimersByTime(349);
    expect(document.body.querySelector('.toast.r')).not.toBeNull();
    vi.advanceTimersByTime(1);
    expect(document.body.querySelector('.toast.r')).toBeNull();
  });
});
