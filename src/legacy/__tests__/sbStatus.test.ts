import { describe, it, expect, beforeEach } from 'vitest';
import { updateSbStatus, setSbMsg } from '../sbStatus.js';

const FIXTURE = `
  <div id="cloud-status-bar"></div>
  <span id="cloud-status-dot"></span>
  <span id="cloud-status-text"></span>
  <div id="sb-status"></div>
  <button id="sb-save-btn"></button>
  <button id="sb-load-btn"></button>
`;

describe('updateSbStatus', () => {
  beforeEach(() => {
    document.body.innerHTML = FIXTURE;
  });

  it('connected=true: dot 🟢, text "Cloud aktiv"', () => {
    updateSbStatus(true);
    expect(document.getElementById('cloud-status-dot')!.textContent).toBe('🟢');
    expect(document.getElementById('cloud-status-text')!.textContent).toContain('Cloud aktiv');
  });

  it('connected=true: bar bekommt sp-status--ok, andere weg', () => {
    const bar = document.getElementById('cloud-status-bar')!;
    bar.classList.add('sp-status--pending');
    updateSbStatus(true);
    expect(bar.classList.contains('sp-status--ok')).toBe(true);
    expect(bar.classList.contains('sp-status--pending')).toBe(false);
    expect(bar.classList.contains('sp-status--error')).toBe(false);
  });

  it('connected=false: dot 🔴, sp-status--error', () => {
    updateSbStatus(false);
    expect(document.getElementById('cloud-status-dot')!.textContent).toBe('🔴');
    const bar = document.getElementById('cloud-status-bar')!;
    expect(bar.classList.contains('sp-status--error')).toBe(true);
    expect(bar.classList.contains('sp-status--ok')).toBe(false);
  });

  it('connected=true: Save+Load-Buttons display=block', () => {
    updateSbStatus(true);
    expect((document.getElementById('sb-save-btn') as HTMLElement).style.display).toBe('block');
    expect((document.getElementById('sb-load-btn') as HTMLElement).style.display).toBe('block');
  });

  it('connected=false: Save+Load-Buttons display=none', () => {
    updateSbStatus(false);
    expect((document.getElementById('sb-save-btn') as HTMLElement).style.display).toBe('none');
    expect((document.getElementById('sb-load-btn') as HTMLElement).style.display).toBe('none');
  });

  it('connected=true: #sb-status grüne Farbe (rgb-Form wegen jsdom)', () => {
    updateSbStatus(true);
    // #4ade80 = rgb(74, 222, 128)
    expect((document.getElementById('sb-status') as HTMLElement).style.color).toBe(
      'rgb(74, 222, 128)',
    );
  });

  it('ohne #sb-status: no-op (kein Crash)', () => {
    document.body.innerHTML = '<div id="cloud-status-dot"></div><div id="cloud-status-text"></div>';
    expect(() => updateSbStatus(true)).not.toThrow();
  });
});

describe('setSbMsg', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="sb-status"></div>';
  });

  it('setzt Text und grüne Farbe bei type=g', () => {
    setSbMsg('Hi', 'g');
    const el = document.getElementById('sb-status') as HTMLElement;
    expect(el.textContent).toBe('Hi');
    expect(el.style.color).toBe('rgb(74, 222, 128)'); // #4ade80
  });

  it('rote Farbe bei type=r', () => {
    setSbMsg('Err', 'r');
    expect((document.getElementById('sb-status') as HTMLElement).style.color).toBe(
      'rgb(248, 113, 113)', // #f87171
    );
  });

  it('default-blau ohne type', () => {
    setSbMsg('Info');
    expect((document.getElementById('sb-status') as HTMLElement).style.color).toBe(
      'rgb(56, 189, 248)', // #38bdf8
    );
  });

  it('explicit type="b" → blau (default-äquivalent)', () => {
    setSbMsg('Mail gesendet', 'b');
    expect((document.getElementById('sb-status') as HTMLElement).style.color).toBe(
      'rgb(56, 189, 248)',
    );
  });

  it('ohne #sb-status: no-op', () => {
    document.body.innerHTML = '';
    expect(() => setSbMsg('test', 'g')).not.toThrow();
  });
});
