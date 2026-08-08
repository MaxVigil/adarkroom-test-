import { describe, expect, it } from 'vitest';
import {
  bagCapacity,
  baseline,
  baselineSystems,
  buildingCost,
  expeditionConsumption,
  maxHealth,
  maxWater,
  modifiedWeaponDamage,
  professionDelta,
} from '../../src/game-data/index.js';
import { migrateLegacyState } from '../../src/game-data/save-ids.js';

const building = (id: string) => baseline.buildings.find((entry) => entry.id === id)!;
const profession = (id: string) => baseline.professions.find((entry) => entry.id === id)!;

describe('accepted baseline player scenarios', () => {
  it('reproduces traps, huts, cart gathering, and population capacity', () => {
    expect(buildingCost(building('building.trap'), 0)).toEqual({ 'resource.wood': 10 });
    expect(buildingCost(building('building.trap'), 9)).toEqual({ 'resource.wood': 100 });
    expect(buildingCost(building('building.hut'), 0)).toEqual({ 'resource.wood': 100 });
    expect(buildingCost(building('building.hut'), 19)).toEqual({ 'resource.wood': 1050 });
    expect(20 * baselineSystems.settlement.hutPopulationCapacity).toBe(80);
    expect(baselineSystems.settlement.manualGatherWood).toBe(10);
    expect(baselineSystems.settlement.cartGatherWood).toBe(50);
  });

  it('reproduces worker output over fixed ten-second ticks', () => {
    expect(professionDelta(profession('profession.gatherer'), 4, 10)).toEqual({ 'resource.wood': 4 });
    expect(professionDelta(profession('profession.hunter'), 4, 10)).toEqual({
      'resource.fur': 2,
      'resource.meat': 2,
    });
    expect(professionDelta(profession('profession.charcutier'), 2, 30)).toEqual({
      'resource.meat': -30,
      'resource.wood': -30,
      'resource.cured-meat': 6,
    });
  });

  it('reproduces the mine-to-steel-to-bullets chain', () => {
    const iron = professionDelta(profession('profession.iron-miner'), 2, 20);
    const coal = professionDelta(profession('profession.coal-miner'), 2, 20);
    const steel = professionDelta(profession('profession.steelworker'), 2, 20);
    const bullets = professionDelta(profession('profession.armourer'), 2, 20);
    expect(iron).toEqual({ 'resource.cured-meat': -4, 'resource.iron': 4 });
    expect(coal).toEqual({ 'resource.cured-meat': -4, 'resource.coal': 4 });
    expect(steel).toEqual({ 'resource.iron': -4, 'resource.coal': -4, 'resource.steel': 4 });
    expect(bullets).toEqual({ 'resource.steel': -4, 'resource.sulphur': -4, 'resource.bullets': 4 });
  });

  it('reproduces expedition capacity, food, water, and armour tiers', () => {
    expect(bagCapacity(new Set())).toBe(10);
    expect(bagCapacity(new Set(['item.rucksack']))).toBe(20);
    expect(bagCapacity(new Set(['item.wagon', 'item.rucksack']))).toBe(40);
    expect(bagCapacity(new Set(['item.cargo-drone', 'item.convoy']))).toBe(110);
    expect(maxWater(new Set(['item.waterskin']))).toBe(20);
    expect(maxWater(new Set(['item.fluid-recycler', 'item.water-tank']))).toBe(110);
    expect(maxHealth(new Set(['item.leather-armour']))).toBe(15);
    expect(maxHealth(new Set(['item.kinetic-armour', 'item.steel-armour']))).toBe(85);
    expect(expeditionConsumption(20)).toEqual({ curedMeat: 10, water: 20 });
    expect(expeditionConsumption(20, new Set(['perk.slow-metabolism', 'perk.desert-rat'])))
      .toEqual({ curedMeat: 5, water: 10 });
  });

  it('reproduces combat perk modifiers and ship upgrade costs', () => {
    expect(modifiedWeaponDamage(1, 'unarmed', new Set(['perk.boxer']))).toBe(2);
    expect(modifiedWeaponDamage(1, 'unarmed', new Set(['perk.boxer', 'perk.martial-artist', 'perk.unarmed-master']))).toBe(12);
    expect(modifiedWeaponDamage(5, 'melee', new Set(['perk.barbarian']))).toBe(7);
    expect(baselineSystems.ship.baseHull).toBe(0);
    expect(baselineSystems.ship.baseThrusters).toBe(1);
    expect(baselineSystems.ship.alloyPerHull).toBe(1);
    expect(baselineSystems.ship.alloyPerThruster).toBe(1);
  });

  it('migrates representative legacy save keys to stable IDs', () => {
    expect(migrateLegacyState({
      stores: { wood: 120, 'bone spear': 1, compass: 1 },
      game: { buildings: { hut: 3, lodge: 1 }, workers: { hunter: 4 } },
      character: { perks: { stealthy: true }, blueprints: { disruptor: true } },
    })).toEqual({
      version: 1,
      stores: { 'resource.wood': 120 },
      items: { 'item.bone-spear': 1, 'item.compass': 1 },
      buildings: { 'building.hut': 3, 'building.lodge': 1 },
      workers: { 'profession.hunter': 4 },
      perks: { 'perk.stealthy': true },
      blueprints: { 'blueprint.disruptor': true },
    });
  });
});
