import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route(/^https:\/\//, (route) => route.abort());
  await page.goto('/?ignorebrowser=true');
  await page.waitForFunction(() => {
    const runtime = window as unknown as LoggerRuntimeWindow;
    return typeof runtime.Engine === 'object' && typeof runtime.LightRoom === 'object';
  });
});

test('builds the Logger Hut only after the tannery and caps logger jobs at two', async ({ page }) => {
  await page.evaluate(() => {
    const runtime = window as unknown as LoggerRuntimeWindow;
    runtime.$SM.set('game.builder.level', 4, true);
    runtime.$SM.set('game.temperature.value', 3, true);
    runtime.$SM.set('game.buildings', {}, true);
    runtime.$SM.set('game.population', 4, true);
    runtime.$SM.set('game.workers', {}, true);
    runtime.$SM.set('stores.wood', 1000, true);
    runtime.$SM.set('stores.fur', 100, true);
    runtime.$SM.set('stores.leather', 50, true);
    runtime.Room.updateBuildButtons();
  });

  await expect(page.locator('#build_logger-hut')).toHaveCount(0);

  await page.evaluate(() => {
    const runtime = window as unknown as LoggerRuntimeWindow;
    runtime.$SM.set('game.buildings["tannery"]', 1, true);
    runtime.Room.updateBuildButtons();
  });
  await expect(page.locator('#build_logger-hut')).toBeAttached();
  await page.locator('#build_logger-hut').click({ force: true });

  await expect.poll(() => page.evaluate(() => {
    const runtime = window as unknown as LoggerRuntimeWindow;
    return {
      hut: runtime.$SM.get('game.buildings["logger hut"]', true),
      wood: runtime.$SM.get('stores.wood', true),
      fur: runtime.$SM.get('stores.fur', true),
      leather: runtime.$SM.get('stores.leather', true),
    };
  })).toEqual({ hut: 1, wood: 500, fur: 50, leather: 30 });

  await page.evaluate(() => (window as unknown as LoggerRuntimeWindow).Outside.init());
  await expect(page.locator('#workers_row_logger')).toBeAttached();
  await page.locator('#workers_row_logger .upManyBtn').click({ force: true });
  await page.locator('#workers_row_logger .upManyBtn').click({ force: true });

  await expect.poll(() => page.evaluate(() => {
    const runtime = window as unknown as LoggerRuntimeWindow;
    return {
      workers: runtime.$SM.get('game.workers["logger"]', true),
      woodPerCycle: (runtime.$SM.get('income.logger') as { stores: { wood: number } }).stores.wood,
    };
  })).toEqual({ workers: 2, woodPerCycle: 8 });

  const saveSnapshot = await page.evaluate(() => {
    const runtime = window as unknown as LoggerRuntimeWindow;
    runtime.Engine.saveGame();
    return {
      savedWorkers: JSON.parse(localStorage.gameState).game.workers.logger as number,
      stateWorkers: runtime.$SM.get('game.workers["logger"]', true),
      valid: runtime.SaveManager.validate(runtime.State),
    };
  });
  expect(saveSnapshot).toEqual({ savedWorkers: 2, stateWorkers: 2, valid: true });
  await page.reload();
  await page.waitForFunction(() => typeof (window as unknown as LoggerRuntimeWindow).LightRoom === 'object');
  await expect.poll(() => page.evaluate(() => {
    const runtime = window as unknown as LoggerRuntimeWindow;
    return {
      hut: runtime.$SM.get('game.buildings["logger hut"]', true),
      workers: runtime.$SM.get('game.workers["logger"]', true),
      woodPerCycle: (runtime.$SM.get('income.logger') as { stores: { wood: number } }).stores.wood,
    };
  })).toEqual({ hut: 1, workers: 2, woodPerCycle: 8 });

  const normalizedWorkers = await page.evaluate(() => {
    const runtime = window as unknown as LoggerRuntimeWindow;
    runtime.$SM.set('game.workers["logger"]', 9, true);
    runtime.Outside.updateWorkersView();
    return runtime.$SM.get('game.workers["logger"]', true);
  });
  expect(normalizedWorkers).toBe(2);
});

test('applies the catalogued iron-axes modifier without exposing an unapproved recipe', async ({ page }) => {
  const result = await page.evaluate(() => {
    const runtime = window as unknown as LoggerRuntimeWindow;
    runtime.$SM.set('game.workers["logger"]', 2, true);
    runtime.$SM.set('game.upgrades["iron axes"]', true, true);
    runtime.Outside.updateVillageIncome();
    return {
      woodPerCycle: (runtime.$SM.get('income.logger') as { stores: { wood: number } }).stores.wood,
      ironAxesCraftable: Boolean(runtime.Room.Craftables['iron axes']),
      acquisitionStatus: runtime.LightRoom.data.upgrades[0]?.acquisitionStatus,
    };
  });
  expect(result).toEqual({
    woodPerCycle: 16,
    ironAxesCraftable: false,
    acquisitionStatus: 'pending-design',
  });
});

interface LoggerRuntimeWindow {
  Engine: { saveGame(): void };
  LightRoom: { data: { upgrades: Array<{ acquisitionStatus: string }> } };
  SaveManager: { validate(value: unknown): boolean };
  State: object;
  Outside: { init(): void; updateVillageIncome(): void; updateWorkersView(): void };
  Room: { Craftables: Record<string, unknown>; updateBuildButtons(): void };
  $SM: { get(path: string, noFallback?: boolean): unknown; set(path: string, value: unknown, noEvent?: boolean): void };
}
