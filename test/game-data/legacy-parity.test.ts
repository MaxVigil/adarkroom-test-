import { describe, expect, it } from 'vitest';
import { baseline, baselineSystems, buildingCost } from '../../src/game-data/index.js';
import { loadLegacy } from './legacy-loader.js';
import { eventSeeds } from '../../src/game-data/events.js';

type LegacyCraftable = { type: string; maximum?: number; cost: () => Record<string, number> };
type LegacyProfession = { delay: number; stores: Record<string, number> };
type LegacyWeapon = { type: string; damage: number | 'stun'; cooldown: number; cost?: Record<string, number> };

const toLegacyAmounts = (amounts: Record<string, number>): Record<string, number> => Object.fromEntries(
  Object.entries(amounts).map(([id, value]) => {
    const entity = [...baseline.resources, ...baseline.items].find((candidate) => candidate.id === id);
    return [entity?.legacyKey ?? id, value];
  }),
);

describe('catalog parity with inherited A Dark Room code', () => {
  it('matches all settlement building cost formulas', () => {
    for (const existing of [0, 1, 9, 19]) {
      const craftables = loadLegacy<Record<string, LegacyCraftable>>(
        'script/room.js',
        'Room.Craftables',
        { buildingCounts: { trap: existing, hut: existing } },
      );
      for (const building of baseline.buildings.filter(({ acquisition }) => acquisition === 'construct')) {
        expect(toLegacyAmounts(buildingCost(building, existing)), building.id)
          .toEqual(craftables[building.legacyKey]!.cost());
      }
    }
  });

  it('matches every legacy profession interval and flow', () => {
    const income = loadLegacy<Record<string, LegacyProfession>>('script/outside.js', 'Outside._INCOME');
    for (const profession of baseline.professions) {
      expect(profession.intervalSeconds, profession.id).toBe(income[profession.legacyKey]!.delay);
      expect(toLegacyAmounts(profession.flows), profession.id).toEqual(income[profession.legacyKey]!.stores);
    }
  });

  it('matches craft, trade, and fabrication costs', () => {
    const craftables = loadLegacy<Record<string, LegacyCraftable>>('script/room.js', 'Room.Craftables');
    const tradeGoods = loadLegacy<Record<string, LegacyCraftable>>('script/room.js', 'Room.TradeGoods');
    const fabricator = loadLegacy<Record<string, LegacyCraftable>>('script/fabricator.js', 'Fabricator.Craftables');

    for (const recipe of baseline.recipes.filter(({ acquisition }) => ['craft', 'trade', 'fabricate'].includes(acquisition))) {
      const source = recipe.acquisition === 'craft' ? craftables : recipe.acquisition === 'trade' ? tradeGoods : fabricator;
      expect(toLegacyAmounts(recipe.inputs), recipe.id).toEqual(source[recipe.legacyKey]!.cost());
      expect(recipe.outputQuantity, recipe.id).toBe((source[recipe.legacyKey] as LegacyCraftable & { quantity?: number }).quantity ?? 1);
    }
  });

  it('matches every combat weapon', () => {
    const weapons = loadLegacy<Record<string, LegacyWeapon>>('script/world.js', 'World.Weapons');
    for (const weapon of baseline.weapons) {
      const legacy = weapons[weapon.legacyKey]!;
      expect({
        kind: weapon.kind,
        damage: weapon.damage,
        cooldownSeconds: weapon.cooldownSeconds,
        ammoCost: toLegacyAmounts(weapon.ammoCost),
      }, weapon.id).toEqual({
        kind: legacy.type,
        damage: legacy.damage,
        cooldownSeconds: legacy.cooldown,
        ammoCost: legacy.cost ?? {},
      });
    }
  });

  it('matches high-impact room, path, world, and ship constants', () => {
    const room = loadLegacy<Record<string, number>>('script/room.js', 'Room');
    const outside = loadLegacy<Record<string, number>>('script/outside.js', 'Outside');
    const path = loadLegacy<Record<string, number>>('script/path.js', 'Path');
    const world = loadLegacy<Record<string, number>>('script/world.js', 'World');
    const ship = loadLegacy<Record<string, number>>('script/ship.js', 'Ship');

    expect(baselineSystems.room).toMatchObject({
      fireCoolDelayMs: room._FIRE_COOL_DELAY,
      warmDelayMs: room._ROOM_WARM_DELAY,
      builderStateDelayMs: room._BUILDER_STATE_DELAY,
      stokeCooldownSeconds: room._STOKE_COOLDOWN,
      needWoodDelayMs: room._NEED_WOOD_DELAY,
    });
    expect(baselineSystems.settlement).toMatchObject({
      manualGatherCooldownSeconds: outside._GATHER_DELAY,
      trapCheckCooldownSeconds: outside._TRAPS_DELAY,
      hutPopulationCapacity: outside._HUT_ROOM,
    });
    expect(baselineSystems.path.baseBagCapacity).toBe(path.DEFAULT_BAG_SPACE);
    expect(baselineSystems.world).toMatchObject({
      radius: world.RADIUS,
      lightRadius: world.LIGHT_RADIUS,
      baseWater: world.BASE_WATER,
      movesPerFood: world.MOVES_PER_FOOD,
      movesPerWater: world.MOVES_PER_WATER,
      deathCooldownSeconds: world.DEATH_COOLDOWN,
      fightChance: world.FIGHT_CHANCE,
      fightDelayMoves: world.FIGHT_DELAY,
      baseHealth: world.BASE_HEALTH,
      baseHitChance: world.BASE_HIT_CHANCE,
      meatHeal: world.MEAT_HEAL,
      medicineHeal: world.MEDS_HEAL,
      hypoHeal: world.HYPO_HEAL,
    });
    expect(baselineSystems.ship).toMatchObject({
      liftoffCooldownSeconds: ship.LIFTOFF_COOLDOWN,
      alloyPerHull: ship.ALLOY_PER_HULL,
      alloyPerThruster: ship.ALLOY_PER_THRUSTER,
      baseHull: ship.BASE_HULL,
      baseThrusters: ship.BASE_THRUSTERS,
    });
  });

  it('indexes all inherited top-level events without migrating scene handlers', () => {
    const setpieces = loadLegacy<Record<string, unknown>>('script/events/setpieces.js', 'Events.Setpieces');
    const executioner = loadLegacy<Record<string, unknown>>('script/events/executioner.js', 'Events.Executioner');
    const roomEvents = loadLegacy<unknown[]>('script/events/room.js', 'Events.Room');
    const outsideEvents = loadLegacy<unknown[]>('script/events/outside.js', 'Events.Outside');
    const encounters = loadLegacy<unknown[]>('script/events/encounters.js', 'Events.Encounters');

    expect(baseline.events.filter(({ id }) => id.startsWith('event.setpiece.')).length).toBe(Object.keys(setpieces).length);
    expect(baseline.events.filter(({ id }) => id.startsWith('event.executioner.')).length).toBe(Object.keys(executioner).length);
    expect(baseline.events.filter(({ id }) => id.startsWith('event.room.')).length).toBe(roomEvents.length);
    expect(baseline.events.filter(({ id }) => id.startsWith('event.outside.')).length).toBe(outsideEvents.length);
    expect(baseline.events.filter(({ id }) => id.startsWith('event.encounter.')).length).toBe(encounters.length);
  });

  it('indexes every inherited scene key under a stable event-owned ID', () => {
    for (const [eventId, legacyRef, sourceFile] of eventSeeds) {
      const legacyEvent = loadLegacy<{ scenes?: Record<string, unknown> }>(sourceFile, legacyRef);
      const expected = Object.keys(legacyEvent.scenes ?? {}).sort();
      const actual = baseline.scenes
        .filter((scene) => scene.eventId === eventId)
        .map((scene) => scene.legacyKey)
        .sort();
      expect(actual, eventId).toEqual(expected);
      expect(baseline.events.find(({ id }) => id === eventId)!.sceneIds.length, eventId).toBe(expected.length);
    }
  });
});
