import type { z } from 'zod';
import type { LightRoomOverlaySchema } from './schema.js';

const GDD = 'https://maxvigil.notion.site/Light-Room-Game-Design-Document-3b581cc4e8c281ebb8dbe7f693972701';
const LOGGER_DECISION = 'https://maxvigil.notion.site/3b581cc4e8c2818685f0ff1c7ac69c1d';

export const lightRoomContent = {
  version: 1,
  buildings: [{
    id: 'building.logger-hut',
    origin: 'new',
    decisionRef: LOGGER_DECISION,
    runtimeKey: 'logger hut',
    name: { en: "Logger's Hut", uk: 'Хатина лісорубів' },
    maximum: 1,
    cost: {
      kind: 'fixed',
      amounts: { 'resource.wood': 500, 'resource.fur': 50, 'resource.leather': 20 },
    },
    revealWhen: { kind: 'has-building', buildingId: 'building.tannery' },
    unlockWhen: { kind: 'has-building', buildingId: 'building.tannery' },
    jobs: ['profession.logger'],
    workerSlots: { 'profession.logger': 2 },
    availableMessage: {
      en: "the builder says a logger's hut would keep the woodpile growing",
      uk: 'будівельниця каже, що хатина лісорубів допоможе стабільно поповнювати запас деревини',
    },
    builtMessage: {
      en: "the logger's hut stands at the forest edge",
      uk: 'хатина лісорубів стоїть на краю лісу',
    },
  }],
  professions: [{
    id: 'profession.logger',
    origin: 'new',
    decisionRef: LOGGER_DECISION,
    runtimeKey: 'logger',
    name: { en: 'logger', uk: 'лісоруб' },
    requiresBuildingId: 'building.logger-hut',
    maximumWorkers: 2,
    intervalSeconds: 10,
    flows: { 'resource.wood': 4 },
    modifiers: [{
      when: { kind: 'has-upgrade', upgradeId: 'upgrade.iron-axes' },
      flows: { 'resource.wood': 8 },
    }],
  }],
  professionPatches: [{
    origin: 'modified',
    decisionRef: GDD,
    targetProfessionId: 'profession.hunter',
    intervalSeconds: 10,
    randomFinds: [
      { resourceId: 'resource.scales', chance: 0.1, amount: 1 },
      { resourceId: 'resource.teeth', chance: 0.1, amount: 1 },
    ],
  }],
  upgrades: [{
    id: 'upgrade.iron-axes',
    origin: 'new',
    decisionRef: GDD,
    runtimeKey: 'iron axes',
    name: { en: 'iron axes', uk: 'залізні сокири' },
    affectsId: 'profession.logger',
    unlockWhen: { kind: 'has-resource', resourceId: 'resource.iron' },
    acquisitionStatus: 'pending-design',
  }],
} satisfies z.input<typeof LightRoomOverlaySchema>;
