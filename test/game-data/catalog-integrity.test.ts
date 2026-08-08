import { describe, expect, it } from 'vitest';
import { baseline } from '../../src/game-data/index.js';
import { validateBaseline } from '../../src/game-data/validation.js';

describe('baseline catalog integrity', () => {
  it('has no schema, ID, reference, probability, or source-file issues', () => {
    expect(validateBaseline()).toEqual([]);
  });

  it('keeps every stable ID unique across all entity kinds', () => {
    const ids = [
      ...baseline.resources, ...baseline.buildings, ...baseline.professions,
      ...baseline.items, ...baseline.recipes, ...baseline.weapons,
      ...baseline.perks, ...baseline.blueprints, ...baseline.locations, ...baseline.events,
      ...baseline.scenes,
      ...baseline.enemies, ...baseline.combatEncounters, ...baseline.lootTables,
    ].map(({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('covers the accepted legacy catalog surface', () => {
    expect({
      resources: baseline.resources.length,
      buildings: baseline.buildings.length,
      professions: baseline.professions.length,
      items: baseline.items.length,
      recipes: baseline.recipes.length,
      weapons: baseline.weapons.length,
      perks: baseline.perks.length,
      blueprints: baseline.blueprints.length,
      locations: baseline.locations.length,
      events: baseline.events.length,
      scenes: baseline.scenes.length,
      enemies: baseline.enemies.length,
      combatEncounters: baseline.combatEncounters.length,
      lootTables: baseline.lootTables.length,
    }).toEqual({
      resources: 22,
      buildings: 13,
      professions: 10,
      items: 25,
      recipes: 38,
      weapons: 12,
      perks: 11,
      blueprints: 6,
      locations: 14,
      events: 48,
      scenes: 274,
      enemies: 47,
      combatEncounters: 90,
      lootTables: 146,
    });
  });
});
