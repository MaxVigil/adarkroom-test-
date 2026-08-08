import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route(/^https:\/\//, (route) => route.abort());
  await page.goto('/?ignorebrowser=true');
  await page.waitForFunction(() => typeof (window as unknown as HunterRuntimeWindow).LightRoom === 'object');
});

test('rolls independent 10% scale and teeth finds for every working hunter', async ({ page }) => {
  const result = await page.evaluate(() => {
    const runtime = window as unknown as HunterRuntimeWindow;
    runtime.$SM.set('game.workers["hunter"]', 2, true);
    const originalRandom = Math.random;
    const rolls = [0.05, 0.09, 0.11, 0.01];
    Math.random = () => rolls.shift() ?? 1;
    try {
      return runtime.LightRoom.collectIncomeBonus('hunter');
    } finally {
      Math.random = originalRandom;
    }
  });
  expect(result).toEqual({ scales: 1, teeth: 2 });
});

test('adds successful hunter finds during the normal income collection cycle', async ({ page }) => {
  const result = await page.evaluate(() => {
    const runtime = window as unknown as HunterRuntimeWindow;
    runtime.$SM.set('game.workers["hunter"]', 1, true);
    runtime.$SM.set('stores.scales', 0, true);
    runtime.$SM.set('stores.teeth', 0, true);
    runtime.$SM.set('income.hunter', {
      delay: 10,
      timeLeft: 0,
      stores: { fur: 0.5, meat: 0.5 },
    }, true);
    const originalRandom = Math.random;
    Math.random = () => 0.01;
    try {
      runtime.$SM.collectIncome();
      return {
        scales: runtime.$SM.get('stores.scales', true),
        teeth: runtime.$SM.get('stores.teeth', true),
      };
    } finally {
      Math.random = originalRandom;
    }
  });
  expect(result).toEqual({ scales: 1, teeth: 1 });
});

interface HunterRuntimeWindow {
  LightRoom: { collectIncomeBonus(source: string): Record<string, number> };
  $SM: {
    collectIncome(): void;
    get(path: string, noFallback?: boolean): unknown;
    set(path: string, value: unknown, noEvent?: boolean): void;
  };
}
