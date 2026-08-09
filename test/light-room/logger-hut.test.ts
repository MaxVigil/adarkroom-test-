import { describe, expect, it } from 'vitest';
import { baseline } from '../../src/game-data/index.js';
import {
  conditionMet,
  lightRoomOverlay,
  loggerHutEconomics,
  professionDelta,
  professionFlows,
  resolvedCatalog,
} from '../../src/light-room/index.js';
import { validateLightRoomCatalog } from '../../src/light-room/validation.js';

const loggerHut = lightRoomOverlay.buildings.find(({ id }) => id === 'building.logger-hut')!;
const logger = lightRoomOverlay.professions.find(({ id }) => id === 'profession.logger')!;

describe('Light Room overlay foundation', () => {
  it('keeps the inherited baseline frozen and resolves new entities separately', () => {
    expect(baseline.buildings).toHaveLength(13);
    expect(baseline.professions).toHaveLength(10);
    expect(resolvedCatalog.buildings).toHaveLength(15);
    expect(resolvedCatalog.professions).toHaveLength(12);
    expect(resolvedCatalog.upgrades).toHaveLength(4);
    expect(validateLightRoomCatalog()).toEqual([]);
  });

  it('uses the approved Logger Hut construction and unlock rules', () => {
    expect(loggerHut.cost).toEqual({
      kind: 'fixed',
      amounts: { 'resource.wood': 500, 'resource.fur': 50, 'resource.leather': 20 },
    });
    expect(loggerHut.maximum).toBe(1);
    expect(loggerHut.workerSlots).toEqual({ 'profession.logger': 2 });
    expect(conditionMet(loggerHut.unlockWhen, { buildingIds: new Set(['building.tannery']) })).toBe(true);
    expect(conditionMet(loggerHut.unlockWhen, { buildingIds: new Set(['building.lodge']) })).toBe(false);
  });

  it('produces two wood per logger and three after iron axes', () => {
    expect(logger.maximumWorkers).toBe(2);
    expect(professionFlows(logger)).toEqual({ 'resource.wood': 2 });
    expect(professionDelta(logger, 2, 10)).toEqual({ 'resource.wood': 4 });
    expect(professionFlows(logger, { upgradeIds: new Set(['upgrade.iron-axes']) }))
      .toEqual({ 'resource.wood': 3 });
    expect(professionDelta(logger, 2, 10, { upgradeIds: new Set(['upgrade.iron-axes']) }))
      .toEqual({ 'resource.wood': 6 });
  });

  it('reports the approved population and payback impact', () => {
    expect(loggerHutEconomics(false)).toMatchObject({
      workers: 2,
      woodPerTenSeconds: 4,
      woodPerMinute: 24,
      gathererEquivalent: 4,
      workersFreed: 2,
    });
    expect(loggerHutEconomics(false).woodCostPaybackMinutes).toBeCloseTo(41.6667, 4);
    expect(loggerHutEconomics(true)).toMatchObject({
      woodPerTenSeconds: 6,
      woodPerMinute: 36,
      gathererEquivalent: 6,
      workersFreed: 4,
    });
    expect(loggerHutEconomics(true).woodCostPaybackMinutes).toBeCloseTo(33.3333, 4);
  });
});
