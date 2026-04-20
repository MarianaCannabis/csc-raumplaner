// P9.2 — Mini-i18n-Framework. Kein React-Dep, kein 30-KB-Lib.
//
// API:
//   import { t, setLang, LANG } from './i18n';
//   t('topbar.templates')            // 'Vorlagen'
//   t('topbar.templates', 'Fallback')// mit Fallback falls Key fehlt
//   setLang('en')                    // wechselt + persistiert + event
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

export type SupportedLang = 'de' | 'en' | 'nl' | 'es';

import de from './locales/de.json' with { type: 'json' };
import en from './locales/en.json' with { type: 'json' };
import nl from './locales/nl.json' with { type: 'json' };
import es from './locales/es.json' with { type: 'json' };

const DICT: Record<SupportedLang, Record<string, string>> = {
  de: de as Record<string, string>,
  en: en as Record<string, string>,
  nl: nl as Record<string, string>,
  es: es as Record<string, string>,
};

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
  return DICT[LANG]?.[key] ?? DICT.de[key] ?? fallback ?? key;
}

export function setLang(lang: SupportedLang): void {
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

// Set initial <html lang=> on import
try { document.documentElement.lang = LANG; } catch (e) {}
