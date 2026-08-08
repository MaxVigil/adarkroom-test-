import type { LocationDefinition } from './schema.js';

const WORLD = 'script/world.js';

export const locations = [
  { id: 'location.outpost', legacyKey: 'OUTPOST', sourceFile: WORLD, tile: 'P', count: 0, minRadius: 0, maxRadius: 0, eventId: 'event.setpiece.outpost', conditional: false },
  { id: 'location.iron-mine', legacyKey: 'IRON_MINE', sourceFile: WORLD, tile: 'I', count: 1, minRadius: 5, maxRadius: 5, eventId: 'event.setpiece.ironmine', conditional: false },
  { id: 'location.coal-mine', legacyKey: 'COAL_MINE', sourceFile: WORLD, tile: 'C', count: 1, minRadius: 10, maxRadius: 10, eventId: 'event.setpiece.coalmine', conditional: false },
  { id: 'location.sulphur-mine', legacyKey: 'SULPHUR_MINE', sourceFile: WORLD, tile: 'S', count: 1, minRadius: 20, maxRadius: 20, eventId: 'event.setpiece.sulphurmine', conditional: false },
  { id: 'location.house', legacyKey: 'HOUSE', sourceFile: WORLD, tile: 'H', count: 10, minRadius: 0, maxRadius: 45, eventId: 'event.setpiece.house', conditional: false },
  { id: 'location.cave', legacyKey: 'CAVE', sourceFile: WORLD, tile: 'V', count: 5, minRadius: 3, maxRadius: 10, eventId: 'event.setpiece.cave', conditional: false },
  { id: 'location.town', legacyKey: 'TOWN', sourceFile: WORLD, tile: 'O', count: 10, minRadius: 10, maxRadius: 20, eventId: 'event.setpiece.town', conditional: false },
  { id: 'location.city', legacyKey: 'CITY', sourceFile: WORLD, tile: 'Y', count: 20, minRadius: 20, maxRadius: 45, eventId: 'event.setpiece.city', conditional: false },
  { id: 'location.ship', legacyKey: 'SHIP', sourceFile: WORLD, tile: 'W', count: 1, minRadius: 28, maxRadius: 28, eventId: 'event.setpiece.ship', conditional: false },
  { id: 'location.borehole', legacyKey: 'BOREHOLE', sourceFile: WORLD, tile: 'B', count: 10, minRadius: 15, maxRadius: 45, eventId: 'event.setpiece.borehole', conditional: false },
  { id: 'location.battlefield', legacyKey: 'BATTLEFIELD', sourceFile: WORLD, tile: 'F', count: 5, minRadius: 18, maxRadius: 45, eventId: 'event.setpiece.battlefield', conditional: false },
  { id: 'location.swamp', legacyKey: 'SWAMP', sourceFile: WORLD, tile: 'M', count: 1, minRadius: 15, maxRadius: 45, eventId: 'event.setpiece.swamp', conditional: false },
  { id: 'location.executioner', legacyKey: 'EXECUTIONER', sourceFile: WORLD, tile: 'X', count: 1, minRadius: 28, maxRadius: 28, eventId: 'event.executioner.intro', conditional: false },
  { id: 'location.cache', legacyKey: 'CACHE', sourceFile: WORLD, tile: 'U', count: 1, minRadius: 10, maxRadius: 45, eventId: 'event.setpiece.cache', conditional: true },
] satisfies LocationDefinition[];
