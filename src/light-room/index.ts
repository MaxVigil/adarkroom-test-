import { baseline } from '../game-data/index.js';
import { guestHouseDesign } from './guest-house.js';
import {
  type LightRoomProfession,
  type LightRoomProfessionPatch,
  type UnlockCondition,
} from './schema.js';
import { lightRoomOverlay } from './overlay.js';

export const resolvedCatalog = {
  ...baseline,
  buildings: [...baseline.buildings, ...lightRoomOverlay.buildings],
  professions: [...baseline.professions, ...lightRoomOverlay.professions],
  professionPatches: lightRoomOverlay.professionPatches,
  pendingBuildings: [guestHouseDesign.building],
  pendingProfessions: [guestHouseDesign.caretaker],
  upgrades: lightRoomOverlay.upgrades,
};

export interface UnlockState {
  buildingIds?: ReadonlySet<string>;
  itemIds?: ReadonlySet<string>;
  resourceIds?: ReadonlySet<string>;
  upgradeIds?: ReadonlySet<string>;
}

export function conditionMet(condition: UnlockCondition, state: UnlockState): boolean {
  if (condition.kind === 'has-building') return state.buildingIds?.has(condition.buildingId) ?? false;
  if (condition.kind === 'has-resource') return state.resourceIds?.has(condition.resourceId) ?? false;
  if (condition.kind === 'has-item') return state.itemIds?.has(condition.itemId) ?? false;
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

export function randomFindDelta(
  patch: LightRoomProfessionPatch,
  workers: number,
  random: () => number = Math.random,
): Record<string, number> {
  const finds: Record<string, number> = {};
  for (let worker = 0; worker < Math.max(0, Math.floor(workers)); worker += 1) {
    for (const find of patch.randomFinds) {
      if (random() < find.chance) {
        finds[find.resourceId] = (finds[find.resourceId] ?? 0) + find.amount;
      }
    }
  }
  return finds;
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
export * from './guest-house.js';
export * from './save.js';
export * from './validation.js';
