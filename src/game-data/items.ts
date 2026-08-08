import type { BlueprintDefinition, ItemDefinition, RecipeDefinition, WeaponDefinition } from './schema.js';

const ROOM = 'script/room.js';
const PATH = 'script/path.js';
const WORLD = 'script/world.js';
const FABRICATOR = 'script/fabricator.js';
const SHIP = 'script/ship.js';

export const items = [
  { id: 'item.torch', legacyKey: 'torch', sourceFile: ROOM, category: 'tool', weight: 1 },
  { id: 'item.waterskin', legacyKey: 'waterskin', sourceFile: ROOM, category: 'container', maximum: 1, weight: 1 },
  { id: 'item.cask', legacyKey: 'cask', sourceFile: ROOM, category: 'container', maximum: 1, weight: 1 },
  { id: 'item.water-tank', legacyKey: 'water tank', sourceFile: ROOM, category: 'container', maximum: 1, weight: 1 },
  { id: 'item.bone-spear', legacyKey: 'bone spear', sourceFile: PATH, category: 'weapon', weight: 2 },
  { id: 'item.rucksack', legacyKey: 'rucksack', sourceFile: ROOM, category: 'container', maximum: 1, weight: 1 },
  { id: 'item.wagon', legacyKey: 'wagon', sourceFile: ROOM, category: 'container', maximum: 1, weight: 1 },
  { id: 'item.convoy', legacyKey: 'convoy', sourceFile: ROOM, category: 'container', maximum: 1, weight: 1 },
  { id: 'item.leather-armour', legacyKey: 'l armour', sourceFile: ROOM, category: 'armour', maximum: 1, weight: 1 },
  { id: 'item.iron-armour', legacyKey: 'i armour', sourceFile: ROOM, category: 'armour', maximum: 1, weight: 1 },
  { id: 'item.steel-armour', legacyKey: 's armour', sourceFile: ROOM, category: 'armour', maximum: 1, weight: 1 },
  { id: 'item.iron-sword', legacyKey: 'iron sword', sourceFile: PATH, category: 'weapon', weight: 3 },
  { id: 'item.steel-sword', legacyKey: 'steel sword', sourceFile: PATH, category: 'weapon', weight: 5 },
  { id: 'item.rifle', legacyKey: 'rifle', sourceFile: PATH, category: 'weapon', weight: 5 },
  { id: 'item.compass', legacyKey: 'compass', sourceFile: ROOM, category: 'special', maximum: 1, weight: 1 },
  { id: 'item.bayonet', legacyKey: 'bayonet', sourceFile: WORLD, category: 'weapon', weight: 1 },
  { id: 'item.laser-rifle', legacyKey: 'laser rifle', sourceFile: PATH, category: 'weapon', weight: 5 },
  { id: 'item.energy-blade', legacyKey: 'energy blade', sourceFile: WORLD, category: 'weapon', weight: 1 },
  { id: 'item.fluid-recycler', legacyKey: 'fluid recycler', sourceFile: FABRICATOR, category: 'upgrade', maximum: 1, weight: 1 },
  { id: 'item.cargo-drone', legacyKey: 'cargo drone', sourceFile: FABRICATOR, category: 'upgrade', maximum: 1, weight: 1 },
  { id: 'item.kinetic-armour', legacyKey: 'kinetic armour', sourceFile: FABRICATOR, category: 'armour', maximum: 1, weight: 1 },
  { id: 'item.disruptor', legacyKey: 'disruptor', sourceFile: WORLD, category: 'weapon', weight: 1 },
  { id: 'item.plasma-rifle', legacyKey: 'plasma rifle', sourceFile: PATH, category: 'weapon', weight: 5 },
  { id: 'item.glowstone', legacyKey: 'glowstone', sourceFile: FABRICATOR, category: 'tool', weight: 1 },
  { id: 'item.fleet-beacon', legacyKey: 'fleet beacon', sourceFile: 'script/events/executioner.js', category: 'special', maximum: 1, weight: 0 },
] satisfies ItemDefinition[];

export const recipes = [
  { id: 'recipe.craft.torch', legacyKey: 'torch', sourceFile: ROOM, outputId: 'item.torch', inputs: { 'resource.wood': 1, 'resource.cloth': 1 }, stationId: 'building.workshop', acquisition: 'craft' },
  { id: 'recipe.craft.waterskin', legacyKey: 'waterskin', sourceFile: ROOM, outputId: 'item.waterskin', inputs: { 'resource.leather': 50 }, stationId: 'building.workshop', acquisition: 'craft' },
  { id: 'recipe.craft.cask', legacyKey: 'cask', sourceFile: ROOM, outputId: 'item.cask', inputs: { 'resource.leather': 100, 'resource.iron': 20 }, stationId: 'building.workshop', acquisition: 'craft' },
  { id: 'recipe.craft.water-tank', legacyKey: 'water tank', sourceFile: ROOM, outputId: 'item.water-tank', inputs: { 'resource.iron': 100, 'resource.steel': 50 }, stationId: 'building.workshop', acquisition: 'craft' },
  { id: 'recipe.craft.bone-spear', legacyKey: 'bone spear', sourceFile: ROOM, outputId: 'item.bone-spear', inputs: { 'resource.wood': 100, 'resource.teeth': 5 }, stationId: 'building.workshop', acquisition: 'craft' },
  { id: 'recipe.craft.rucksack', legacyKey: 'rucksack', sourceFile: ROOM, outputId: 'item.rucksack', inputs: { 'resource.leather': 200 }, stationId: 'building.workshop', acquisition: 'craft' },
  { id: 'recipe.craft.wagon', legacyKey: 'wagon', sourceFile: ROOM, outputId: 'item.wagon', inputs: { 'resource.wood': 500, 'resource.iron': 100 }, stationId: 'building.workshop', acquisition: 'craft' },
  { id: 'recipe.craft.convoy', legacyKey: 'convoy', sourceFile: ROOM, outputId: 'item.convoy', inputs: { 'resource.wood': 1000, 'resource.iron': 200, 'resource.steel': 100 }, stationId: 'building.workshop', acquisition: 'craft' },
  { id: 'recipe.craft.leather-armour', legacyKey: 'l armour', sourceFile: ROOM, outputId: 'item.leather-armour', inputs: { 'resource.leather': 200, 'resource.scales': 20 }, stationId: 'building.workshop', acquisition: 'craft' },
  { id: 'recipe.craft.iron-armour', legacyKey: 'i armour', sourceFile: ROOM, outputId: 'item.iron-armour', inputs: { 'resource.leather': 200, 'resource.iron': 100 }, stationId: 'building.workshop', acquisition: 'craft' },
  { id: 'recipe.craft.steel-armour', legacyKey: 's armour', sourceFile: ROOM, outputId: 'item.steel-armour', inputs: { 'resource.leather': 200, 'resource.steel': 100 }, stationId: 'building.workshop', acquisition: 'craft' },
  { id: 'recipe.craft.iron-sword', legacyKey: 'iron sword', sourceFile: ROOM, outputId: 'item.iron-sword', inputs: { 'resource.wood': 200, 'resource.leather': 50, 'resource.iron': 20 }, stationId: 'building.workshop', acquisition: 'craft' },
  { id: 'recipe.craft.steel-sword', legacyKey: 'steel sword', sourceFile: ROOM, outputId: 'item.steel-sword', inputs: { 'resource.wood': 500, 'resource.leather': 100, 'resource.steel': 20 }, stationId: 'building.workshop', acquisition: 'craft' },
  { id: 'recipe.craft.rifle', legacyKey: 'rifle', sourceFile: ROOM, outputId: 'item.rifle', inputs: { 'resource.wood': 200, 'resource.steel': 50, 'resource.sulphur': 50 }, stationId: 'building.workshop', acquisition: 'craft' },

  { id: 'recipe.trade.scales', legacyKey: 'scales', sourceFile: ROOM, outputId: 'resource.scales', inputs: { 'resource.fur': 150 }, stationId: 'building.trading-post', acquisition: 'trade' },
  { id: 'recipe.trade.teeth', legacyKey: 'teeth', sourceFile: ROOM, outputId: 'resource.teeth', inputs: { 'resource.fur': 300 }, stationId: 'building.trading-post', acquisition: 'trade' },
  { id: 'recipe.trade.iron', legacyKey: 'iron', sourceFile: ROOM, outputId: 'resource.iron', inputs: { 'resource.fur': 150, 'resource.scales': 50 }, stationId: 'building.trading-post', acquisition: 'trade' },
  { id: 'recipe.trade.coal', legacyKey: 'coal', sourceFile: ROOM, outputId: 'resource.coal', inputs: { 'resource.fur': 200, 'resource.teeth': 50 }, stationId: 'building.trading-post', acquisition: 'trade' },
  { id: 'recipe.trade.steel', legacyKey: 'steel', sourceFile: ROOM, outputId: 'resource.steel', inputs: { 'resource.fur': 300, 'resource.scales': 50, 'resource.teeth': 50 }, stationId: 'building.trading-post', acquisition: 'trade' },
  { id: 'recipe.trade.medicine', legacyKey: 'medicine', sourceFile: ROOM, outputId: 'resource.medicine', inputs: { 'resource.scales': 50, 'resource.teeth': 30 }, stationId: 'building.trading-post', acquisition: 'trade' },
  { id: 'recipe.trade.bullets', legacyKey: 'bullets', sourceFile: ROOM, outputId: 'resource.bullets', inputs: { 'resource.scales': 10 }, stationId: 'building.trading-post', acquisition: 'trade' },
  { id: 'recipe.trade.energy-cell', legacyKey: 'energy cell', sourceFile: ROOM, outputId: 'resource.energy-cell', inputs: { 'resource.scales': 10, 'resource.teeth': 10 }, stationId: 'building.trading-post', acquisition: 'trade' },
  { id: 'recipe.trade.bolas', legacyKey: 'bolas', sourceFile: ROOM, outputId: 'resource.bolas', inputs: { 'resource.teeth': 10 }, stationId: 'building.trading-post', acquisition: 'trade' },
  { id: 'recipe.trade.grenade', legacyKey: 'grenade', sourceFile: ROOM, outputId: 'resource.grenade', inputs: { 'resource.scales': 100, 'resource.teeth': 50 }, stationId: 'building.trading-post', acquisition: 'trade' },
  { id: 'recipe.trade.bayonet', legacyKey: 'bayonet', sourceFile: ROOM, outputId: 'item.bayonet', inputs: { 'resource.scales': 500, 'resource.teeth': 250 }, stationId: 'building.trading-post', acquisition: 'trade' },
  { id: 'recipe.trade.alien-alloy', legacyKey: 'alien alloy', sourceFile: ROOM, outputId: 'resource.alien-alloy', inputs: { 'resource.fur': 1500, 'resource.scales': 750, 'resource.teeth': 300 }, stationId: 'building.trading-post', acquisition: 'trade' },
  { id: 'recipe.trade.compass', legacyKey: 'compass', sourceFile: ROOM, outputId: 'item.compass', inputs: { 'resource.fur': 400, 'resource.scales': 20, 'resource.teeth': 10 }, stationId: 'building.trading-post', acquisition: 'trade' },

  { id: 'recipe.fabricate.energy-blade', legacyKey: 'energy blade', sourceFile: FABRICATOR, outputId: 'item.energy-blade', inputs: { 'resource.alien-alloy': 1 }, acquisition: 'fabricate' },
  { id: 'recipe.fabricate.fluid-recycler', legacyKey: 'fluid recycler', sourceFile: FABRICATOR, outputId: 'item.fluid-recycler', inputs: { 'resource.alien-alloy': 2 }, acquisition: 'fabricate' },
  { id: 'recipe.fabricate.cargo-drone', legacyKey: 'cargo drone', sourceFile: FABRICATOR, outputId: 'item.cargo-drone', inputs: { 'resource.alien-alloy': 2 }, acquisition: 'fabricate' },
  { id: 'recipe.fabricate.kinetic-armour', legacyKey: 'kinetic armour', sourceFile: FABRICATOR, outputId: 'item.kinetic-armour', inputs: { 'resource.alien-alloy': 2 }, blueprintId: 'blueprint.kinetic-armour', acquisition: 'fabricate' },
  { id: 'recipe.fabricate.disruptor', legacyKey: 'disruptor', sourceFile: FABRICATOR, outputId: 'item.disruptor', inputs: { 'resource.alien-alloy': 1 }, blueprintId: 'blueprint.disruptor', acquisition: 'fabricate' },
  { id: 'recipe.fabricate.hypo', legacyKey: 'hypo', sourceFile: FABRICATOR, outputId: 'resource.hypo', outputQuantity: 5, inputs: { 'resource.alien-alloy': 1 }, blueprintId: 'blueprint.hypo', acquisition: 'fabricate' },
  { id: 'recipe.fabricate.stim', legacyKey: 'stim', sourceFile: FABRICATOR, outputId: 'resource.stim', inputs: { 'resource.alien-alloy': 1 }, blueprintId: 'blueprint.stim', acquisition: 'fabricate' },
  { id: 'recipe.fabricate.plasma-rifle', legacyKey: 'plasma rifle', sourceFile: FABRICATOR, outputId: 'item.plasma-rifle', inputs: { 'resource.alien-alloy': 1 }, blueprintId: 'blueprint.plasma-rifle', acquisition: 'fabricate' },
  { id: 'recipe.fabricate.glowstone', legacyKey: 'glowstone', sourceFile: FABRICATOR, outputId: 'item.glowstone', inputs: { 'resource.alien-alloy': 1 }, blueprintId: 'blueprint.glowstone', acquisition: 'fabricate' },

  { id: 'recipe.ship.reinforce-hull', legacyKey: 'reinforce hull', sourceFile: SHIP, outputId: 'system.ship.hull', inputs: { 'resource.alien-alloy': 1 }, acquisition: 'ship-upgrade' },
  { id: 'recipe.ship.upgrade-engine', legacyKey: 'upgrade engine', sourceFile: SHIP, outputId: 'system.ship.thrusters', inputs: { 'resource.alien-alloy': 1 }, acquisition: 'ship-upgrade' },
] satisfies RecipeDefinition[];

export const weapons = [
  { id: 'weapon.fists', legacyKey: 'fists', sourceFile: WORLD, kind: 'unarmed', damage: 1, cooldownSeconds: 2, ammoCost: {} },
  { id: 'weapon.bone-spear', legacyKey: 'bone spear', sourceFile: WORLD, itemId: 'item.bone-spear', kind: 'melee', damage: 2, cooldownSeconds: 2, ammoCost: {} },
  { id: 'weapon.iron-sword', legacyKey: 'iron sword', sourceFile: WORLD, itemId: 'item.iron-sword', kind: 'melee', damage: 4, cooldownSeconds: 2, ammoCost: {} },
  { id: 'weapon.steel-sword', legacyKey: 'steel sword', sourceFile: WORLD, itemId: 'item.steel-sword', kind: 'melee', damage: 6, cooldownSeconds: 2, ammoCost: {} },
  { id: 'weapon.bayonet', legacyKey: 'bayonet', sourceFile: WORLD, itemId: 'item.bayonet', kind: 'melee', damage: 8, cooldownSeconds: 2, ammoCost: {} },
  { id: 'weapon.rifle', legacyKey: 'rifle', sourceFile: WORLD, itemId: 'item.rifle', kind: 'ranged', damage: 5, cooldownSeconds: 1, ammoCost: { 'resource.bullets': 1 } },
  { id: 'weapon.laser-rifle', legacyKey: 'laser rifle', sourceFile: WORLD, itemId: 'item.laser-rifle', kind: 'ranged', damage: 8, cooldownSeconds: 1, ammoCost: { 'resource.energy-cell': 1 } },
  { id: 'weapon.grenade', legacyKey: 'grenade', sourceFile: WORLD, itemId: 'resource.grenade', kind: 'ranged', damage: 15, cooldownSeconds: 5, ammoCost: { 'resource.grenade': 1 } },
  { id: 'weapon.bolas', legacyKey: 'bolas', sourceFile: WORLD, itemId: 'resource.bolas', kind: 'ranged', damage: 'stun', cooldownSeconds: 15, ammoCost: { 'resource.bolas': 1 } },
  { id: 'weapon.plasma-rifle', legacyKey: 'plasma rifle', sourceFile: WORLD, itemId: 'item.plasma-rifle', kind: 'ranged', damage: 12, cooldownSeconds: 1, ammoCost: { 'resource.energy-cell': 1 } },
  { id: 'weapon.energy-blade', legacyKey: 'energy blade', sourceFile: WORLD, itemId: 'item.energy-blade', kind: 'melee', damage: 10, cooldownSeconds: 2, ammoCost: {} },
  { id: 'weapon.disruptor', legacyKey: 'disruptor', sourceFile: WORLD, itemId: 'item.disruptor', kind: 'ranged', damage: 'stun', cooldownSeconds: 15, ammoCost: {} },
] satisfies WeaponDefinition[];

const blueprintSeeds = [
  ['kinetic-armour', 'kinetic armour'], ['disruptor', 'disruptor'], ['hypo', 'hypo'],
  ['stim', 'stim'], ['plasma-rifle', 'plasma rifle'], ['glowstone', 'glowstone'],
] as const;

export const blueprints = blueprintSeeds.map(([slug, legacyKey]) => ({
  id: `blueprint.${slug}`,
  legacyKey,
  sourceFile: 'script/events/executioner.js',
  unlockHandlerId: 'system.unlock.executioner-blueprint',
  recipeId: `recipe.fabricate.${slug}`,
})) satisfies BlueprintDefinition[];
