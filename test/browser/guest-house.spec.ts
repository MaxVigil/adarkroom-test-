import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route(/^https:\/\//, (route) => route.abort());
  await page.goto('/?ignorebrowser=true');
  await page.waitForFunction(() => {
    const runtime = window as unknown as GuestRuntimeWindow;
    return typeof runtime.GuestHouse === 'object' && typeof runtime.LightRoom === 'object';
  });
});

test('builds the Guest House, preserves its queue, and completes one paid lesson per visit', async ({ page }) => {
  await page.evaluate(() => {
    const runtime = window as unknown as GuestRuntimeWindow;
    runtime.$SM.set('game.builder.level', 4, true);
    runtime.$SM.set('game.temperature.value', 3, true);
    runtime.$SM.set('features.location.world', true, true);
    runtime.$SM.set('stores.compass', 1, true);
    (runtime.Room as { pathDiscovery?: boolean }).pathDiscovery = true;
    runtime.$SM.set('stores.wood', 1000, true);
    runtime.$SM.set('stores.fur', 100, true);
    runtime.$SM.set('stores.leather', 50, true);
    runtime.Room.updateBuildButtons();
  });

  await expect(page.locator('#build_guest-house')).toBeAttached();
  await page.locator('#build_guest-house').click({ force: true });
  await expect(page.locator('#guestHouseButton')).toBeAttached();

  await page.evaluate(() => {
    const runtime = window as unknown as GuestRuntimeWindow;
    runtime.$SM.set('game.guestHouse', {
      rooms: [{ visitId: 'master-1', guestId: 'guest.wandering-master' }],
      queue: [{ visitId: 'scout-1', guestId: 'guest.scout' }],
      waiting: [],
      reserved: {},
      arrivalCursor: 0,
      nextVisitSeconds: 900,
      nextGuestId: 'guest.wandering-master',
    }, true);
    runtime.$SM.set('stores["cured meat"]', 100, true);
    runtime.$SM.set('stores.fur', 100, true);
    runtime.$SM.set('stores.torch', 1, true);
    runtime.Engine.saveGame();
  });
  await page.reload();
  await page.waitForFunction(() => typeof (window as unknown as GuestRuntimeWindow).GuestHouse === 'object');

  await expect.poll(() => page.evaluate(() => {
    const runtime = window as unknown as GuestRuntimeWindow;
    const state = runtime.$SM.get('game.guestHouse') as GuestState;
    return { rooms: state.rooms, queue: state.queue };
  })).toEqual({
    rooms: [{ visitId: 'master-1', guestId: 'guest.wandering-master' }],
    queue: [{ visitId: 'scout-1', guestId: 'guest.scout' }],
  });

  await page.locator('#guestHouseButton').click({ force: true });
  await page.locator('#guest0').click({ force: true });
  await page.locator('#service0').click({ force: true });

  await expect.poll(() => page.evaluate(() => {
    const runtime = window as unknown as GuestRuntimeWindow;
    const state = runtime.$SM.get('game.guestHouse') as GuestState;
    return {
      evasive: runtime.$SM.get('character.perks["evasive"]', true),
      rooms: state.rooms,
      queue: state.queue,
      curedMeat: runtime.$SM.get('stores["cured meat"]', true),
      fur: runtime.$SM.get('stores.fur', true),
      torch: runtime.$SM.get('stores.torch', true),
    };
  })).toEqual({
    evasive: true,
    rooms: [{ visitId: 'scout-1', guestId: 'guest.scout' }],
    queue: [],
    curedMeat: 0,
    fur: 0,
    torch: 0,
  });
});

test('applies bounded Guest House upgrades and lets the caretaker reserve but not create supplies', async ({ page }) => {
  await page.evaluate(() => {
    const runtime = window as unknown as GuestRuntimeWindow;
    runtime.$SM.set('game.builder.level', 4, true);
    runtime.$SM.set('game.temperature.value', 3, true);
    runtime.$SM.set('features.location.world', true, true);
    runtime.$SM.set('game.buildings["guest house"]', 1, true);
    runtime.$SM.set('stores.wood', 1500, true);
    runtime.$SM.set('stores.leather', 250, true);
    runtime.$SM.set('stores["cured meat"]', 50, true);
    runtime.$SM.set('stores.scales', 10, true);
    runtime.Room.updateBuildButtons();
  });

  await expect(page.locator('#build_guest-second-room')).toBeAttached();
  await expect(page.locator('#build_guest-pantry')).toBeAttached();
  await expect(page.locator('#build_guest-notice-board')).toBeAttached();
  await page.locator('#build_guest-second-room').click({ force: true });
  await expect.poll(() => page.evaluate(() => (window as unknown as GuestRuntimeWindow)
    .$SM.get('game.upgrades["guest second room"]', true))).toBe(true);
  await page.mouse.move(0, 0);
  await expect(page.locator('#build_guest-pantry')).not.toHaveClass(/disabled/);
  await page.locator('#build_guest-pantry').click();
  await expect.poll(() => page.evaluate(() => (window as unknown as GuestRuntimeWindow)
    .$SM.get('game.upgrades["guest pantry"]', true))).toBe(true);
  await page.mouse.move(0, 0);
  await page.locator('#build_guest-notice-board').click();
  await expect.poll(() => page.evaluate(() => (window as unknown as GuestRuntimeWindow)
    .$SM.get('game.upgrades["guest notice board"]', true))).toBe(true);

  const result = await page.evaluate(() => {
    const runtime = window as unknown as GuestRuntimeWindow;
    runtime.$SM.set('game.workers["caretaker"]', 1, true);
    runtime.$SM.set('game.guestHouse', {
      rooms: [{ visitId: 'master-2', guestId: 'guest.wandering-master' }],
      queue: [],
      waiting: [],
      reserved: {},
      arrivalCursor: 0,
      nextVisitSeconds: 1200,
      nextGuestId: 'guest.scout',
    }, true);
    runtime.$SM.set('stores["cured meat"]', 3, true);
    runtime.$SM.set('stores.fur', 0, true);
    runtime.$SM.set('stores.torch', 0, true);
    runtime.GuestHouse.tick();
    const state = runtime.$SM.get('game.guestHouse') as GuestState;
    const guest = runtime.GuestHouse.guestById('guest.wandering-master');
    return {
      upgrades: {
        secondRoom: runtime.$SM.get('game.upgrades["guest second room"]', true),
        pantry: runtime.$SM.get('game.upgrades["guest pantry"]', true),
        noticeBoard: runtime.$SM.get('game.upgrades["guest notice board"]', true),
      },
      roomCapacity: runtime.GuestHouse.roomCapacity(),
      reserved: state.reserved['master-2'],
      curedMeat: runtime.$SM.get('stores["cured meat"]', true),
      remainingCost: runtime.GuestHouse.remainingCost(state, state.rooms[0]!, guest.services[0]!),
      nextVisitSeconds: state.nextVisitSeconds,
    };
  });

  expect(result).toEqual({
    upgrades: { secondRoom: true, pantry: true, noticeBoard: true },
    roomCapacity: 2,
    reserved: { 'cured meat': 3 },
    curedMeat: 0,
    remainingCost: { 'cured meat': 87, fur: 90, torch: 1 },
    nextVisitSeconds: 1183.3333333333333,
  });
});

interface GuestState {
  rooms: Array<{ visitId: string; guestId: string }>;
  queue: Array<{ visitId: string; guestId: string }>;
  reserved: Record<string, Record<string, number>>;
  nextVisitSeconds?: number;
}

interface GuestRuntimeWindow {
  Engine: { saveGame(): void };
  LightRoom: object;
  Room: { updateBuildButtons(): void };
  GuestHouse: {
    tick(): void;
    roomCapacity(): number;
    guestById(id: string): { services: Array<{ cost: Record<string, number> }> };
    remainingCost(state: GuestState, visit: { visitId: string }, service: { cost: Record<string, number> }): Record<string, number>;
  };
  $SM: {
    get(path: string, noFallback?: boolean): unknown;
    set(path: string, value: unknown, noEvent?: boolean): void;
  };
}
