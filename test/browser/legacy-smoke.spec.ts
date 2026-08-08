import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route(/^https:\/\//, (route) => route.abort());
  await page.goto('/?ignorebrowser=true');
  await page.waitForFunction(() => typeof window.Engine === 'object' && typeof window.$SM === 'object');
});

test('loads the playable room with the hardened save runtime', async ({ page }) => {
  await expect(page.locator('#roomPanel')).toBeAttached();
  await expect(page.locator('#notifications')).toBeAttached();
  await expect.poll(() => page.evaluate(() => ({
    saveManager: typeof window.SaveManager,
    saveFormatVersion: window.State.saveFormatVersion,
    activeModule: window.Engine.activeModule === window.Room,
  }))).toEqual({ saveManager: 'object', saveFormatVersion: 1, activeModule: true });
});

test('persists state through a real reload', async ({ page }) => {
  await page.evaluate(() => {
    window.$SM.set('stores.wood', 321, true);
    window.Engine.saveGame();
  });
  await page.reload();
  await page.waitForFunction(() => typeof window.$SM === 'object');
  await expect.poll(() => page.evaluate(() => window.$SM.get('stores.wood', true))).toBe(321);
});

test('recovers a valid backup when the latest save is damaged', async ({ page }) => {
  await page.evaluate(() => {
    const backup = JSON.parse(JSON.stringify(window.State));
    backup.stores = { ...(backup.stores ?? {}), wood: 456 };
    localStorage.gameStateBackup = JSON.stringify(backup);
    localStorage.gameState = '{broken';
  });
  await page.reload();
  await page.waitForFunction(() => typeof window.$SM === 'object');
  await expect.poll(() => page.evaluate(() => window.$SM.get('stores.wood', true))).toBe(456);
  await expect(page.locator('#notifications')).toContainText('a backup was restored');
});

test('renders unlocked trading goods and keeps maximum helpers correct', async ({ page }) => {
  const result = await page.evaluate(() => {
    window.$SM.set('game.buildings["trading post"]', 1, true);
    window.$SM.set('stores.fur', 1000, true);
    window.Room.updateBuildButtons();
    return {
      buyButtons: document.querySelectorAll('#buyBtns .button').length,
      buySectionAttached: Boolean(document.querySelector('#roomPanel #buyBtns')),
      belowMaximum: window.eval('Fabricator.isAtMaximum({ maximum: 1 }, 0)') as boolean,
      atMaximum: window.eval('Fabricator.isAtMaximum({ maximum: 1 }, 1)') as boolean,
    };
  });
  expect(result.buyButtons).toBeGreaterThan(0);
  expect(result).toMatchObject({ buySectionAttached: true, belowMaximum: false, atMaximum: true });
});

declare global {
  interface Window {
    Engine: { activeModule: unknown; saveGame(): void };
    Room: { updateBuildButtons(): void };
    SaveManager: object;
    State: { saveFormatVersion?: number; stores?: Record<string, number> };
    $SM: { get(path: string, noFallback?: boolean): unknown; set(path: string, value: unknown, noEvent?: boolean): void };
  }
}
