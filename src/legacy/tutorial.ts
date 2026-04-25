/**
 * P17.18 — Tutorial-System extrahiert aus index.html:9651-9752.
 *
 * Step-basiertes Overlay-Tutorial mit optional zielmarkiertem Highlight
 * auf Topbar/Sidebar-Elementen. Module-internal _step-State + readonly
 * TUT_STEPS-Array.
 */

interface TutStep {
  target: string | null;
  title: string;
  text: string;
}

const TUT_STEPS: readonly TutStep[] = [
  {
    target: null,
    title: '🌿 Willkommen bei CSC Studio Pro',
    text:
      '<b>Der schnellste Weg zur eingerichteten Ausgabestelle:</b><br><br>' +
      '1️⃣ <b>Datei → "🤖 KI: Grundriss aus Foto"</b><br>' +
      '&nbsp;&nbsp;→ Grundriss-Foto oder PDF hochladen<br><br>' +
      '2️⃣ KI erkennt alle Räume automatisch (10–30 Sek.)<br><br>' +
      '3️⃣ <b>Rechtsklick auf Raum → Möbel auto-anordnen</b><br><br>' +
      '4️⃣ <b>Ansicht → Türen automatisch setzen</b><br><br>' +
      '✅ Fertige, eingerichtete Ausgabestelle!',
  },
  {
    target: null,
    title: '⬜ Alternativ: Räume selbst zeichnen',
    text:
      '<b>Kein Foto? Kein Problem:</b><br><br>' +
      '• <b>⬜ Raum zeichnen</b> → diagonal ziehen<br>' +
      '• <b>Quick-Rooms-Bar</b> über dem Grundriss: Empfang, Ausgabe, Lager mit einem Klick<br>' +
      '• <b>KI-Chat:</b> "Erstelle CSC mit Empfang 8×6m, Ausgabe 6×5m, Lager 5×4m"<br><br>' +
      '💡 Tipp: Rechtsklick auf Raum → Möbel auto-anordnen richtet jeden Raum passend ein!',
  },
  {
    target: '#left-panel',
    title: '🛋 Möbel & Katalog',
    text:
      'Linke Sidebar → 🛋 <b>Möbel</b><br><br>' +
      '• Kategorien anklicken zum Aufklappen<br>' +
      '• Suchfeld: z.B. "Sofa" oder "Kamera" tippen<br>' +
      '• Objekt klicken → Ghost-Preview folgt Maus → auf Plan platzieren<br><br>' +
      '🔒 <b>Sicherheit-Tab</b> → Kamera setzen → blaues Sichtfeld erscheint im Grundriss.',
  },
  {
    target: null,
    title: '🤖 KI-Assistent',
    text:
      'Rechts → 🤖 KI öffnen.<br><br>' +
      '<b>Beispiel-Befehle:</b><br>' +
      '• "Erstelle eine vollständige CSC-Ausgabestelle"<br>' +
      '• "Richte den Empfang mit Wartezone ein"<br>' +
      '• "Was fehlt für die KCanG-Anforderungen?"<br>' +
      '• "Mache eine 3D-Tour durch den Plan"<br><br>' +
      '📸 Oder Grundriss-Foto hochladen → KI analysiert und baut auf!',
  },
  {
    target: null,
    title: "✅ Los geht's!",
    text:
      '<b>Empfohlener Start:</b><br><br>' +
      '1. <b>Datei → KI: Grundriss aus Foto</b> — falls du einen Grundriss hast<br>' +
      '2. Oder: KI-Chat → "Erstelle CSC" für Schnellstart<br>' +
      '3. Oder: Quick-Rooms-Bar → Räume klicken<br><br>' +
      '📖 <b>❓ Hilfe</b> → "📸 Foto → Ausgabestelle" für die vollständige Anleitung.<br><br>' +
      '🌿 Viel Erfolg mit deinem Cannabis Social Club!',
  },
];

let _step = 0;

export interface TutorialDeps {
  closeHelp?: () => void;
}

export function startTutorial(deps: TutorialDeps = {}): void {
  if (deps.closeHelp) deps.closeHelp();
  _step = 0;
  const overlay = document.getElementById('tutorial-overlay');
  if (overlay) overlay.classList.add('active');
  renderTutStep();
}

export function endTutorial(): void {
  const overlay = document.getElementById('tutorial-overlay');
  if (overlay) overlay.classList.remove('active');
  const hl = document.getElementById('tut-highlight');
  if (hl) hl.style.display = 'none';
}

export function tutNav(dir: number): void {
  _step = Math.max(0, Math.min(TUT_STEPS.length - 1, _step + dir));
  if (_step >= TUT_STEPS.length) {
    endTutorial();
    return;
  }
  renderTutStep();
  if (_step === TUT_STEPS.length - 1) {
    const nxt = document.getElementById('tut-next');
    if (nxt) {
      nxt.textContent = '✓ Fertig';
      (nxt as HTMLButtonElement).onclick = endTutorial;
    }
  }
}

export function renderTutStep(): void {
  const step = TUT_STEPS[_step];
  if (!step) return;
  const progress = document.getElementById('tut-progress');
  const title = document.getElementById('tut-title');
  const text = document.getElementById('tut-text');
  const prev = document.getElementById('tut-prev');
  const next = document.getElementById('tut-next');
  if (progress) progress.textContent = _step + 1 + ' / ' + TUT_STEPS.length;
  if (title) title.textContent = step.title;
  if (text) text.textContent = step.text;
  if (prev) prev.style.display = _step > 0 ? 'block' : 'none';
  if (next) {
    next.textContent = _step < TUT_STEPS.length - 1 ? 'Weiter →' : '✓ Fertig';
    (next as HTMLButtonElement).onclick = () => tutNav(1);
  }

  const hl = document.getElementById('tut-highlight');
  const tt = document.getElementById('tut-tooltip');

  if (step.target) {
    const el = document.querySelector(step.target);
    if (el && hl && tt) {
      const r = el.getBoundingClientRect();
      hl.style.cssText =
        'display:block;left:' +
        (r.left - 4) +
        'px;top:' +
        (r.top - 4) +
        'px;width:' +
        (r.width + 8) +
        'px;height:' +
        (r.height + 8) +
        'px';
      const ttTop = r.bottom + 12 < window.innerHeight - 120 ? r.bottom + 12 : r.top - 140;
      tt.style.cssText =
        'display:block;left:' + Math.max(10, r.left) + 'px;top:' + ttTop + 'px';
    }
  } else {
    if (hl) hl.style.display = 'none';
    if (tt) tt.style.cssText = 'display:block;left:50%;top:50%;transform:translate(-50%,-50%)';
  }
}

/** Test-Helper. */
export function _resetForTests(): void {
  _step = 0;
}

export function _getCurrentStep(): number {
  return _step;
}

export const TUT_STEP_COUNT = TUT_STEPS.length;
