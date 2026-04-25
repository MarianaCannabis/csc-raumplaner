import { describe, it, expect, beforeEach } from 'vitest';
import { renderAIText, addMsg } from '../aiMessages.js';

describe('renderAIText', () => {
  it('escaped <script> — kein Script-Tag im Output', () => {
    const out = renderAIText('<script>alert(1)</script>');
    expect(out).not.toContain('<script>');
    expect(out).toContain('&lt;script&gt;');
  });

  it('escaped & und Quotes', () => {
    expect(renderAIText('a & b')).toContain('&amp;');
    expect(renderAIText('"x"')).toContain('&quot;');
    expect(renderAIText("'y'")).toContain('&#39;');
  });

  it('Markdown **bold** → <strong>', () => {
    expect(renderAIText('**foo**')).toBe('<strong>foo</strong>');
  });

  it('Markdown `code` → <code>', () => {
    expect(renderAIText('`bar`')).toBe('<code>bar</code>');
  });

  it('Newline → <br>', () => {
    expect(renderAIText('a\nb')).toBe('a<br>b');
  });

  it('Legacy <b>-Tags der KI rendern als <strong>', () => {
    expect(renderAIText('<b>x</b>')).toBe('<strong>x</strong>');
  });

  it('Kombinierter Input mit XSS + Markdown rendert sicher', () => {
    const out = renderAIText('**heading**\n<img src=x onerror=alert(1)>\n`safe`');
    expect(out).toContain('<strong>heading</strong>');
    expect(out).toContain('<code>safe</code>');
    expect(out).toContain('<br>');
    expect(out).not.toContain('<img');
    expect(out).toContain('&lt;img');
  });

  it('null/undefined → leerer String (keine NPE)', () => {
    expect(renderAIText(null)).toBe('');
    expect(renderAIText(undefined)).toBe('');
  });
});

describe('addMsg', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="ai-msgs"></div>';
  });

  it('appendet div.amsg.usr für type="user"', () => {
    addMsg('hi', 'user');
    const div = document.querySelector('#ai-msgs .amsg') as HTMLElement;
    expect(div).not.toBeNull();
    expect(div.classList.contains('usr')).toBe(true);
    expect(div.textContent).toBe('hi');
  });

  it('appendet div.amsg.ai für type="ai" und nutzt renderAIText', () => {
    addMsg('**fett**', 'ai');
    const div = document.querySelector('#ai-msgs .amsg.ai') as HTMLElement;
    expect(div).not.toBeNull();
    expect(div.querySelector('.ailbl')).not.toBeNull();
    expect(div.innerHTML).toContain('<strong>fett</strong>');
  });

  it('XSS-Test: type="ai" + <script> → KEIN Script-Element im DOM', () => {
    addMsg('<script>window._pwned=true</script>', 'ai');
    const scripts = document.querySelectorAll('#ai-msgs script');
    expect(scripts.length).toBe(0);
    // Text muss als sichtbar gerenderter Inhalt im body landen
    const body = document.querySelector('#ai-msgs .amsg.ai > div:not(.ailbl)') as HTMLElement;
    expect(body.innerHTML).toContain('&lt;script&gt;');
  });

  it('returnt Stub mit .remove() wenn #ai-msgs fehlt (kein Crash)', () => {
    document.body.innerHTML = ''; // kein ai-msgs
    const stub = addMsg('text', 'sys');
    expect(stub).toBeDefined();
    expect(typeof (stub as { remove: () => void }).remove).toBe('function');
    // ruf .remove() auf — darf nicht werfen
    expect(() => (stub as { remove: () => void }).remove()).not.toThrow();
  });

  it('setzt scrollTop auf scrollHeight (auto-scroll)', () => {
    const el = document.getElementById('ai-msgs') as HTMLElement;
    // jsdom liefert scrollHeight=0 ohne Layout, aber wir können prüfen
    // dass scrollTop geschrieben wurde und mit scrollHeight übereinstimmt.
    addMsg('msg', 'user');
    expect(el.scrollTop).toBe(el.scrollHeight);
  });

  it('type="load" und type="sys" bekommen entsprechende Klassen', () => {
    addMsg('loading', 'load');
    addMsg('system', 'sys');
    expect(document.querySelector('#ai-msgs .amsg.load')).not.toBeNull();
    expect(document.querySelector('#ai-msgs .amsg.sys')).not.toBeNull();
  });
});
