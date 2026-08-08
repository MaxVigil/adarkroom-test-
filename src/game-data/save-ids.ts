import { z } from 'zod';
import { baseline } from './index.js';

export const CURRENT_CATALOG_SAVE_VERSION = 1;

export const CatalogSaveSchema = z.object({
  version: z.literal(CURRENT_CATALOG_SAVE_VERSION),
  stores: z.record(z.string(), z.number().nonnegative()).default({}),
  buildings: z.record(z.string(), z.number().int().nonnegative()).default({}),
  workers: z.record(z.string(), z.number().int().nonnegative()).default({}),
  items: z.record(z.string(), z.number().int().nonnegative()).default({}),
  perks: z.record(z.string(), z.boolean()).default({}),
  blueprints: z.record(z.string(), z.boolean()).default({}),
});

export type CatalogSave = z.infer<typeof CatalogSaveSchema>;

function indexLegacyKeys<T extends { id: string; legacyKey: string }>(entities: readonly T[]): Record<string, string> {
  return Object.fromEntries(entities.map(({ legacyKey, id }) => [legacyKey, id]));
}

export const legacySaveAliases = {
  stores: indexLegacyKeys([...baseline.resources, ...baseline.items]),
  buildings: indexLegacyKeys(baseline.buildings),
  workers: indexLegacyKeys(baseline.professions),
  perks: indexLegacyKeys(baseline.perks),
  blueprints: indexLegacyKeys(baseline.blueprints),
} as const;

function migrateRecord(
  input: Readonly<Record<string, number | boolean>> | undefined,
  aliases: Readonly<Record<string, string>>,
): Record<string, number | boolean> {
  return Object.fromEntries(
    Object.entries(input ?? {}).map(([legacyKey, value]) => [aliases[legacyKey] ?? legacyKey, value]),
  );
}

export function migrateLegacyState(input: {
  stores?: Record<string, number>;
  game?: { buildings?: Record<string, number>; workers?: Record<string, number> };
  character?: { perks?: Record<string, boolean>; blueprints?: Record<string, boolean> };
}): CatalogSave {
  const storesAndItems = migrateRecord(input.stores, legacySaveAliases.stores);
  const storeIds = new Set(baseline.resources.map(({ id }) => id));

  return CatalogSaveSchema.parse({
    version: CURRENT_CATALOG_SAVE_VERSION,
    stores: Object.fromEntries(Object.entries(storesAndItems).filter(([id]) => storeIds.has(id))),
    items: Object.fromEntries(Object.entries(storesAndItems).filter(([id]) => !storeIds.has(id))),
    buildings: migrateRecord(input.game?.buildings, legacySaveAliases.buildings),
    workers: migrateRecord(input.game?.workers, legacySaveAliases.workers),
    perks: migrateRecord(input.character?.perks, legacySaveAliases.perks),
    blueprints: migrateRecord(input.character?.blueprints, legacySaveAliases.blueprints),
  });
}
