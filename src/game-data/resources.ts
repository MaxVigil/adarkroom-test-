import type { ResourceDefinition } from './schema.js';

export const resources = [
  { id: 'resource.wood', legacyKey: 'wood', kind: 'raw', sourceFile: 'script/outside.js' },
  { id: 'resource.fur', legacyKey: 'fur', kind: 'raw', sourceFile: 'script/outside.js' },
  { id: 'resource.meat', legacyKey: 'meat', kind: 'raw', sourceFile: 'script/outside.js' },
  { id: 'resource.scales', legacyKey: 'scales', kind: 'raw', sourceFile: 'script/outside.js' },
  { id: 'resource.teeth', legacyKey: 'teeth', kind: 'raw', sourceFile: 'script/outside.js' },
  { id: 'resource.cloth', legacyKey: 'cloth', kind: 'raw', sourceFile: 'script/outside.js' },
  { id: 'resource.charm', legacyKey: 'charm', kind: 'special', sourceFile: 'script/outside.js' },
  { id: 'resource.bait', legacyKey: 'bait', kind: 'processed', sourceFile: 'script/outside.js' },
  { id: 'resource.leather', legacyKey: 'leather', kind: 'processed', sourceFile: 'script/outside.js' },
  { id: 'resource.cured-meat', legacyKey: 'cured meat', kind: 'consumable', sourceFile: 'script/outside.js' },
  { id: 'resource.iron', legacyKey: 'iron', kind: 'raw', sourceFile: 'script/outside.js' },
  { id: 'resource.coal', legacyKey: 'coal', kind: 'raw', sourceFile: 'script/outside.js' },
  { id: 'resource.sulphur', legacyKey: 'sulphur', kind: 'raw', sourceFile: 'script/outside.js' },
  { id: 'resource.steel', legacyKey: 'steel', kind: 'processed', sourceFile: 'script/outside.js' },
  { id: 'resource.bullets', legacyKey: 'bullets', kind: 'ammunition', sourceFile: 'script/outside.js' },
  { id: 'resource.medicine', legacyKey: 'medicine', kind: 'consumable', sourceFile: 'script/room.js' },
  { id: 'resource.energy-cell', legacyKey: 'energy cell', kind: 'ammunition', sourceFile: 'script/room.js' },
  { id: 'resource.grenade', legacyKey: 'grenade', kind: 'consumable', sourceFile: 'script/room.js' },
  { id: 'resource.bolas', legacyKey: 'bolas', kind: 'consumable', sourceFile: 'script/room.js' },
  { id: 'resource.alien-alloy', legacyKey: 'alien alloy', kind: 'advanced', sourceFile: 'script/room.js' },
  { id: 'resource.hypo', legacyKey: 'hypo', kind: 'consumable', sourceFile: 'script/fabricator.js' },
  { id: 'resource.stim', legacyKey: 'stim', kind: 'consumable', sourceFile: 'script/fabricator.js' },
] satisfies ResourceDefinition[];

export const resourceIdByLegacyKey = Object.fromEntries(
  resources.map(({ id, legacyKey }) => [legacyKey, id]),
) as Record<string, ResourceDefinition['id']>;
