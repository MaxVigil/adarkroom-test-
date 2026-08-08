import type { BuildingDefinition, ProfessionDefinition } from './schema.js';

export const baselineSystems = {
  room: {
    fireCoolDelayMs: 300_000,
    warmDelayMs: 30_000,
    builderStateDelayMs: 30_000,
    stokeCooldownSeconds: 10,
    needWoodDelayMs: 15_000,
  },
  settlement: {
    manualGatherCooldownSeconds: 60,
    manualGatherWood: 10,
    cartGatherWood: 50,
    trapCheckCooldownSeconds: 90,
    populationDelayMinutes: [0.5, 3] as const,
    hutPopulationCapacity: 4,
  },
  path: {
    baseBagCapacity: 10,
    capacityBonuses: {
      'item.rucksack': 10,
      'item.wagon': 30,
      'item.convoy': 60,
      'item.cargo-drone': 100,
    },
  },
  world: {
    radius: 30,
    villagePosition: [30, 30] as const,
    lightRadius: 2,
    baseWater: 10,
    movesPerFood: 2,
    movesPerWater: 1,
    deathCooldownSeconds: 120,
    fightChance: 0.2,
    fightDelayMoves: 3,
    baseHealth: 10,
    baseHitChance: 0.8,
    meatHeal: 8,
    medicineHeal: 20,
    hypoHeal: 30,
    terrainProbabilities: { forest: 0.15, field: 0.35, barrens: 0.5 },
  },
  armourHealthBonuses: {
    'item.leather-armour': 5,
    'item.iron-armour': 15,
    'item.steel-armour': 35,
    'item.kinetic-armour': 75,
  },
  ship: {
    liftoffCooldownSeconds: 120,
    alloyPerHull: 1,
    alloyPerThruster: 1,
    baseHull: 0,
    baseThrusters: 1,
  },
  traps: [
    { rollUnder: 0.5, resourceId: 'resource.fur' },
    { rollUnder: 0.75, resourceId: 'resource.meat' },
    { rollUnder: 0.85, resourceId: 'resource.scales' },
    { rollUnder: 0.93, resourceId: 'resource.teeth' },
    { rollUnder: 0.995, resourceId: 'resource.cloth' },
    { rollUnder: 1, resourceId: 'resource.charm' },
  ],
} as const;

export function buildingCost(building: BuildingDefinition, existing: number): Record<string, number> {
  if (building.cost.kind === 'fixed') return { ...building.cost.amounts };

  const result = { ...building.cost.base } as Record<string, number>;
  for (const [id, increment] of Object.entries(building.cost.perExisting)) {
    result[id] = (result[id] ?? 0) + increment * existing;
  }
  return result;
}

export function professionDelta(
  profession: ProfessionDefinition,
  workers: number,
  elapsedSeconds: number,
): Record<string, number> {
  const cycles = elapsedSeconds / profession.intervalSeconds;
  return Object.fromEntries(
    Object.entries(profession.flows).map(([id, amount]) => [id, amount * workers * cycles]),
  );
}

export function bagCapacity(ownedItemIds: ReadonlySet<string>): number {
  const bonuses = baselineSystems.path.capacityBonuses;
  for (const id of ['item.cargo-drone', 'item.convoy', 'item.wagon', 'item.rucksack'] as const) {
    if (ownedItemIds.has(id)) return baselineSystems.path.baseBagCapacity + bonuses[id];
  }
  return baselineSystems.path.baseBagCapacity;
}

export function maxWater(ownedItemIds: ReadonlySet<string>): number {
  if (ownedItemIds.has('item.fluid-recycler')) return 110;
  if (ownedItemIds.has('item.water-tank')) return 60;
  if (ownedItemIds.has('item.cask')) return 30;
  if (ownedItemIds.has('item.waterskin')) return 20;
  return 10;
}

export function maxHealth(ownedItemIds: ReadonlySet<string>): number {
  for (const id of ['item.kinetic-armour', 'item.steel-armour', 'item.iron-armour', 'item.leather-armour'] as const) {
    if (ownedItemIds.has(id)) return baselineSystems.world.baseHealth + baselineSystems.armourHealthBonuses[id];
  }
  return baselineSystems.world.baseHealth;
}

export function expeditionConsumption(
  moves: number,
  perks: ReadonlySet<string> = new Set(),
): { curedMeat: number; water: number } {
  const foodInterval = baselineSystems.world.movesPerFood * (perks.has('perk.slow-metabolism') ? 2 : 1);
  const waterInterval = baselineSystems.world.movesPerWater * (perks.has('perk.desert-rat') ? 2 : 1);
  return {
    curedMeat: Math.floor(moves / foodInterval),
    water: Math.floor(moves / waterInterval),
  };
}

export function modifiedWeaponDamage(
  baseDamage: number,
  kind: 'unarmed' | 'melee' | 'ranged',
  perks: ReadonlySet<string> = new Set(),
): number {
  let damage = baseDamage;
  if (kind === 'unarmed' && perks.has('perk.boxer')) damage *= 2;
  if (kind === 'unarmed' && perks.has('perk.martial-artist')) damage *= 3;
  if (kind === 'unarmed' && perks.has('perk.unarmed-master')) damage *= 2;
  if (kind === 'melee' && perks.has('perk.barbarian')) damage = Math.floor(damage * 1.5);
  return damage;
}
