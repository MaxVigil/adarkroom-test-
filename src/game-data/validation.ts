import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { baseline } from './index.js';
import { baselineSystems } from './balance.js';

export interface CatalogIssue {
  code: string;
  message: string;
}

function duplicateValues(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

export function validateBaseline(repositoryRoot = process.cwd()): CatalogIssue[] {
  const issues: CatalogIssue[] = [];
  const collections = [
    baseline.resources,
    baseline.buildings,
    baseline.professions,
    baseline.items,
    baseline.recipes,
    baseline.weapons,
    baseline.perks,
    baseline.blueprints,
    baseline.locations,
    baseline.events,
    baseline.scenes,
    baseline.enemies,
    baseline.combatEncounters,
    baseline.lootTables,
  ] as const;
  const entities = collections.flat();
  const ids = new Set(entities.map(({ id }) => id));

  for (const duplicate of duplicateValues(entities.map(({ id }) => id))) {
    issues.push({ code: 'duplicate-id', message: `duplicate stable ID: ${duplicate}` });
  }

  for (const entity of entities) {
    if (!existsSync(resolve(repositoryRoot, entity.sourceFile))) {
      issues.push({ code: 'missing-source', message: `${entity.id} points to missing ${entity.sourceFile}` });
    }
  }

  const checkRef = (owner: string, ref: string, role: string): void => {
    if (!ids.has(ref) && !ref.startsWith('system.')) {
      issues.push({ code: 'missing-reference', message: `${owner} has unknown ${role}: ${ref}` });
    }
  };

  for (const building of baseline.buildings) {
    for (const jobId of building.jobs) checkRef(building.id, jobId, 'job');
    const amounts = building.cost.kind === 'fixed' ? building.cost.amounts : {
      ...building.cost.base,
      ...building.cost.perExisting,
    };
    for (const resourceId of Object.keys(amounts)) checkRef(building.id, resourceId, 'cost input');
  }

  for (const profession of baseline.professions) {
    if (profession.requiresBuildingId) checkRef(profession.id, profession.requiresBuildingId, 'building');
    for (const resourceId of Object.keys(profession.flows)) checkRef(profession.id, resourceId, 'flow resource');
  }

  for (const recipe of baseline.recipes) {
    checkRef(recipe.id, recipe.outputId, 'output');
    if (recipe.stationId) checkRef(recipe.id, recipe.stationId, 'station');
    if (recipe.blueprintId) checkRef(recipe.id, recipe.blueprintId, 'blueprint');
    for (const inputId of Object.keys(recipe.inputs)) checkRef(recipe.id, inputId, 'input');
  }

  for (const weapon of baseline.weapons) {
    if (weapon.itemId) checkRef(weapon.id, weapon.itemId, 'item');
    for (const ammoId of Object.keys(weapon.ammoCost)) checkRef(weapon.id, ammoId, 'ammunition');
  }

  for (const blueprint of baseline.blueprints) checkRef(blueprint.id, blueprint.recipeId, 'recipe');
  for (const location of baseline.locations) checkRef(location.id, location.eventId, 'event');
  for (const event of baseline.events) {
    for (const sceneId of event.sceneIds) checkRef(event.id, sceneId, 'scene');
  }
  for (const scene of baseline.scenes) checkRef(scene.id, scene.eventId, 'event');
  for (const encounter of baseline.combatEncounters) {
    checkRef(encounter.id, encounter.eventId, 'event');
    checkRef(encounter.id, encounter.sceneId, 'scene');
    checkRef(encounter.id, encounter.enemyId, 'enemy');
  }
  for (const lootTable of baseline.lootTables) {
    checkRef(lootTable.id, lootTable.eventId, 'event');
    checkRef(lootTable.id, lootTable.sceneId, 'scene');
    for (const entry of lootTable.entries) checkRef(lootTable.id, entry.targetId, 'loot target');
  }

  const trapRolls = baselineSystems.traps.map(({ rollUnder }) => rollUnder);
  if (trapRolls.at(-1) !== 1 || trapRolls.some((value, index) => index > 0 && value <= trapRolls[index - 1]!)) {
    issues.push({ code: 'invalid-probability-table', message: 'trap thresholds must be strictly increasing and end at 1' });
  }

  const terrainTotal = Object.values(baselineSystems.world.terrainProbabilities).reduce((sum, value) => sum + value, 0);
  if (Math.abs(terrainTotal - 1) > Number.EPSILON) {
    issues.push({ code: 'invalid-probability-table', message: `terrain probabilities total ${terrainTotal}` });
  }

  return issues;
}

export function assertValidBaseline(repositoryRoot = process.cwd()): void {
  const issues = validateBaseline(repositoryRoot);
  if (issues.length > 0) {
    throw new Error(issues.map(({ code, message }) => `[${code}] ${message}`).join('\n'));
  }
}
