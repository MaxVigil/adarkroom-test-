import { z } from 'zod';

export const StableIdSchema = z.string().regex(
  /^(resource|building|profession|item|recipe|weapon|enemy|encounter|loot|perk|location|event|scene|blueprint|upgrade|system)\.[a-z0-9]+(?:[.-][a-z0-9]+)*$/,
  'expected a namespaced, lowercase stable ID',
);

export type StableId = z.infer<typeof StableIdSchema>;

const LegacyIdentitySchema = z.object({
  legacyKey: z.string().min(1),
  sourceFile: z.string().startsWith('script/'),
});

export const QuantitySchema = z.number().finite();
export const PositiveQuantitySchema = QuantitySchema.positive();
export const AmountsSchema = z.record(StableIdSchema, QuantitySchema);

export const FixedCostSchema = z.object({
  kind: z.literal('fixed'),
  amounts: z.record(StableIdSchema, PositiveQuantitySchema),
});

export const LinearCostSchema = z.object({
  kind: z.literal('linear'),
  base: z.record(StableIdSchema, PositiveQuantitySchema),
  perExisting: z.record(StableIdSchema, z.number().nonnegative()),
});

export const CostSchema = z.discriminatedUnion('kind', [FixedCostSchema, LinearCostSchema]);

export const ResourceSchema = LegacyIdentitySchema.extend({
  id: StableIdSchema,
  kind: z.enum(['raw', 'processed', 'currency', 'consumable', 'ammunition', 'advanced', 'special']),
});

export const BuildingSchema = LegacyIdentitySchema.extend({
  id: StableIdSchema,
  maximum: z.number().int().positive().optional(),
  cost: CostSchema,
  unlockRuleId: StableIdSchema,
  jobs: z.array(StableIdSchema).default([]),
  populationCapacity: z.number().int().positive().optional(),
  acquisition: z.enum(['construct', 'world']),
});

export const ProfessionSchema = LegacyIdentitySchema.extend({
  id: StableIdSchema,
  intervalSeconds: z.number().positive(),
  requiresBuildingId: StableIdSchema.optional(),
  flows: AmountsSchema,
  assignment: z.enum(['implicit-remainder', 'manual']),
});

export const ItemSchema = LegacyIdentitySchema.extend({
  id: StableIdSchema,
  category: z.enum(['tool', 'weapon', 'armour', 'container', 'upgrade', 'special']),
  maximum: z.number().int().positive().optional(),
  weight: z.number().nonnegative(),
});

export const RecipeSchema = LegacyIdentitySchema.extend({
  id: StableIdSchema,
  outputId: StableIdSchema,
  outputQuantity: z.number().positive().default(1),
  inputs: z.record(StableIdSchema, PositiveQuantitySchema),
  stationId: StableIdSchema.optional(),
  blueprintId: StableIdSchema.optional(),
  acquisition: z.enum(['craft', 'trade', 'fabricate', 'ship-upgrade']),
});

export const WeaponSchema = LegacyIdentitySchema.extend({
  id: StableIdSchema,
  itemId: StableIdSchema.optional(),
  kind: z.enum(['unarmed', 'melee', 'ranged']),
  damage: z.union([z.number().positive(), z.literal('stun')]),
  cooldownSeconds: z.number().positive(),
  ammoCost: z.record(StableIdSchema, PositiveQuantitySchema).default({}),
});

export const PerkSchema = LegacyIdentitySchema.extend({
  id: StableIdSchema,
  effectHandlerId: StableIdSchema,
});

export const BlueprintSchema = LegacyIdentitySchema.extend({
  id: StableIdSchema,
  unlockHandlerId: StableIdSchema,
  recipeId: StableIdSchema,
});

export const LocationSchema = LegacyIdentitySchema.extend({
  id: StableIdSchema,
  tile: z.string().length(1),
  count: z.number().int().nonnegative(),
  minRadius: z.number().nonnegative(),
  maxRadius: z.number().nonnegative(),
  eventId: StableIdSchema,
  conditional: z.boolean().default(false),
});

export const EventMetadataSchema = LegacyIdentitySchema.extend({
  id: StableIdSchema,
  legacyRef: z.string().min(1),
  handlerId: StableIdSchema,
  migrationStatus: z.literal('legacy-handler'),
  sceneIds: z.array(StableIdSchema).default([]),
});

export const SceneMetadataSchema = LegacyIdentitySchema.extend({
  id: StableIdSchema,
  eventId: StableIdSchema,
});

export const EnemySchema = LegacyIdentitySchema.extend({
  id: StableIdSchema,
});

export const CombatEncounterSchema = LegacyIdentitySchema.extend({
  id: StableIdSchema,
  eventId: StableIdSchema,
  sceneId: StableIdSchema,
  enemyId: StableIdSchema,
  damage: z.number().nonnegative(),
  hitChance: z.number().min(0).max(1),
  attackDelaySeconds: z.number().positive(),
  health: z.number().positive(),
  ranged: z.boolean().default(false),
});

const LootRollSchema = z.object({
  min: z.number().int().nonnegative(),
  maxExclusive: z.number().int().positive(),
  chance: z.number().min(0).max(1),
});

export const LootEntrySchema = LootRollSchema.extend({
  targetId: StableIdSchema,
  bonus: LootRollSchema.optional(),
});

export const LootTableSchema = LegacyIdentitySchema.extend({
  id: StableIdSchema,
  eventId: StableIdSchema,
  sceneId: StableIdSchema,
  entries: z.array(LootEntrySchema),
});

export const BaselineSchema = z.object({
  version: z.literal(1),
  source: z.literal('A Dark Room browser repository'),
  resources: z.array(ResourceSchema),
  buildings: z.array(BuildingSchema),
  professions: z.array(ProfessionSchema),
  items: z.array(ItemSchema),
  recipes: z.array(RecipeSchema),
  weapons: z.array(WeaponSchema),
  perks: z.array(PerkSchema),
  blueprints: z.array(BlueprintSchema),
  locations: z.array(LocationSchema),
  events: z.array(EventMetadataSchema),
  scenes: z.array(SceneMetadataSchema),
  enemies: z.array(EnemySchema),
  combatEncounters: z.array(CombatEncounterSchema),
  lootTables: z.array(LootTableSchema),
});

export type ResourceDefinition = z.input<typeof ResourceSchema>;
export type BuildingDefinition = z.input<typeof BuildingSchema>;
export type ProfessionDefinition = z.input<typeof ProfessionSchema>;
export type ItemDefinition = z.input<typeof ItemSchema>;
export type RecipeDefinition = z.input<typeof RecipeSchema>;
export type WeaponDefinition = z.input<typeof WeaponSchema>;
export type PerkDefinition = z.input<typeof PerkSchema>;
export type BlueprintDefinition = z.input<typeof BlueprintSchema>;
export type LocationDefinition = z.input<typeof LocationSchema>;
export type EventMetadata = z.input<typeof EventMetadataSchema>;
export type SceneMetadata = z.input<typeof SceneMetadataSchema>;
export type EnemyDefinition = z.input<typeof EnemySchema>;
export type CombatEncounterDefinition = z.input<typeof CombatEncounterSchema>;
export type LootTableDefinition = z.input<typeof LootTableSchema>;
