/**
 * Feature-Selbsttest (Mega-Sammel #11) — UI-getriggerter Health-Check.
 *
 * Komplementär zu `scripts/audit-features.mjs` (statisch, CI) und
 * `tests/e2e/feature-health.spec.ts` (Headless-Browser, CI). Diese Datei
 * läuft im LIVE-User-Browser und gibt eine sofort sichtbare 30-Sekunden-
 * Health-Übersicht statt manueller Smoke-Stunde.
 *
 * Ergebnis-Format als Plain-DOM, kein Modal — der Caller injektiert das
 * Result-HTML in einen Container im Settings-Panel.
 */

export interface SelfTestCheck {
  name: string;
  status: 'pass' | 'fail';
  detail?: string;
  error?: string;
}

export interface SelfTestResult {
  passed: number;
  failed: number;
  total: number;
  details: SelfTestCheck[];
}

interface RunCheckOptions {
  onChecking?: (name: string) => void;
}

type CheckFn = () => SelfTestCheck | Promise<SelfTestCheck>;

function checkBridges(): SelfTestCheck {
  const expected = [
    'cscCompliance', 'cscBauantrag', 'cscPricing', 'cscFloors',
    'cscStairs', 'cscBim', 'cscBimUI', 'cscOnboarding',
    'cscKCanG', 'cscStamp', 'cscTouch', 'cscConflictResolver',
  ];
  const w = window as unknown as Record<string, unknown>;
  const missing = expected.filter((n) => typeof w[n] === 'undefined');
  return {
    name: 'Window-Bridges',
    status: missing.length === 0 ? 'pass' : 'fail',
    detail: `${expected.length - missing.length}/${expected.length} bridges aktiv`,
    error: missing.length > 0 ? 'Fehlt: ' + missing.join(', ') : undefined,
  };
}

function checkCatalog(): SelfTestCheck {
  const w = window as unknown as { cscCatalog?: { newItems?: unknown[] } };
  const items = w.cscCatalog?.newItems ?? [];
  const stairs = items.filter((i) => (i as { type?: string }).type === 'stairs').length;
  // cscCatalog.newItems ist nur das TS-Subset — BUILTIN/ARCH kommen on-top
  // im inline-Script. Floor 150 für TS-Subset, 4+ Treppen.
  const ok = items.length >= 150 && stairs >= 4;
  return {
    name: 'Catalog',
    status: ok ? 'pass' : 'fail',
    detail: `${items.length} TS-items (${stairs} Treppen)`,
    error: !ok ? `${items.length} items / ${stairs} Treppen — erwartet ≥150 / ≥4` : undefined,
  };
}

function checkCompliance(): SelfTestCheck {
  const w = window as unknown as {
    cscCompliance?: {
      listRules?: () => unknown[];
      getRules?: () => unknown[];
      rules?: unknown[];
    };
  };
  const c = w.cscCompliance;
  let count = -1;
  if (typeof c?.listRules === 'function') count = c.listRules().length;
  else if (typeof c?.getRules === 'function') count = c.getRules().length;
  else if (Array.isArray(c?.rules)) count = c.rules.length;
  return {
    name: 'Compliance-Rules',
    status: count >= 25 ? 'pass' : 'fail',
    detail: count >= 0 ? `${count} Regeln` : 'API unklar',
    error: count < 25 ? `Nur ${count}/25 Regeln` : undefined,
  };
}

function checkModals(): SelfTestCheck {
  const expected = ['m-help', 'm-welcome', 'm-kcang-wizard', 'm-floor-manager'];
  const missing = expected.filter((id) => !document.getElementById(id));
  return {
    name: 'Modal-Templates',
    status: missing.length === 0 ? 'pass' : 'fail',
    detail: `${expected.length - missing.length}/${expected.length}`,
    error: missing.length > 0 ? 'Fehlt: ' + missing.join(', ') : undefined,
  };
}

function checkRightPanelTabs(): SelfTestCheck {
  const expected = ['ai', 'design', 'light', 'save', 'props', 'bim'];
  const missing = expected.filter((t) => !document.getElementById('rpanel-' + t));
  return {
    name: 'Right-Panel-Tabs',
    status: missing.length === 0 ? 'pass' : 'fail',
    detail: `${expected.length - missing.length}/${expected.length}`,
    error: missing.length > 0 ? 'Fehlt: ' + missing.join(', ') : undefined,
  };
}

function checkExporters(): SelfTestCheck {
  const w = window as unknown as Record<string, unknown>;
  const expected = ['exportToDxf', 'exportGLTF', 'exportToCsv'];
  const missing = expected.filter((fn) => typeof w[fn] !== 'function');
  return {
    name: 'Export-Funktionen',
    status: missing.length === 0 ? 'pass' : 'fail',
    detail: `${expected.length - missing.length}/${expected.length}`,
    error: missing.length > 0 ? 'Fehlt: ' + missing.join(', ') : undefined,
  };
}

function checkBimExport(): SelfTestCheck {
  const w = window as unknown as { cscBimUI?: { exportIfc?: () => Promise<void> } };
  const ok = typeof w.cscBimUI?.exportIfc === 'function';
  return {
    name: 'BIM-Export',
    status: ok ? 'pass' : 'fail',
    detail: ok ? 'cscBimUI.exportIfc verfügbar' : 'Bridge fehlt',
  };
}

const CHECKS: CheckFn[] = [
  checkBridges,
  checkCatalog,
  checkCompliance,
  checkModals,
  checkRightPanelTabs,
  checkExporters,
  checkBimExport,
];

export async function runSelfTest(opts: RunCheckOptions = {}): Promise<SelfTestResult> {
  const details: SelfTestCheck[] = [];
  for (const check of CHECKS) {
    try {
      opts.onChecking?.(check.name ?? '?');
      const r = await check();
      details.push(r);
    } catch (err) {
      details.push({
        name: (check as { name?: string }).name ?? 'unknown',
        status: 'fail',
        error: (err as Error).message,
      });
    }
  }
  const passed = details.filter((d) => d.status === 'pass').length;
  const failed = details.filter((d) => d.status === 'fail').length;
  return { passed, failed, total: details.length, details };
}

export function renderSelfTestResults(result: SelfTestResult): string {
  const head =
    `<div style="font-weight:700;font-size:13px;margin-bottom:6px">` +
    `🩺 Selbsttest: <span style="color:${result.failed === 0 ? 'var(--gr)' : 'var(--rd)'}">` +
    `${result.passed}/${result.total} ✅</span></div>`;
  const list = result.details.map((d) => {
    const icon = d.status === 'pass' ? '✅' : '❌';
    const color = d.status === 'pass' ? 'var(--tx2)' : 'var(--rd)';
    const detail = d.detail ? ` <span style="color:var(--tx3)">— ${escapeHtml(d.detail)}</span>` : '';
    const err = d.error ? `<div style="font-size:10px;color:var(--rd);margin-left:18px">${escapeHtml(d.error)}</div>` : '';
    return `<div style="font-size:11px;color:${color};padding:2px 0">${icon} ${escapeHtml(d.name)}${detail}${err}</div>`;
  }).join('');
  return head + '<div>' + list + '</div>';
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
