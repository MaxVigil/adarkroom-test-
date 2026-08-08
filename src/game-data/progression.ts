import type { PerkDefinition } from './schema.js';

const ENGINE = 'script/engine.js';

export const perks = [
  { id: 'perk.boxer', legacyKey: 'boxer', sourceFile: ENGINE, effectHandlerId: 'system.perk.boxer' },
  { id: 'perk.martial-artist', legacyKey: 'martial artist', sourceFile: ENGINE, effectHandlerId: 'system.perk.martial-artist' },
  { id: 'perk.unarmed-master', legacyKey: 'unarmed master', sourceFile: ENGINE, effectHandlerId: 'system.perk.unarmed-master' },
  { id: 'perk.barbarian', legacyKey: 'barbarian', sourceFile: ENGINE, effectHandlerId: 'system.perk.barbarian' },
  { id: 'perk.slow-metabolism', legacyKey: 'slow metabolism', sourceFile: ENGINE, effectHandlerId: 'system.perk.slow-metabolism' },
  { id: 'perk.desert-rat', legacyKey: 'desert rat', sourceFile: ENGINE, effectHandlerId: 'system.perk.desert-rat' },
  { id: 'perk.evasive', legacyKey: 'evasive', sourceFile: ENGINE, effectHandlerId: 'system.perk.evasive' },
  { id: 'perk.precise', legacyKey: 'precise', sourceFile: ENGINE, effectHandlerId: 'system.perk.precise' },
  { id: 'perk.scout', legacyKey: 'scout', sourceFile: ENGINE, effectHandlerId: 'system.perk.scout' },
  { id: 'perk.stealthy', legacyKey: 'stealthy', sourceFile: ENGINE, effectHandlerId: 'system.perk.stealthy' },
  { id: 'perk.gastronome', legacyKey: 'gastronome', sourceFile: ENGINE, effectHandlerId: 'system.perk.gastronome' },
] satisfies PerkDefinition[];
