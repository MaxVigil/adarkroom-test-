import { z } from 'zod';
import { CatalogSaveSchema, migrateLegacyState } from '../game-data/save-ids.js';
import { guestHouseDesign, GuestHouseStateSchema } from './guest-house.js';
import { lightRoomOverlay } from './overlay.js';

export const LightRoomCatalogSaveSchema = CatalogSaveSchema.extend({
  upgrades: z.record(z.string(), z.boolean()).default({}),
  guestHouse: GuestHouseStateSchema,
});

export type LightRoomCatalogSave = z.infer<typeof LightRoomCatalogSaveSchema>;

const buildingAliases = Object.fromEntries([
  ...lightRoomOverlay.buildings.map(({ runtimeKey, id }) => [runtimeKey, id]),
  [guestHouseDesign.building.runtimeKey, guestHouseDesign.building.id],
]);
const workerAliases = Object.fromEntries([
  ...lightRoomOverlay.professions.map(({ runtimeKey, id }) => [runtimeKey, id]),
  [guestHouseDesign.caretaker.runtimeKey, guestHouseDesign.caretaker.id],
]);
const upgradeAliases = Object.fromEntries(lightRoomOverlay.upgrades.map(({ runtimeKey, id }) => [runtimeKey, id]));

const remap = <T>(values: Record<string, T>, aliases: Record<string, string>): Record<string, T> => Object.fromEntries(
  Object.entries(values).map(([key, value]) => [aliases[key] ?? key, value]),
);

export function migrateLightRoomState(input: {
  stores?: Record<string, number>;
  game?: {
    buildings?: Record<string, number>;
    workers?: Record<string, number>;
    upgrades?: Record<string, boolean>;
    guestHouse?: unknown;
  };
  character?: { perks?: Record<string, boolean>; blueprints?: Record<string, boolean> };
}): LightRoomCatalogSave {
  const inherited = migrateLegacyState(input);
  return LightRoomCatalogSaveSchema.parse({
    ...inherited,
    buildings: remap(inherited.buildings, buildingAliases),
    workers: remap(inherited.workers, workerAliases),
    upgrades: remap(input.game?.upgrades ?? {}, upgradeAliases),
    guestHouse: input.game?.guestHouse,
  });
}
