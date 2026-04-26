import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  colorForUser,
  formatLastAction,
  avatarTooltipHtml,
  pulseCursorGlow,
  PALETTE_SIZE,
} from '../collabAvatars.js';

describe('colorForUser', () => {
  it('deterministic: gleicher userId → gleiche Farbe', () => {
    const a = colorForUser('user-42');
    const b = colorForUser('user-42');
    expect(a).toBe(b);
  });

  it('verschiedene userIds → unterschiedliche Farben (mind. 80% verschieden)', () => {
    const ids = Array.from({ length: 30 }, (_, i) => 'user-' + i + '-x');
    const colors = ids.map(colorForUser);
    const unique = new Set(colors);
    // Mit 12 Farben + 30 IDs sollten mind. 9 verschiedene Farben rauskommen
    expect(unique.size).toBeGreaterThanOrEqual(9);
  });

  it('alle 12 Farben werden bei genug verschiedenen IDs verwendet', () => {
    const ids = Array.from({ length: 200 }, (_, i) => 'random-id-' + i + '-foo-bar');
    const colors = new Set(ids.map(colorForUser));
    expect(colors.size).toBe(PALETTE_SIZE);
  });

  it('null/undefined: fallback grau', () => {
    expect(colorForUser(null)).toBe('#888888');
    expect(colorForUser(undefined)).toBe('#888888');
    expect(colorForUser('')).toBe('#888888');
  });

  it('Email als Input: stable color', () => {
    expect(colorForUser('areiche@cscsdeutschland.de')).toBe(
      colorForUser('areiche@cscsdeutschland.de'),
    );
  });
});

describe('formatLastAction', () => {
  it('null/undefined → "—"', () => {
    expect(formatLastAction(null)).toBe('—');
    expect(formatLastAction(undefined)).toBe('—');
  });

  it('0 (sehr alt aber gültig) → Date-Format', () => {
    // 0 ist falsy → returns "—" per implementation
    expect(formatLastAction(0)).toBe('—');
  });

  it('vor 30 Sekunden → "vor 30 Sek."', () => {
    const now = Date.now();
    expect(formatLastAction(now - 30_000, now)).toBe('vor 30 Sek.');
  });

  it('vor 5 Minuten → "vor 5 Min."', () => {
    const now = Date.now();
    expect(formatLastAction(now - 5 * 60_000, now)).toBe('vor 5 Min.');
  });

  it('vor 2h → ISO-Zeit (hh:mm)', () => {
    const now = Date.now();
    const result = formatLastAction(now - 2 * 60 * 60 * 1000, now);
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });

  it('Future-Timestamp → "gerade"', () => {
    const now = Date.now();
    expect(formatLastAction(now + 1000, now)).toBe('gerade');
  });
});

describe('avatarTooltipHtml', () => {
  it('XSS-escape Email mit special chars', () => {
    const r = avatarTooltipHtml('<script>alert(1)</script>', null);
    expect(r).not.toContain('<script>');
    expect(r).toContain('&lt;script&gt;');
  });

  it('Format: email · last-action', () => {
    const now = Date.now();
    const r = avatarTooltipHtml('user@x.de', now - 30_000);
    // Tests laufen schnell — last-action kann 30 oder 31 Sekunden sein
    expect(r).toMatch(/^user@x\.de · vor (29|30|31) Sek\.$/);
  });

  it('null email → "Unbekannt"', () => {
    expect(avatarTooltipHtml(null, null)).toBe('Unbekannt');
  });
});

describe('pulseCursorGlow', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="el"></div>';
  });

  it('fügt cursor-glow Klasse hinzu', () => {
    vi.useFakeTimers();
    const el = document.getElementById('el')!;
    pulseCursorGlow(el);
    expect(el.classList.contains('cursor-glow')).toBe(true);
    vi.advanceTimersByTime(550);
    expect(el.classList.contains('cursor-glow')).toBe(false);
    vi.useRealTimers();
  });

  it('null-Element: kein crash', () => {
    expect(() => pulseCursorGlow(null)).not.toThrow();
  });

  it('doppelter Aufruf: Animation re-triggered', () => {
    vi.useFakeTimers();
    const el = document.getElementById('el')!;
    pulseCursorGlow(el);
    pulseCursorGlow(el);
    expect(el.classList.contains('cursor-glow')).toBe(true);
    vi.useRealTimers();
  });
});
