import { describe, it, expect, beforeEach } from 'vitest';
import {
  updateAuthStatus,
  setGateState,
  updateLoginGate,
  _resetGateStateForTests,
  _getGateStateForTests,
  type AuthUIDeps,
} from '../authUI.js';

const FIXTURE = `
  <div id="auth-status"></div>
  <button id="auth-signin-btn"></button>
  <button id="auth-signout-btn"></button>
  <div id="login-gate" style="display:flex">
    <div id="gate-default" style="display:flex"></div>
    <div id="gate-awaiting" style="display:none"></div>
  </div>
`;

const loggedIn = (): AuthUIDeps => ({
  token: 'abc',
  user: { id: 'u1', email: 'a@b.de' },
});
const loggedOut = (): AuthUIDeps => ({ token: null, user: null });

describe('updateAuthStatus', () => {
  beforeEach(() => {
    document.body.innerHTML = FIXTURE;
    _resetGateStateForTests();
  });

  it('logged-in: ✅-Text + grün, sign-out-btn visible, sign-in-btn hidden', () => {
    updateAuthStatus(loggedIn());
    const el = document.getElementById('auth-status') as HTMLElement;
    expect(el.textContent).toContain('Eingeloggt als');
    expect(el.textContent).toContain('a@b.de');
    expect(el.style.color).toBe('rgb(74, 222, 128)'); // #4ade80
    expect((document.getElementById('auth-signin-btn') as HTMLElement).style.display).toBe('none');
    expect((document.getElementById('auth-signout-btn') as HTMLElement).style.display).toBe('block');
  });

  it('logged-out: 🔒-Text, sign-in-btn visible', () => {
    updateAuthStatus(loggedOut());
    expect(document.getElementById('auth-status')!.textContent).toContain('Nicht eingeloggt');
    expect((document.getElementById('auth-signin-btn') as HTMLElement).style.display).toBe('block');
    expect((document.getElementById('auth-signout-btn') as HTMLElement).style.display).toBe('none');
  });

  it('chained → ruft updateLoginGate (Gate-Visibility ändert sich)', () => {
    // Start: gate visible (display:flex). Nach login: hidden.
    updateAuthStatus(loggedIn());
    expect((document.getElementById('login-gate') as HTMLElement).style.display).toBe('none');
  });

  it('user.id Fallback wenn email fehlt', () => {
    updateAuthStatus({ token: 't', user: { id: 'fallback-id' } });
    expect(document.getElementById('auth-status')!.textContent).toContain('fallback-id');
  });
});

describe('updateLoginGate', () => {
  beforeEach(() => {
    document.body.innerHTML = FIXTURE;
    _resetGateStateForTests();
  });

  it('mit Token: gate display=none', () => {
    updateLoginGate(loggedIn());
    expect((document.getElementById('login-gate') as HTMLElement).style.display).toBe('none');
  });

  it('ohne Token: gate display=flex', () => {
    updateLoginGate(loggedOut());
    expect((document.getElementById('login-gate') as HTMLElement).style.display).toBe('flex');
  });

  it('e2eMode=true: immer hidden, egal ob Token', () => {
    updateLoginGate({ ...loggedOut(), e2eMode: true });
    expect((document.getElementById('login-gate') as HTMLElement).style.display).toBe('none');
    updateLoginGate({ ...loggedIn(), e2eMode: true });
    expect((document.getElementById('login-gate') as HTMLElement).style.display).toBe('none');
  });

  it('mit Token → setGateState("default") wird gerufen (Reset nach Login)', () => {
    setGateState('awaiting');
    expect(_getGateStateForTests()).toBe('awaiting');
    updateLoginGate(loggedIn());
    expect(_getGateStateForTests()).toBe('default');
  });

  it('ohne #login-gate: no-op (kein Crash)', () => {
    document.body.innerHTML = '';
    expect(() => updateLoginGate(loggedOut())).not.toThrow();
  });
});

describe('setGateState', () => {
  beforeEach(() => {
    document.body.innerHTML = FIXTURE;
    _resetGateStateForTests();
  });

  it("'awaiting': default hidden, awaiting flex", () => {
    setGateState('awaiting');
    expect((document.getElementById('gate-default') as HTMLElement).style.display).toBe('none');
    expect((document.getElementById('gate-awaiting') as HTMLElement).style.display).toBe('flex');
    expect(_getGateStateForTests()).toBe('awaiting');
  });

  it("'default': default flex, awaiting hidden", () => {
    setGateState('awaiting');
    setGateState('default');
    expect((document.getElementById('gate-default') as HTMLElement).style.display).toBe('flex');
    expect((document.getElementById('gate-awaiting') as HTMLElement).style.display).toBe('none');
  });
});
