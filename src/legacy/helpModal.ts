/**
 * P17.19 — Help-Modal-Family extrahiert aus index.html:9068, 9612-9626.
 *
 * Zwei separate Help-Systeme:
 * - openHelpModal: einfaches Modal #m-help via openM
 * - openHelp/closeHelp/showHelpPage: dedizierter #help-overlay mit
 *   Sub-Page-Navigation (active-class toggle)
 */

export interface OpenHelpModalDeps {
  openM: (id: string) => void;
}

export function openHelpModal(deps: OpenHelpModalDeps): void {
  deps.openM('m-help');
}

export function openHelp(page?: string): void {
  const overlay = document.getElementById('help-overlay');
  if (overlay) overlay.classList.add('open');
  showHelpPage(page || 'start');
}

export function closeHelp(): void {
  const overlay = document.getElementById('help-overlay');
  if (overlay) overlay.classList.remove('open');
}

export function showHelpPage(id: string): void {
  document.querySelectorAll('.help-page').forEach((p) => p.classList.remove('active'));
  document.querySelectorAll('.help-item').forEach((i) => i.classList.remove('active'));
  const page = document.getElementById('hp-' + id);
  if (page) page.classList.add('active');
  const item = document.querySelector('[data-page="' + id + '"]');
  if (item) {
    item.classList.add('active');
    // scrollIntoView fehlt in manchen Test-Environments (jsdom)
    if (typeof (item as HTMLElement).scrollIntoView === 'function') {
      (item as HTMLElement).scrollIntoView({ block: 'nearest' });
    }
  }
}
