import { BaselineSchema } from './schema.js';
import { resources } from './resources.js';
import { buildings, professions } from './settlement.js';
import { blueprints, items, recipes, weapons } from './items.js';
import { perks } from './progression.js';
import { locations } from './world.js';
import { events } from './events.js';
import { scenes } from './generated/scenes.js';

export const baseline = BaselineSchema.parse({
  version: 1,
  source: 'A Dark Room browser repository',
  resources,
  buildings,
  professions,
  items,
  recipes,
  weapons,
  perks,
  blueprints,
  locations,
  events: events.map((event) => ({
    ...event,
    sceneIds: scenes.filter((scene) => scene.eventId === event.id).map((scene) => scene.id),
  })),
  scenes,
});

export * from './balance.js';
export * from './schema.js';
