import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { loadLegacy } from './legacy-loader.js';

type Loot = {
  min: number;
  max: number;
  chance: number;
  bonus?: Loot;
};

describe('inherited runtime regressions', () => {
  it('grants the quadruped base alien alloy and keeps the approved bonus roll', () => {
    const loot = loadLegacy<Loot>(
      'script/events/executioner.js',
      'Enemies.Executioner.quadruped.loot["alien alloy"]',
    );
    expect(loot).toMatchObject({
      min: 1,
      max: 1,
      chance: 1,
      bonus: { min: 2, max: 4, chance: 0.2 },
    });

    const baseOnly = loadLegacy<(loot: Loot) => number>(
      'script/events.js',
      'Events.rollLoot',
      { randomValues: [0.9, 0.4, 0.5] },
    );
    const withBonus = loadLegacy<(loot: Loot) => number>(
      'script/events.js',
      'Events.rollLoot',
      { randomValues: [0.9, 0.4, 0.1, 0.99] },
    );

    expect(baseOnly(loot)).toBe(1);
    expect(withBonus(loot)).toBe(4);
  });

  it('clears intermediate danger after iron armour is equipped', () => {
    const world = loadLegacy<{
      danger: boolean;
      getDistance: () => number;
      checkDanger: () => boolean;
    }>('script/world.js', 'World', { storeCounts: { 'i armour': 1 } });

    world.danger = true;
    world.getDistance = () => 12;
    expect(world.checkDanger()).toBe(true);
    expect(world.danger).toBe(false);
  });

  it('enforces Fabricator maximums against the actual stored amount', () => {
    const fabricator = loadLegacy<{
      Craftables: Record<string, { maximum?: number }>;
      isAtMaximum: (craftable: { maximum?: number }, storedAmount: number) => boolean;
    }>('script/fabricator.js', 'Fabricator');
    const cargoDrone = fabricator.Craftables['cargo drone']!;
    const energyBlade = fabricator.Craftables['energy blade']!;

    expect(fabricator.isAtMaximum(cargoDrone, 0)).toBe(false);
    expect(fabricator.isAtMaximum(cargoDrone, 1)).toBe(true);
    expect(fabricator.isAtMaximum(cargoDrone, 2)).toBe(true);
    expect(fabricator.isAtMaximum(energyBlade, 50)).toBe(false);
  });

  it('shows the trading section based on trading buttons, not building buttons', () => {
    const source = readFileSync('script/room.js', 'utf8');
    expect(source).toContain('if (bNeedsAppend && buySection.children().length > 0)');
    expect(source).not.toContain('if (bNeedsAppend && buildSection.children().length > 0)');
  });
});
