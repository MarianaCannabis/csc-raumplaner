import { describe, it, expect, beforeEach, vi } from 'vitest';
import { applyThemeIcon, toggleTheme, initTheme, setColorMode } from '../theme.js';

beforeEach(() => {
  document.documentElement.removeAttribute('data-theme');
  document.body.innerHTML = '<button id="theme-toggle"></button>';
  localStorage.clear();
});

describe('applyThemeIcon', () => {
  it('isLight=true → data-icon=sun', () => {
    applyThemeIcon(true);
    expect(document.getElementById('theme-toggle')!.getAttribute('data-icon')).toBe('sun');
  });

  it('isLight=false → data-icon=moon', () => {
    applyThemeIcon(false);
    expect(document.getElementById('theme-toggle')!.getAttribute('data-icon')).toBe('moon');
  });

  it('populateIcons callback wird gerufen wenn vorhanden', () => {
    const populateIcons = vi.fn();
    applyThemeIcon(true, { populateIcons });
    expect(populateIcons).toHaveBeenCalledOnce();
  });

  it('ohne #theme-toggle: no-op (kein crash)', () => {
    document.body.innerHTML = '';
    expect(() => applyThemeIcon(true)).not.toThrow();
  });
});

describe('toggleTheme', () => {
  it('dark → light: data-theme=light, localStorage=light, draw2D called', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    const draw2D = vi.fn();
    toggleTheme({ draw2D });
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('csc-theme')).toBe('light');
    expect(draw2D).toHaveBeenCalledOnce();
  });

  it('light → dark', () => {
    document.documentElement.setAttribute('data-theme', 'light');
    toggleTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('csc-theme')).toBe('dark');
  });

  it('initial-Cycle (kein data-theme): default zu light', () => {
    toggleTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('icon wird mit-getoggelt', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    toggleTheme();
    expect(document.getElementById('theme-toggle')!.getAttribute('data-icon')).toBe('sun');
  });
});

describe('initTheme', () => {
  it('localStorage=light → data-theme=light + sun-icon', () => {
    localStorage.setItem('csc-theme', 'light');
    initTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.getElementById('theme-toggle')!.getAttribute('data-icon')).toBe('sun');
  });

  it('localStorage=dark → data-theme=dark', () => {
    localStorage.setItem('csc-theme', 'dark');
    initTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('kein localStorage-Wert → default dark', () => {
    initTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});

describe('setColorMode', () => {
  beforeEach(() => {
    document.body.innerHTML = '<button id="btn-dark"></button><button id="btn-light"></button>';
  });

  it('dark=true: data-theme=dark, csc-darkmode=1, btn-dark active', () => {
    const setDarkMode = vi.fn();
    setColorMode(true, { setDarkMode });
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('csc-darkmode')).toBe('1');
    expect(setDarkMode).toHaveBeenCalledWith(true);
    expect(document.getElementById('btn-dark')!.className).toContain('mdl-btn--primary');
    expect(document.getElementById('btn-light')!.className).not.toContain('mdl-btn--primary');
  });

  it('dark=false: data-theme=light, csc-darkmode=0, btn-light active', () => {
    const setDarkMode = vi.fn();
    setColorMode(false, { setDarkMode });
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('csc-darkmode')).toBe('0');
    expect(setDarkMode).toHaveBeenCalledWith(false);
    expect(document.getElementById('btn-light')!.className).toContain('mdl-btn--primary');
  });
});
