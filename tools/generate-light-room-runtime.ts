import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { baseline } from '../src/game-data/index.js';
import { guestHouseDesign } from '../src/light-room/guest-house.js';
import { lightRoomOverlay } from '../src/light-room/overlay.js';

const legacyKeyById = new Map(
  [...baseline.resources, ...baseline.buildings, ...baseline.items].map(({ id, legacyKey }) => [id, legacyKey]),
);
const professionKeyById = new Map(
  baseline.professions.map(({ id, legacyKey }) => [id, legacyKey]),
);
const professionRuntimeKey = (id: string) => {
  const key = professionKeyById.get(id);
  if (!key) throw new Error(`No legacy profession runtime key for ${id}`);
  return key;
};

const legacyAmounts = (amounts: Record<string, number>) => Object.fromEntries(
  Object.entries(amounts).map(([id, value]) => {
    const legacyKey = legacyKeyById.get(id);
    if (!legacyKey) throw new Error(`No legacy runtime key for ${id}`);
    return [legacyKey, value];
  }),
);

const runtimeCondition = (condition: { kind: string; buildingId?: string; resourceId?: string; itemId?: string; upgradeId?: string }) => {
  const id = condition.buildingId ?? condition.resourceId ?? condition.itemId ?? condition.upgradeId;
  if (!id) throw new Error(`Condition ${condition.kind} has no target`);
  const upgrade = lightRoomOverlay.upgrades.find(({ id: upgradeId }) => upgradeId === id);
  const building = lightRoomOverlay.buildings.find(({ id: buildingId }) => buildingId === id);
  const key = legacyKeyById.get(id) ?? building?.runtimeKey ?? upgrade?.runtimeKey;
  if (!key) throw new Error(`No runtime key for condition target ${id}`);
  return { kind: condition.kind, key };
};

const runtimeData = {
  version: lightRoomOverlay.version,
  buildings: lightRoomOverlay.buildings.map((building) => ({
    key: building.runtimeKey,
    name: building.name,
    maximum: building.maximum,
    cost: legacyAmounts(building.cost.amounts),
    unlockWhen: runtimeCondition(building.unlockWhen),
    requiresBuilding: building.unlockWhen.kind === 'has-building'
      ? legacyKeyById.get(building.unlockWhen.buildingId)
      : undefined,
    availableMessage: building.availableMessage,
    builtMessage: building.builtMessage,
  })),
  professions: lightRoomOverlay.professions.map((profession) => ({
    key: profession.runtimeKey,
    name: profession.name,
    requiresBuilding: lightRoomOverlay.buildings
      .find(({ id }) => id === profession.requiresBuildingId)?.runtimeKey,
    maximum: profession.maximumWorkers,
    delay: profession.intervalSeconds,
    stores: legacyAmounts(profession.flows),
    modifiers: profession.modifiers.map((modifier) => ({
      upgrade: modifier.when.kind === 'has-upgrade'
        ? lightRoomOverlay.upgrades.find(({ id }) => id === modifier.when.upgradeId)?.runtimeKey
        : undefined,
      stores: legacyAmounts(modifier.flows),
    })),
  })),
  professionPatches: lightRoomOverlay.professionPatches.map((patch) => ({
    key: professionRuntimeKey(patch.targetProfessionId),
    delay: patch.intervalSeconds,
    randomFinds: patch.randomFinds.map((find) => ({
      store: legacyKeyById.get(find.resourceId),
      chance: find.chance,
      amount: find.amount,
    })),
  })),
  upgrades: lightRoomOverlay.upgrades.map((upgrade) => ({
    key: upgrade.runtimeKey,
    name: upgrade.name,
    acquisitionStatus: upgrade.acquisitionStatus,
    cost: upgrade.cost ? legacyAmounts(upgrade.cost.amounts) : undefined,
    craftLocation: upgrade.craftLocation,
    requiresBuildings: upgrade.requiresBuildingIds.map((id) => {
      const key = legacyKeyById.get(id)
        ?? lightRoomOverlay.buildings.find(({ id: buildingId }) => buildingId === id)?.runtimeKey;
      if (!key) throw new Error(`No runtime building key for ${id}`);
      return key;
    }),
    unlockWhen: runtimeCondition(upgrade.unlockWhen),
    availableMessage: upgrade.availableMessage,
    builtMessage: upgrade.builtMessage,
    effect: upgrade.effect,
  })),
  guestHouse: {
    buildingKey: guestHouseDesign.building.runtimeKey,
    name: guestHouseDesign.building.name,
    caretakerKey: guestHouseDesign.caretaker.runtimeKey,
    queueCapacity: guestHouseDesign.queueCapacity,
    visitIntervalSeconds: guestHouseDesign.visitIntervalSeconds,
    caretaker: {
      intervalSeconds: guestHouseDesign.caretaker.intervalSeconds,
      visitReductionFraction: guestHouseDesign.caretaker.visitReductionFraction,
      reserveUnitsPerCycle: guestHouseDesign.caretaker.reserveUnitsPerCycle,
      pantryReserveUnitsPerCycle: guestHouseDesign.caretaker.pantryReserveUnitsPerCycle,
    },
    pantryDiscountFraction: guestHouseDesign.pantryDiscountFraction,
    noticeBoardVisitReductionFraction: guestHouseDesign.noticeBoardVisitReductionFraction,
    upgrades: Object.fromEntries(Object.entries(guestHouseDesign.upgradeIds).map(([name, id]) => {
      const upgrade = lightRoomOverlay.upgrades.find(({ id: upgradeId }) => upgradeId === id);
      if (!upgrade) throw new Error(`No overlay upgrade for ${id}`);
      return [name, upgrade.runtimeKey];
    })),
    guests: guestHouseDesign.guests.map((guest) => ({
      key: guest.id,
      name: guest.name,
      inheritedEventTitle: guest.inheritedEventTitle,
      services: guest.services.map((service) => ({
        key: service.id,
        name: service.name,
        cost: legacyAmounts(service.cost),
        action: service.action,
        grants: service.grants
          ? baseline.perks.find(({ id }) => id === service.grants)?.legacyKey
          : undefined,
      })),
    })),
  },
};

const output = `// Generated by tools/generate-light-room-runtime.ts. Do not edit by hand.\n` +
  `var LightRoomData = ${JSON.stringify(runtimeData, null, 2)};\n`;

const generatedDirectory = resolve(process.cwd(), 'script/generated');
mkdirSync(generatedDirectory, { recursive: true });
writeFileSync(resolve(generatedDirectory, 'light_room_content.js'), output);
console.log(`Generated ${runtimeData.buildings.length} Light Room buildings and ${runtimeData.professions.length} professions.`);
