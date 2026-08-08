import type { EventMetadata } from './schema.js';

type EventSeed = readonly [id: string, legacyRef: string, sourceFile: string];

const SETPIECES = 'script/events/setpieces.js';
const EXECUTIONER = 'script/events/executioner.js';

export const eventSeeds: EventSeed[] = [
  ['event.global.thief', 'Events.Global[0]', 'script/events/global.js'],
  ['event.marketing.penrose', 'Events.Marketing[0]', 'script/events/marketing.js'],

  ['event.room.nomad', 'Events.Room[0]', 'script/events/room.js'],
  ['event.room.noises-inside', 'Events.Room[1]', 'script/events/room.js'],
  ['event.room.noises-outside', 'Events.Room[2]', 'script/events/room.js'],
  ['event.room.beggar', 'Events.Room[3]', 'script/events/room.js'],
  ['event.room.shady-builder', 'Events.Room[4]', 'script/events/room.js'],
  ['event.room.wanderer-scout', 'Events.Room[5]', 'script/events/room.js'],
  ['event.room.wanderer-soldier', 'Events.Room[6]', 'script/events/room.js'],
  ['event.room.scout', 'Events.Room[7]', 'script/events/room.js'],
  ['event.room.master', 'Events.Room[8]', 'script/events/room.js'],
  ['event.room.sick-man', 'Events.Room[9]', 'script/events/room.js'],

  ['event.outside.ruined-trap', 'Events.Outside[0]', 'script/events/outside.js'],
  ['event.outside.hut-fire', 'Events.Outside[1]', 'script/events/outside.js'],
  ['event.outside.sickness', 'Events.Outside[2]', 'script/events/outside.js'],
  ['event.outside.plague', 'Events.Outside[3]', 'script/events/outside.js'],
  ['event.outside.beast-attack', 'Events.Outside[4]', 'script/events/outside.js'],
  ['event.outside.military-raid', 'Events.Outside[5]', 'script/events/outside.js'],

  ['event.encounter.snarling-beast', 'Events.Encounters[0]', 'script/events/encounters.js'],
  ['event.encounter.gaunt-man', 'Events.Encounters[1]', 'script/events/encounters.js'],
  ['event.encounter.strange-bird', 'Events.Encounters[2]', 'script/events/encounters.js'],
  ['event.encounter.two-headed-creature', 'Events.Encounters[3]', 'script/events/encounters.js'],
  ['event.encounter.shivering-man', 'Events.Encounters[4]', 'script/events/encounters.js'],
  ['event.encounter.man-eater', 'Events.Encounters[5]', 'script/events/encounters.js'],
  ['event.encounter.scavenger', 'Events.Encounters[6]', 'script/events/encounters.js'],
  ['event.encounter.huge-lizard', 'Events.Encounters[7]', 'script/events/encounters.js'],
  ['event.encounter.feral-terror', 'Events.Encounters[8]', 'script/events/encounters.js'],
  ['event.encounter.soldier', 'Events.Encounters[9]', 'script/events/encounters.js'],
  ['event.encounter.sniper', 'Events.Encounters[10]', 'script/events/encounters.js'],

  ...['outpost', 'swamp', 'cave', 'town', 'city', 'house', 'battlefield', 'borehole', 'ship', 'sulphurmine', 'coalmine', 'ironmine', 'cache']
    .map((key): EventSeed => [`event.setpiece.${key}`, `Events.Setpieces.${key}`, SETPIECES]),

  ...['intro', 'antechamber', 'engineering', 'martial', 'medical', 'command']
    .map((key): EventSeed => [`event.executioner.${key}`, `Events.Executioner["executioner-${key}"]`, EXECUTIONER]),
];

export const events = eventSeeds.map(([id, legacyRef, sourceFile]) => ({
  id,
  legacyKey: legacyRef,
  legacyRef,
  sourceFile,
  handlerId: 'system.event.legacy-handler',
  migrationStatus: 'legacy-handler' as const,
  sceneIds: [],
})) satisfies EventMetadata[];
