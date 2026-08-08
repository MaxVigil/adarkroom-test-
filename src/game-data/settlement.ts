import type { BuildingDefinition, ProfessionDefinition } from './schema.js';

const ROOM = 'script/room.js';
const OUTSIDE = 'script/outside.js';
const WORLD = 'script/world.js';

export const buildings = [
  {
    id: 'building.trap', legacyKey: 'trap', sourceFile: ROOM, maximum: 10,
    cost: { kind: 'linear', base: { 'resource.wood': 10 }, perExisting: { 'resource.wood': 10 } },
    unlockRuleId: 'system.unlock.room-building', jobs: [], acquisition: 'construct',
  },
  {
    id: 'building.cart', legacyKey: 'cart', sourceFile: ROOM, maximum: 1,
    cost: { kind: 'fixed', amounts: { 'resource.wood': 30 } },
    unlockRuleId: 'system.unlock.room-building', jobs: [], acquisition: 'construct',
  },
  {
    id: 'building.hut', legacyKey: 'hut', sourceFile: ROOM, maximum: 20,
    cost: { kind: 'linear', base: { 'resource.wood': 100 }, perExisting: { 'resource.wood': 50 } },
    unlockRuleId: 'system.unlock.room-building', jobs: [], populationCapacity: 4, acquisition: 'construct',
  },
  {
    id: 'building.lodge', legacyKey: 'lodge', sourceFile: ROOM, maximum: 1,
    cost: { kind: 'fixed', amounts: { 'resource.wood': 200, 'resource.fur': 10, 'resource.meat': 5 } },
    unlockRuleId: 'system.unlock.room-building', jobs: ['profession.hunter', 'profession.trapper'], acquisition: 'construct',
  },
  {
    id: 'building.trading-post', legacyKey: 'trading post', sourceFile: ROOM, maximum: 1,
    cost: { kind: 'fixed', amounts: { 'resource.wood': 400, 'resource.fur': 100 } },
    unlockRuleId: 'system.unlock.room-building', jobs: [], acquisition: 'construct',
  },
  {
    id: 'building.tannery', legacyKey: 'tannery', sourceFile: ROOM, maximum: 1,
    cost: { kind: 'fixed', amounts: { 'resource.wood': 500, 'resource.fur': 50 } },
    unlockRuleId: 'system.unlock.room-building', jobs: ['profession.tanner'], acquisition: 'construct',
  },
  {
    id: 'building.smokehouse', legacyKey: 'smokehouse', sourceFile: ROOM, maximum: 1,
    cost: { kind: 'fixed', amounts: { 'resource.wood': 600, 'resource.meat': 50 } },
    unlockRuleId: 'system.unlock.room-building', jobs: ['profession.charcutier'], acquisition: 'construct',
  },
  {
    id: 'building.workshop', legacyKey: 'workshop', sourceFile: ROOM, maximum: 1,
    cost: { kind: 'fixed', amounts: { 'resource.wood': 800, 'resource.leather': 100, 'resource.scales': 10 } },
    unlockRuleId: 'system.unlock.room-building', jobs: [], acquisition: 'construct',
  },
  {
    id: 'building.steelworks', legacyKey: 'steelworks', sourceFile: ROOM, maximum: 1,
    cost: { kind: 'fixed', amounts: { 'resource.wood': 1500, 'resource.iron': 100, 'resource.coal': 100 } },
    unlockRuleId: 'system.unlock.room-building', jobs: ['profession.steelworker'], acquisition: 'construct',
  },
  {
    id: 'building.armoury', legacyKey: 'armoury', sourceFile: ROOM, maximum: 1,
    cost: { kind: 'fixed', amounts: { 'resource.wood': 3000, 'resource.steel': 100, 'resource.sulphur': 50 } },
    unlockRuleId: 'system.unlock.room-building', jobs: ['profession.armourer'], acquisition: 'construct',
  },
  {
    id: 'building.iron-mine', legacyKey: 'iron mine', sourceFile: WORLD, maximum: 1,
    cost: { kind: 'fixed', amounts: {} }, unlockRuleId: 'system.unlock.clear-iron-mine',
    jobs: ['profession.iron-miner'], acquisition: 'world',
  },
  {
    id: 'building.coal-mine', legacyKey: 'coal mine', sourceFile: WORLD, maximum: 1,
    cost: { kind: 'fixed', amounts: {} }, unlockRuleId: 'system.unlock.clear-coal-mine',
    jobs: ['profession.coal-miner'], acquisition: 'world',
  },
  {
    id: 'building.sulphur-mine', legacyKey: 'sulphur mine', sourceFile: WORLD, maximum: 1,
    cost: { kind: 'fixed', amounts: {} }, unlockRuleId: 'system.unlock.clear-sulphur-mine',
    jobs: ['profession.sulphur-miner'], acquisition: 'world',
  },
] satisfies BuildingDefinition[];

export const professions = [
  { id: 'profession.gatherer', legacyKey: 'gatherer', sourceFile: OUTSIDE, intervalSeconds: 10, flows: { 'resource.wood': 1 }, assignment: 'implicit-remainder' },
  { id: 'profession.hunter', legacyKey: 'hunter', sourceFile: OUTSIDE, intervalSeconds: 10, requiresBuildingId: 'building.lodge', flows: { 'resource.fur': 0.5, 'resource.meat': 0.5 }, assignment: 'manual' },
  { id: 'profession.trapper', legacyKey: 'trapper', sourceFile: OUTSIDE, intervalSeconds: 10, requiresBuildingId: 'building.lodge', flows: { 'resource.meat': -1, 'resource.bait': 1 }, assignment: 'manual' },
  { id: 'profession.tanner', legacyKey: 'tanner', sourceFile: OUTSIDE, intervalSeconds: 10, requiresBuildingId: 'building.tannery', flows: { 'resource.fur': -5, 'resource.leather': 1 }, assignment: 'manual' },
  { id: 'profession.charcutier', legacyKey: 'charcutier', sourceFile: OUTSIDE, intervalSeconds: 10, requiresBuildingId: 'building.smokehouse', flows: { 'resource.meat': -5, 'resource.wood': -5, 'resource.cured-meat': 1 }, assignment: 'manual' },
  { id: 'profession.iron-miner', legacyKey: 'iron miner', sourceFile: OUTSIDE, intervalSeconds: 10, requiresBuildingId: 'building.iron-mine', flows: { 'resource.cured-meat': -1, 'resource.iron': 1 }, assignment: 'manual' },
  { id: 'profession.coal-miner', legacyKey: 'coal miner', sourceFile: OUTSIDE, intervalSeconds: 10, requiresBuildingId: 'building.coal-mine', flows: { 'resource.cured-meat': -1, 'resource.coal': 1 }, assignment: 'manual' },
  { id: 'profession.sulphur-miner', legacyKey: 'sulphur miner', sourceFile: OUTSIDE, intervalSeconds: 10, requiresBuildingId: 'building.sulphur-mine', flows: { 'resource.cured-meat': -1, 'resource.sulphur': 1 }, assignment: 'manual' },
  { id: 'profession.steelworker', legacyKey: 'steelworker', sourceFile: OUTSIDE, intervalSeconds: 10, requiresBuildingId: 'building.steelworks', flows: { 'resource.iron': -1, 'resource.coal': -1, 'resource.steel': 1 }, assignment: 'manual' },
  { id: 'profession.armourer', legacyKey: 'armourer', sourceFile: OUTSIDE, intervalSeconds: 10, requiresBuildingId: 'building.armoury', flows: { 'resource.steel': -1, 'resource.sulphur': -1, 'resource.bullets': 1 }, assignment: 'manual' },
] satisfies ProfessionDefinition[];
