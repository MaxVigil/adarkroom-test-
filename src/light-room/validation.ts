import { baseline } from '../game-data/index.js';
import { lightRoomOverlay } from './overlay.js';

export interface LightRoomCatalogIssue { code: string; message: string }

export function validateLightRoomCatalog(): LightRoomCatalogIssue[] {
  const issues: LightRoomCatalogIssue[] = [];
  const allEntities = [
    ...baseline.resources, ...baseline.buildings, ...baseline.professions,
    ...baseline.items, ...baseline.recipes, ...baseline.weapons, ...baseline.perks,
    ...baseline.blueprints, ...baseline.locations, ...baseline.events, ...baseline.scenes,
    ...baseline.enemies, ...baseline.combatEncounters, ...baseline.lootTables,
    ...lightRoomOverlay.buildings, ...lightRoomOverlay.professions, ...lightRoomOverlay.upgrades,
  ];
  const ids = new Set<string>();
  for (const entity of allEntities) {
    if (ids.has(entity.id)) issues.push({ code: 'duplicate-id', message: `duplicate stable ID: ${entity.id}` });
    ids.add(entity.id);
  }
  const check = (owner: string, target: string, role: string) => {
    if (!ids.has(target)) issues.push({ code: 'missing-reference', message: `${owner} has unknown ${role}: ${target}` });
  };
  const checkCondition = (owner: string, condition: { kind: string; buildingId?: string; resourceId?: string; upgradeId?: string }) => {
    const target = condition.buildingId ?? condition.resourceId ?? condition.upgradeId;
    if (target) check(owner, target, 'unlock condition');
  };
  for (const building of lightRoomOverlay.buildings) {
    checkCondition(building.id, building.revealWhen);
    checkCondition(building.id, building.unlockWhen);
    for (const job of building.jobs) check(building.id, job, 'job');
    for (const [job, slots] of Object.entries(building.workerSlots)) {
      check(building.id, job, 'worker slot');
      if (!building.jobs.includes(job) || slots < 1) issues.push({ code: 'invalid-worker-slot', message: `${building.id} has invalid slots for ${job}` });
    }
    for (const resourceId of Object.keys(building.cost.amounts)) check(building.id, resourceId, 'cost resource');
  }
  for (const profession of lightRoomOverlay.professions) {
    check(profession.id, profession.requiresBuildingId, 'building');
    for (const resourceId of Object.keys(profession.flows)) check(profession.id, resourceId, 'flow resource');
    for (const modifier of profession.modifiers) {
      checkCondition(profession.id, modifier.when);
      for (const resourceId of Object.keys(modifier.flows)) check(profession.id, resourceId, 'modified flow resource');
    }
  }
  for (const upgrade of lightRoomOverlay.upgrades) {
    check(upgrade.id, upgrade.affectsId, 'affected entity');
    checkCondition(upgrade.id, upgrade.unlockWhen);
  }
  return issues;
}
