import { baseline } from '../game-data/index.js';
import { type LightRoomProfession, type UnlockCondition } from './schema.js';
import { lightRoomOverlay } from './overlay.js';

export const resolvedCatalog = {
  ...baseline,
  buildings: [...baseline.buildings, ...lightRoomOverlay.buildings],
  professions: [...baseline.professions, ...lightRoomOverlay.professions],
  upgrades: lightRoomOverlay.upgrades,
};

export interface UnlockState {
  buildingIds?: ReadonlySet<string>;
  resourceIds?: ReadonlySet<string>;
  upgradeIds?: ReadonlySet<string>;
}

export function conditionMet(condition: UnlockCondition, state: UnlockState): boolean {
  if (condition.kind === 'has-building') return state.buildingIds?.has(condition.buildingId) ?? false;
  if (condition.kind === 'has-resource') return state.resourceIds?.has(condition.resourceId) ?? false;
  return state.upgradeIds?.has(condition.upgradeId) ?? false;
}

export function professionFlows(
  profession: LightRoomProfession,
  state: UnlockState = {},
): Record<string, number> {
  let flows: Record<string, number> = { ...profession.flows };
  for (const modifier of profession.modifiers) {
    if (conditionMet(modifier.when, state)) flows = { ...modifier.flows };
  }
  return flows;
}

export function professionDelta(
  profession: LightRoomProfession,
  workers: number,
  elapsedSeconds: number,
  state: UnlockState = {},
): Record<string, number> {
  const cycles = elapsedSeconds / profession.intervalSeconds;
  return Object.fromEntries(
    Object.entries(professionFlows(profession, state))
      .map(([id, amount]) => [id, amount * workers * cycles]),
  );
}

export function loggerHutEconomics(hasIronAxes = false) {
  const logger = lightRoomOverlay.professions.find(({ id }) => id === 'profession.logger')!;
  const hut = lightRoomOverlay.buildings.find(({ id }) => id === 'building.logger-hut')!;
  const workers = logger.maximumWorkers;
  const woodPerCycle = professionFlows(logger, {
    upgradeIds: hasIronAxes ? new Set(['upgrade.iron-axes']) : new Set(),
  })['resource.wood']! * workers;
  const gathererEquivalent = woodPerCycle;
  const extraWoodPerMinute = (woodPerCycle - workers) * (60 / logger.intervalSeconds);
  return {
    workers,
    woodPerTenSeconds: woodPerCycle,
    woodPerMinute: woodPerCycle * (60 / logger.intervalSeconds),
    gathererEquivalent,
    workersFreed: gathererEquivalent - workers,
    woodCostPaybackMinutes: hut.cost.amounts['resource.wood']! / extraWoodPerMinute,
  };
}

export * from './schema.js';
export * from './overlay.js';
export * from './save.js';
export * from './validation.js';
