// P9.2 — Mini-i18n-Framework. Kein React-Dep, kein 30-KB-Lib.
//
// API:
//   import { t, setLang, LANG } from './i18n';
//   t('topbar.templates')            // 'Vorlagen'
//   t('topbar.templates', 'Fallback')// mit Fallback falls Key fehlt
//   await setLang('en')              // wechselt + persistiert + event
//
// Events:
//   window.addEventListener('csc-lang-change', () => reRenderSidebars());
//
// Initial-Load: liest localStorage.csc-lang, fällt auf navigator.language,
// fällt auf 'de' zurück.
//
// Fehlt ein Key in der gewählten Sprache, fällt die Lookup-Chain auf:
//   current lang → 'de' → fallback-Argument → key-Name
// Damit kann EN unvollständig sein ohne UI-Bruch.
//
// Pfad B Sub-Task 2: Nur DE wird eager geladen (Default + Fallback). EN/NL/
// ES kommen via dynamic import bei `setLang()`. Beim Boot-Path mit
// preferred-non-DE wird das Locale fire-and-forget geladen, danach ein
// `csc-lang-change`-Event gefeuert. Bis dahin zeigt `t()` DE-Werte —
// kein Crash, nur kurzzeitig falsche Sprache.

export type SupportedLang = 'de' | 'en' | 'nl' | 'es';

import de from './locales/de.json' with { type: 'json' };

const DICT: Partial<Record<SupportedLang, Record<string, string>>> = {
  de: de as Record<string, string>,
};

async function loadLocale(lang: SupportedLang): Promise<Record<string, string>> {
  if (DICT[lang]) return DICT[lang]!;
  // Vite kennt JSON-Imports nativ — kein `with { type: 'json' }`-Attribute
  // nötig (das Attribute funktioniert im Build, bricht aber im dev-Server
  // mit Template-Literal-Import: SyntaxError beim direkten JSON-Serve).
  // Switch statt Template-Literal: explizite Imports werden von Vite
  // sicher zu separaten Chunks gesplittet.
  let mod: { default: Record<string, string> };
  switch (lang) {
    case 'en':
      mod = await import('./locales/en.json');
      break;
    case 'nl':
      mod = await import('./locales/nl.json');
      break;
    case 'es':
      mod = await import('./locales/es.json');
      break;
    case 'de':
      return DICT.de!;
  }
  DICT[lang] = mod.default as Record<string, string>;
  return DICT[lang]!;
}

function pickInitial(): SupportedLang {
  try {
    const stored = localStorage.getItem('csc-lang');
    if (stored && (stored === 'de' || stored === 'en' || stored === 'nl' || stored === 'es')) return stored;
  } catch (e) {}
  const nav = (navigator.language || 'de').slice(0, 2).toLowerCase();
  if (nav === 'en' || nav === 'nl' || nav === 'es') return nav as SupportedLang;
  return 'de';
}

export let LANG: SupportedLang = pickInitial();

export function t(key: string, fallback?: string): string {
  return DICT[LANG]?.[key] ?? DICT.de?.[key] ?? fallback ?? key;
}

export async function setLang(lang: SupportedLang): Promise<void> {
  if (!DICT[lang]) {
    try {
      await loadLocale(lang);
    } catch (e) {
      console.warn('[i18n] failed to load locale', lang, e);
      return;
    }
  }
  LANG = lang;
  try { localStorage.setItem('csc-lang', lang); } catch (e) {}
  document.documentElement.lang = lang;
  window.dispatchEvent(new Event('csc-lang-change'));
}

export function availableLanguages(): Array<{ code: SupportedLang; label: string; flag: string }> {
  return [
    { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
    { code: 'en', label: 'English',    flag: '🇬🇧' },
    { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
    { code: 'es', label: 'Español',    flag: '🇪🇸' },
  ];
}

// Set initial <html lang=> on import.
try { document.documentElement.lang = LANG; } catch (e) {}

// Boot-Lazy-Load: wenn der initial-pickte Sprache nicht DE ist, das Locale
// nachladen ohne den Boot zu blockieren. Sobald das Dictionary da ist,
// feuert ein `csc-lang-change`-Event, damit die UI mit den richtigen
// Übersetzungen re-rendert.
if (LANG !== 'de') {
  loadLocale(LANG)
    .then(() => {
      try { window.dispatchEvent(new Event('csc-lang-change')); } catch (e) {}
    })
    .catch((e) => {
      console.warn('[i18n] boot lazy-load failed', LANG, e);
      LANG = 'de';
    });
}
