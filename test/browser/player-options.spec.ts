import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route(/^https:\/\//, (route) => route.abort());
});

test('offers only English and Ukrainian and falls back safely from unsupported languages', async ({ page }) => {
  await page.goto('/?ignorebrowser=true&lang=de');
  await page.waitForFunction(() => typeof (window as unknown as OptionsRuntimeWindow).Engine === 'object');

  const result = await page.evaluate(() => {
    const runtime = window as unknown as OptionsRuntimeWindow;
    return {
      language: runtime.lang,
      available: Object.keys(runtime.langs),
      labels: [...document.querySelectorAll('.customSelectOptions li')].map((node) => node.textContent),
    };
  });

  expect(result.language).toBe('en');
  expect(result.available).toEqual(['en', 'uk']);
  expect(result.labels).toEqual(['language.', 'english', 'українська']);
});

test('loads the complete Ukrainian interface dictionary', async ({ page }) => {
  await page.goto('/?ignorebrowser=true&lang=uk');
  await page.waitForFunction(() => typeof (window as unknown as OptionsRuntimeWindow).Engine === 'object');

  const result = await page.evaluate(() => {
    const runtime = window as unknown as OptionsRuntimeWindow;
    return {
      language: runtime.lang,
      speedLabel: document.querySelector('.hyper')?.textContent,
      importFailure: runtime._('could not import save data'),
      recoveredSave: runtime._('the latest save was damaged; a backup was restored.'),
      kinetic: runtime._('kinetic'),
    };
  });

  expect(result).toEqual({
    language: 'uk',
    speedLabel: 'швидкість x1.',
    importFailure: 'не вдалося імпортувати збереження',
    recoveredSave: 'останнє збереження було пошкоджене; відновлено резервну копію.',
    kinetic: 'кінетична',
  });
});

test('switches active game timers to x20 and persists the selection', async ({ page }) => {
  await page.goto('/?ignorebrowser=true&lang=uk');
  await page.waitForFunction(() => typeof (window as unknown as OptionsRuntimeWindow).Engine === 'object');

  await page.locator('.hyper').click();
  await expect(page.locator('.speedMenuPanel')).toBeAttached();
  await expect(page.locator('.speedMenuPanel #exitButtons .button')).toHaveText([
    'класична (x1)', 'x2', 'x3', 'x4', 'x20', 'скасувати',
  ]);
  await page.getByText('x20', { exact: true }).click();
  await expect(page.locator('.hyper')).toHaveText('швидкість x20.');

  const elapsed = await page.evaluate(async () => {
    const runtime = window as unknown as OptionsRuntimeWindow;
    runtime.Engine.setGameSpeed(1);
    const startedAt = Date.now();
    const completion = new Promise<number>((resolve) => {
      runtime.Engine.setTimeout(() => resolve(Date.now() - startedAt), 400);
    });
    window.setTimeout(() => runtime.Engine.setGameSpeed(20), 50);
    return completion;
  });

  expect(elapsed).toBeLessThan(150);
  await expect(page.locator('.hyper')).toHaveText('швидкість x20.');
  await expect.poll(() => page.evaluate(() => {
    const runtime = window as unknown as OptionsRuntimeWindow;
    return {
      speed: runtime.Engine.getGameSpeed(),
      savedSpeed: runtime.$SM.get('config.gameSpeed', true),
    };
  })).toEqual({ speed: 20, savedSpeed: 20 });
});

test('does not load or register the Penrose cross-promotion event', async ({ page }) => {
  await page.goto('/?ignorebrowser=true');
  await page.waitForFunction(() => typeof (window as unknown as OptionsRuntimeWindow).Events === 'object');

  const result = await page.evaluate(() => {
    const runtime = window as unknown as OptionsRuntimeWindow;
    return {
      marketingGlobal: runtime.Events.Marketing,
      penroseInPool: runtime.Events.EventPool.some((event) => event?.title === 'Penrose'),
      marketingScript: Boolean(document.querySelector('script[src="script/events/marketing.js"]')),
    };
  });
  expect(result).toEqual({ marketingGlobal: undefined, penroseInPool: false, marketingScript: false });
});

interface OptionsRuntimeWindow {
  Engine: {
    getGameSpeed(): number;
    setGameSpeed(speed: number): void;
    setTimeout(callback: () => void, delay: number): unknown;
  };
  Events: { EventPool: Array<{ title?: string }>; Marketing?: unknown };
  $SM: { get(path: string, noFallback?: boolean): unknown };
  _: (text: string) => string;
  lang: string;
  langs: Record<string, string>;
}
