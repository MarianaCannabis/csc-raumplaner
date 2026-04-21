// P15 Loading-States — Button-Toggle-Helper.
//
// Wickelt einen Button während einer async-Operation in einen
// Loading-Zustand: disabled + innerHTML durch Spinner-Markup ersetzt,
// originales Markup in data-orig-html gesichert und nach finally
// wiederhergestellt — auch bei Exception.
//
// Nutzbar aus dem Legacy-index.html via window.cscLoadingState.wrap(btn, fn).
// TS-Side für sauberes Unit-Testing in jsdom.

export interface HasDisabled {
  disabled: boolean;
  innerHTML: string;
  setAttribute(name: string, value: string): void;
  getAttribute(name: string): string | null;
  removeAttribute(name: string): void;
}

const SPINNER_HTML = '<span class="spinner" aria-hidden="true"></span>';

/** Toggle element into loading state. Returns a restore-callback. */
export function beginLoading(el: HasDisabled, labelHtml = 'Lädt…'): () => void {
  if (el.getAttribute('data-orig-html') == null) {
    el.setAttribute('data-orig-html', el.innerHTML);
  }
  el.innerHTML = SPINNER_HTML + labelHtml;
  el.disabled = true;
  return () => endLoading(el);
}

/** Restore original markup + re-enable. Safe to call multiple times. */
export function endLoading(el: HasDisabled): void {
  const orig = el.getAttribute('data-orig-html');
  if (orig != null) {
    el.innerHTML = orig;
    el.removeAttribute('data-orig-html');
  }
  el.disabled = false;
}

/** Wrap an async function. Always restores state, even on throw. */
export async function wrapInSpinner<T>(
  el: HasDisabled,
  fn: () => Promise<T>,
  label?: string,
): Promise<T> {
  const restore = beginLoading(el, label);
  try {
    return await fn();
  } finally {
    restore();
  }
}
