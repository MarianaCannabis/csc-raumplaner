import { LS_KEY, type KCanGApplication } from '../../legacy/kcangWizard.js';

/** Reads the current KCanG-Wizard application from localStorage.
 *  Used by hygienekonzept + suchtberatung rules — no new field on
 *  ProjectMeta needed; wizard is single source of truth for Sections
 *  D + E. Returns null if wizard never opened or storage corrupt. */
export function getKCanGApp(): KCanGApplication | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as KCanGApplication) : null;
  } catch {
    return null;
  }
}
