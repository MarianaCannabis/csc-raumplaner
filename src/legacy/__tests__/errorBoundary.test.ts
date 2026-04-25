import { describe, it, expect, beforeEach } from 'vitest';
import { showCrashModal, _resetCrashShownForTests } from '../errorBoundary.js';

describe('errorBoundary.showCrashModal', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    _resetCrashShownForTests();
  });

  it('appendet ein Modal-Div in document.body', () => {
    showCrashModal('Boom');
    const overlay = document.body.querySelector('.csc-crash-overlay');
    expect(overlay).not.toBeNull();
  });

  it('Modal enthält die sanitized message (kein < oder > durchgelassen)', () => {
    showCrashModal('<script>alert(1)</script>');
    const pre = document.body.querySelector('pre');
    expect(pre).not.toBeNull();
    // nach replace(/[<>]/g, '') bleibt: scriptalert(1)/script
    expect(pre!.textContent).not.toContain('<');
    expect(pre!.textContent).not.toContain('>');
    expect(pre!.textContent).toContain('script');
  });

  it('Modal hat "Schließen" und "Neu laden" Buttons', () => {
    showCrashModal('test');
    const buttons = document.body.querySelectorAll('button');
    expect(buttons.length).toBe(2);
    const labels = Array.from(buttons).map((b) => b.textContent);
    expect(labels).toContain('Schließen');
    expect(labels).toContain('Neu laden');
  });

  it('Multiple Calls → nur ein Modal (Idempotenz via _crashShown)', () => {
    showCrashModal('first');
    showCrashModal('second');
    showCrashModal('third');
    const modals = document.body.querySelectorAll('.csc-crash-overlay');
    expect(modals.length).toBe(1);
    // erste Message ist gewinnt
    expect(document.body.querySelector('pre')!.textContent).toContain('first');
  });

  it('_resetCrashShownForTests + zweiter Call → zweites Modal möglich', () => {
    showCrashModal('a');
    _resetCrashShownForTests();
    document.body.innerHTML = ''; // erstes Modal entfernen für isolation
    showCrashModal('b');
    const pre = document.body.querySelector('pre');
    expect(pre!.textContent).toContain('b');
  });

  it('Empty/null/undefined msg → "(unbekannt)" Fallback', () => {
    showCrashModal(null);
    expect(document.body.querySelector('pre')!.textContent).toBe('(unbekannt)');

    document.body.innerHTML = '';
    _resetCrashShownForTests();
    showCrashModal(undefined);
    expect(document.body.querySelector('pre')!.textContent).toBe('(unbekannt)');

    document.body.innerHTML = '';
    _resetCrashShownForTests();
    showCrashModal('');
    expect(document.body.querySelector('pre')!.textContent).toBe('(unbekannt)');
  });

  it('Schließen-Button-onclick entfernt den inneren Modal-Inhalt', () => {
    showCrashModal('test');
    expect(document.body.querySelector('.csc-crash-overlay')).not.toBeNull();
    expect(document.body.querySelector('h2')).not.toBeNull();
    const closeBtn = Array.from(document.body.querySelectorAll('button')).find(
      (b) => b.textContent === 'Schließen',
    ) as HTMLButtonElement;
    closeBtn.click();
    // Legacy-Verhalten 1:1: this.closest('div').parentNode.remove() entfernt
    // den inner-content-div (mit h2/p/buttons), das overlay bleibt visuell
    // leer aber im DOM. Minimaler Footprint, kein User-Sichtbarer Unterschied.
    expect(document.body.querySelector('h2')).toBeNull();
  });
});
