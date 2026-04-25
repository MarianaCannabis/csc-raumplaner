/**
 * P17.3 — KI-Chat-Notification-Helpers, extrahiert aus index.html:8652-8698.
 *
 * - renderAIText: XSS-hardening + Markdown (strenge Tag-Whitelist).
 *   Schritt 1 escaped alle HTML-Entities; Schritt 2 matcht nur die
 *   Whitelist-Patterns. Eingeschleuste `<img onerror=...>` wird damit
 *   nie als Tag interpretiert.
 * - addMsg: appended Message-Element ins #ai-msgs-Panel.
 *   Returnt das DIV (oder no-op-Stub falls Panel fehlt).
 *
 * Pure DOM — keine Legacy-Globals außer document. Daher direktes
 * window-Binding in main.ts (kein Closure-Wrapper nötig).
 */

export type MsgType = 'user' | 'load' | 'ai' | 'sys';

export function renderAIText(text: unknown): string {
  const esc = String(text == null ? '' : text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  return (
    esc
      // Legacy-HTML-Tags die die KI evtl. noch sendet (nach Escape als &lt;b&gt;…)
      .replace(/&lt;b&gt;([^<]*?)&lt;\/b&gt;/g, '<strong>$1</strong>')
      .replace(/&lt;strong&gt;([^<]*?)&lt;\/strong&gt;/g, '<strong>$1</strong>')
      .replace(/&lt;i&gt;([^<]*?)&lt;\/i&gt;/g, '<em>$1</em>')
      .replace(/&lt;em&gt;([^<]*?)&lt;\/em&gt;/g, '<em>$1</em>')
      .replace(/&lt;code&gt;([^<]*?)&lt;\/code&gt;/g, '<code>$1</code>')
      .replace(/&lt;br\s*\/?&gt;/g, '<br>')
      // Markdown-Syntax (bevorzugt — s. System-Prompt-Hinweis)
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`\n]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>')
  );
}

export interface AddMsgStub {
  remove: () => void;
}

export function addMsg(text: string, type: MsgType): HTMLElement | AddMsgStub {
  const el = document.getElementById('ai-msgs');
  if (!el) return { remove: () => {} };
  const div = document.createElement('div');
  div.className =
    'amsg ' +
    (type === 'user' ? 'usr' : type === 'load' ? 'load' : type === 'ai' ? 'ai' : 'sys');
  if (type === 'ai') {
    // P0 XSS hardening + Markdown-Render: renderAIText escaped zuerst
    // alle HTML-Entities und wendet dann eine strenge Tag-Whitelist an
    // (<strong>, <em>, <code>, <br>). Beliebige HTML-Injection aus dem
    // KI-Output landet sicher als Text, nur Whitelist-Formatierung
    // wird gerendert.
    const lbl = document.createElement('div');
    lbl.className = 'ailbl';
    lbl.textContent = '🌿 KI-Assistent';
    div.appendChild(lbl);
    const body = document.createElement('div');
    body.innerHTML = renderAIText(text);
    body.style.whiteSpace = 'pre-wrap';
    div.appendChild(body);
  } else {
    div.textContent = text;
  }
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
  return div;
}
