import { z } from 'zod';
import { AmountsSchema, FixedCostSchema, StableIdSchema } from '../game-data/schema.js';

export const LocalizedTextSchema = z.object({
  en: z.string().min(1),
  uk: z.string().min(1),
});

export const UnlockConditionSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('has-building'), buildingId: StableIdSchema }),
  z.object({ kind: z.literal('has-resource'), resourceId: StableIdSchema }),
  z.object({ kind: z.literal('has-upgrade'), upgradeId: StableIdSchema }),
]);

const OverlayIdentitySchema = z.object({
  origin: z.enum(['new', 'modified']),
  decisionRef: z.string().url(),
  runtimeKey: z.string().min(1),
  name: LocalizedTextSchema,
});

export const LightRoomBuildingSchema = OverlayIdentitySchema.extend({
  id: StableIdSchema,
  maximum: z.number().int().positive(),
  cost: FixedCostSchema,
  revealWhen: UnlockConditionSchema,
  unlockWhen: UnlockConditionSchema,
  jobs: z.array(StableIdSchema),
  workerSlots: z.record(StableIdSchema, z.number().int().positive()),
  availableMessage: LocalizedTextSchema,
  builtMessage: LocalizedTextSchema,
});

export const ProfessionModifierSchema = z.object({
  when: UnlockConditionSchema,
  flows: AmountsSchema,
});

export const LightRoomProfessionSchema = OverlayIdentitySchema.extend({
  id: StableIdSchema,
  requiresBuildingId: StableIdSchema,
  maximumWorkers: z.number().int().positive(),
  intervalSeconds: z.number().positive(),
  flows: AmountsSchema,
  modifiers: z.array(ProfessionModifierSchema).default([]),
});

export const LightRoomUpgradeSchema = OverlayIdentitySchema.extend({
  id: StableIdSchema,
  affectsId: StableIdSchema,
  unlockWhen: UnlockConditionSchema,
  acquisitionStatus: z.literal('pending-design'),
});

export const LightRoomOverlaySchema = z.object({
  version: z.literal(1),
  buildings: z.array(LightRoomBuildingSchema),
  professions: z.array(LightRoomProfessionSchema),
  upgrades: z.array(LightRoomUpgradeSchema),
});

export type UnlockCondition = z.infer<typeof UnlockConditionSchema>;
export type LightRoomBuilding = z.infer<typeof LightRoomBuildingSchema>;
export type LightRoomProfession = z.infer<typeof LightRoomProfessionSchema>;
export type LightRoomUpgrade = z.infer<typeof LightRoomUpgradeSchema>;
