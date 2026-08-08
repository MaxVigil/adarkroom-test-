import { describe, expect, it } from 'vitest';
import { baseline } from '../../src/game-data/index.js';
import { eventSeeds } from '../../src/game-data/events.js';
import { loadLegacy } from './legacy-loader.js';

interface LegacyRoll { min: number; max: number; chance: number; bonus?: LegacyRoll }
interface LegacyScene {
  combat?: boolean;
  enemy?: string;
  damage?: number;
  hit?: number;
  attackDelay?: number;
  health?: number;
  ranged?: boolean;
  loot?: Record<string, LegacyRoll>;
}

const stableTarget = new Map(
  [...baseline.resources, ...baseline.items, ...baseline.blueprints].map(({ legacyKey, id }) => [legacyKey, id]),
);

function targetId(legacyKey: string): string | undefined {
  if (legacyKey.endsWith(' blueprint')) return stableTarget.get(legacyKey.slice(0, -' blueprint'.length));
  return stableTarget.get(legacyKey);
}

describe('combat and loot catalog parity', () => {
  it('matches every inherited combat stat and loot roll', () => {
    for (const [eventId, legacyRef, sourceFile] of eventSeeds) {
      const event = loadLegacy<{ scenes?: Record<string, LegacyScene> }>(sourceFile, legacyRef);
      for (const [sceneKey, scene] of Object.entries(event.scenes ?? {})) {
        const sceneId = baseline.scenes.find((candidate) => candidate.eventId === eventId && candidate.legacyKey === sceneKey)!.id;
        const encounter = baseline.combatEncounters.find((candidate) => candidate.sceneId === sceneId);
        expect(Boolean(encounter), `${eventId}/${sceneKey} combat presence`).toBe(Boolean(scene.combat));
        if (scene.combat && encounter) {
          expect({
            enemy: baseline.enemies.find(({ id }) => id === encounter.enemyId)?.legacyKey,
            damage: encounter.damage,
            hit: encounter.hitChance,
            attackDelay: encounter.attackDelaySeconds,
            health: encounter.health,
            ranged: encounter.ranged,
          }, `${eventId}/${sceneKey}`).toEqual({
            enemy: scene.enemy,
            damage: scene.damage,
            hit: scene.hit,
            attackDelay: scene.attackDelay,
            health: scene.health,
            ranged: scene.ranged ?? false,
          });
        }

        const table = baseline.lootTables.find((candidate) => candidate.sceneId === sceneId);
        expect(Boolean(table), `${eventId}/${sceneKey} loot presence`).toBe(Boolean(scene.loot));
        if (scene.loot && table) {
          expect(table.entries, `${eventId}/${sceneKey}`).toEqual(Object.entries(scene.loot).map(([key, roll]) => ({
            targetId: targetId(key),
            min: roll.min,
            maxExclusive: roll.max,
            chance: roll.chance,
            ...(roll.bonus ? { bonus: { min: roll.bonus.min, maxExclusive: roll.bonus.max, chance: roll.bonus.chance } } : {}),
          })));
        }
      }
    }
  });
});
