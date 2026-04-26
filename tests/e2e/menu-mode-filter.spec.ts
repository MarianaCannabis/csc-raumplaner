// Mega-Sammel ACBD #6 — Menu-Mode-Filter Regression-Schutz.
//
// Items mit data-mode="room" werden im event-Mode versteckt (und vice versa)
// wenn der Filter aktiviert ist. data-mode="both" bleibt immer sichtbar.
import { test, expect } from './_fixtures.js';

test.setTimeout(60_000);

test.describe('Menu-Mode-Filter (ACBD #6)', () => {
  test('Filter off (Default): alle Items sichtbar', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);
    await page.evaluate(() => localStorage.setItem('csc-mode-filter', '0'));
    await page.evaluate(() =>
      (window as unknown as { applyMenuModeFilter: () => void }).applyMenuModeFilter(),
    );
    const stats = await page.evaluate(() => {
      const items = document.querySelectorAll<HTMLElement>('.tbm-item[data-mode]');
      let visible = 0;
      let hidden = 0;
      items.forEach((el) => {
        if (el.style.display === 'none') hidden++;
        else visible++;
      });
      return { total: items.length, visible, hidden };
    });
    // 158 vor Sammel-ACBD + 1 für den Toggle-Item selbst = 159+
    expect(stats.total).toBeGreaterThanOrEqual(158);
    expect(stats.hidden).toBe(0);
  });

  test('Filter on + planningMode=room: room-Items + both sichtbar, event hidden', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      localStorage.setItem('csc-mode-filter', '1');
      document.body.dataset.planningMode = 'room';
    });
    await page.evaluate(() =>
      (window as unknown as { applyMenuModeFilter: () => void }).applyMenuModeFilter(),
    );
    const stats = await page.evaluate(() => {
      const items = document.querySelectorAll<HTMLElement>('.tbm-item[data-mode]');
      const result = { both: 0, room: 0, event: 0, hiddenEvent: 0, visibleRoom: 0, visibleBoth: 0 };
      items.forEach((el) => {
        const m = el.dataset.mode;
        if (m === 'both') result.both++;
        if (m === 'room') result.room++;
        if (m === 'event') result.event++;
        if (m === 'event' && el.style.display === 'none') result.hiddenEvent++;
        if (m === 'room' && el.style.display !== 'none') result.visibleRoom++;
        if (m === 'both' && el.style.display !== 'none') result.visibleBoth++;
      });
      return result;
    });
    // Alle event-Items sind hidden (= alle event-tagged Items)
    expect(stats.hiddenEvent).toBe(stats.event);
    // Alle room-Items sind sichtbar
    expect(stats.visibleRoom).toBe(stats.room);
    // Alle both-Items sind sichtbar
    expect(stats.visibleBoth).toBe(stats.both);
  });

  test('Filter on + planningMode=event: event-Items + both sichtbar, room hidden', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      localStorage.setItem('csc-mode-filter', '1');
      document.body.dataset.planningMode = 'event';
    });
    await page.evaluate(() =>
      (window as unknown as { applyMenuModeFilter: () => void }).applyMenuModeFilter(),
    );
    const stats = await page.evaluate(() => {
      const items = document.querySelectorAll<HTMLElement>('.tbm-item[data-mode]');
      let hiddenRoom = 0;
      let visibleEvent = 0;
      items.forEach((el) => {
        const m = el.dataset.mode;
        if (m === 'room' && el.style.display === 'none') hiddenRoom++;
        if (m === 'event' && el.style.display !== 'none') visibleEvent++;
      });
      return { hiddenRoom, visibleEvent };
    });
    // Mindestens 1 room-Item ist hidden (wir haben 9 room-Items aus Sitzung H)
    expect(stats.hiddenRoom).toBeGreaterThan(0);
  });

  test('toggleMenuModeFilter: localStorage flippt zwischen 0 und 1', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);
    await page.evaluate(() => localStorage.setItem('csc-mode-filter', '0'));
    await page.evaluate(() =>
      (window as unknown as { toggleMenuModeFilter: () => void }).toggleMenuModeFilter(),
    );
    let val = await page.evaluate(() => localStorage.getItem('csc-mode-filter'));
    expect(val).toBe('1');
    await page.evaluate(() =>
      (window as unknown as { toggleMenuModeFilter: () => void }).toggleMenuModeFilter(),
    );
    val = await page.evaluate(() => localStorage.getItem('csc-mode-filter'));
    expect(val).toBe('0');
  });
});
