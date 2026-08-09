import { z } from 'zod';
import { AmountsSchema, StableIdSchema } from '../game-data/schema.js';
import {
  type LightRoomBuilding,
  type LightRoomProfession,
  type LightRoomUpgrade,
  LocalizedTextSchema,
  UnlockConditionSchema,
} from './schema.js';

const GDD = 'https://maxvigil.notion.site/Light-Room-Game-Design-Document-3b581cc4e8c281ebb8dbe7f693972701';

const GuestServiceSchema = z.object({
  id: z.string().min(1),
  name: LocalizedTextSchema,
  cost: AmountsSchema,
  action: z.enum(['grant-perk', 'apply-map']),
  grants: StableIdSchema.optional(),
});

const GuestDefinitionSchema = z.object({
  id: StableIdSchema,
  name: LocalizedTextSchema,
  inheritedEventTitle: z.string().min(1),
  services: z.array(GuestServiceSchema).min(1),
});

export const guestHouseBuilding = {
  id: 'building.guest-house',
  origin: 'new',
  decisionRef: GDD,
  runtimeKey: 'guest house',
  name: { en: 'Guest House', uk: 'Гостьовий будинок' },
  maximum: 1,
  cost: {
    kind: 'fixed',
    amounts: { 'resource.wood': 1000, 'resource.fur': 100, 'resource.leather': 50 },
  },
  revealWhen: { kind: 'has-item', itemId: 'item.compass' },
  unlockWhen: { kind: 'has-item', itemId: 'item.compass' },
  jobs: ['profession.guest-caretaker'],
  workerSlots: { 'profession.guest-caretaker': 1 },
  availableMessage: {
    en: 'the builder says travellers need a place where they can wait',
    uk: 'будівниця каже, що мандрівникам потрібне місце, де вони зможуть зачекати',
  },
  builtMessage: {
    en: 'the guest house is ready; no teacher needs to be turned away',
    uk: 'гостьовий будинок готовий; тепер жодного вчителя не доведеться проганяти',
  },
} satisfies LightRoomBuilding;

export const guestCaretakerProfession = {
  id: 'profession.guest-caretaker',
  origin: 'new',
  decisionRef: GDD,
  runtimeKey: 'caretaker',
  name: { en: 'caretaker', uk: 'доглядач' },
  requiresBuildingId: 'building.guest-house',
  maximumWorkers: 1,
  intervalSeconds: 10,
  flows: {},
  modifiers: [],
} satisfies LightRoomProfession;

export const guestHouseUpgrades = [{
  id: 'upgrade.guest-second-room',
  origin: 'new',
  decisionRef: GDD,
  runtimeKey: 'guest second room',
  name: { en: 'second guest room', uk: 'друга кімната для гостей' },
  affectsId: 'building.guest-house',
  unlockWhen: { kind: 'has-building', buildingId: 'building.guest-house' },
  acquisitionStatus: 'approved',
  cost: { kind: 'fixed', amounts: { 'resource.wood': 600, 'resource.leather': 100 } },
  craftLocation: 'building',
  requiresBuildingIds: ['building.guest-house'],
  availableMessage: {
    en: 'the guest house has space for another room',
    uk: 'у гостьовому будинку можна облаштувати ще одну кімнату',
  },
  builtMessage: {
    en: 'two travellers can now stay at once',
    uk: 'тепер одночасно можуть зупинитися двоє мандрівників',
  },
  effect: 'guest-second-room',
}, {
  id: 'upgrade.guest-pantry',
  origin: 'new',
  decisionRef: GDD,
  runtimeKey: 'guest pantry',
  name: { en: 'guest pantry', uk: 'комора для гостей' },
  affectsId: 'building.guest-house',
  unlockWhen: { kind: 'has-building', buildingId: 'building.guest-house' },
  acquisitionStatus: 'approved',
  cost: {
    kind: 'fixed',
    amounts: { 'resource.wood': 500, 'resource.leather': 100, 'resource.cured-meat': 50 },
  },
  craftLocation: 'building',
  requiresBuildingIds: ['building.guest-house'],
  availableMessage: {
    en: 'a pantry would keep hospitality supplies set aside',
    uk: 'комора допоможе завчасно відкладати припаси для гостинності',
  },
  builtMessage: {
    en: 'carefully stored supplies make every visit a little easier',
    uk: 'завчасно складені припаси трохи полегшують кожен візит',
  },
  effect: 'guest-pantry',
}, {
  id: 'upgrade.guest-notice-board',
  origin: 'new',
  decisionRef: GDD,
  runtimeKey: 'guest notice board',
  name: { en: 'travellers notice board', uk: 'дошка оголошень для мандрівників' },
  affectsId: 'building.guest-house',
  unlockWhen: { kind: 'has-building', buildingId: 'building.guest-house' },
  acquisitionStatus: 'approved',
  cost: {
    kind: 'fixed',
    amounts: { 'resource.wood': 400, 'resource.leather': 50, 'resource.scales': 10 },
  },
  craftLocation: 'building',
  requiresBuildingIds: ['building.guest-house'],
  availableMessage: {
    en: 'a notice board could guide travellers toward the village',
    uk: 'дошка оголошень допоможе мандрівникам знаходити поселення',
  },
  builtMessage: {
    en: 'word of the guest house travels farther now',
    uk: 'тепер звістка про гостьовий будинок шириться далі',
  },
  effect: 'guest-notice-board',
}] satisfies LightRoomUpgrade[];

export const GuestHouseDesignSchema = z.object({
  decisionRef: z.string().url(),
  acquisitionStatus: z.literal('approved'),
  building: z.object({
    id: StableIdSchema,
    runtimeKey: z.string().min(1),
    name: LocalizedTextSchema,
    unlockWhen: UnlockConditionSchema,
    cost: AmountsSchema,
    baseRooms: z.literal(1),
    maximumRooms: z.literal(2),
  }),
  caretaker: z.object({
    id: StableIdSchema,
    runtimeKey: z.string().min(1),
    name: LocalizedTextSchema,
    maximumWorkers: z.literal(1),
    intervalSeconds: z.literal(10),
    visitReductionFraction: z.literal(0.25),
    reserveUnitsPerCycle: z.literal(2),
    pantryReserveUnitsPerCycle: z.literal(3),
  }),
  queueCapacity: z.literal(1),
  visitIntervalSeconds: z.object({ min: z.literal(1200), max: z.literal(1800) }),
  pantryDiscountFraction: z.literal(0.1),
  noticeBoardVisitReductionFraction: z.literal(0.2),
  upgradeIds: z.object({
    secondRoom: StableIdSchema,
    pantry: StableIdSchema,
    noticeBoard: StableIdSchema,
  }),
  guests: z.array(GuestDefinitionSchema).min(1),
});

export const guestHouseDesign = GuestHouseDesignSchema.parse({
  decisionRef: GDD,
  acquisitionStatus: 'approved',
  building: {
    id: guestHouseBuilding.id,
    runtimeKey: guestHouseBuilding.runtimeKey,
    name: guestHouseBuilding.name,
    unlockWhen: guestHouseBuilding.unlockWhen,
    cost: guestHouseBuilding.cost.amounts,
    baseRooms: 1,
    maximumRooms: 2,
  },
  caretaker: {
    id: guestCaretakerProfession.id,
    runtimeKey: guestCaretakerProfession.runtimeKey,
    name: guestCaretakerProfession.name,
    maximumWorkers: 1,
    intervalSeconds: 10,
    visitReductionFraction: 0.25,
    reserveUnitsPerCycle: 2,
    pantryReserveUnitsPerCycle: 3,
  },
  queueCapacity: 1,
  visitIntervalSeconds: { min: 1200, max: 1800 },
  pantryDiscountFraction: 0.1,
  noticeBoardVisitReductionFraction: 0.2,
  upgradeIds: {
    secondRoom: 'upgrade.guest-second-room',
    pantry: 'upgrade.guest-pantry',
    noticeBoard: 'upgrade.guest-notice-board',
  },
  guests: [
    {
      id: 'guest.wandering-master',
      name: { en: 'The Master', uk: 'Майстер' },
      inheritedEventTitle: 'The Master',
      services: [
        {
          id: 'lesson.evasion',
          name: { en: 'learn evasion', uk: 'навчитися ухилятися' },
          cost: { 'resource.cured-meat': 100, 'resource.fur': 100, 'item.torch': 1 },
          action: 'grant-perk',
          grants: 'perk.evasive',
        },
        {
          id: 'lesson.precision',
          name: { en: 'learn precision', uk: 'навчитися точності' },
          cost: { 'resource.cured-meat': 100, 'resource.fur': 100, 'item.torch': 1 },
          action: 'grant-perk',
          grants: 'perk.precise',
        },
        {
          id: 'lesson.force',
          name: { en: 'learn force', uk: 'навчитися сили' },
          cost: { 'resource.cured-meat': 100, 'resource.fur': 100, 'item.torch': 1 },
          action: 'grant-perk',
          grants: 'perk.barbarian',
        },
      ],
    },
    {
      id: 'guest.scout',
      name: { en: 'The Scout', uk: 'Розвідниця' },
      inheritedEventTitle: 'The Scout',
      services: [
        {
          id: 'service.map',
          name: { en: 'buy map', uk: 'купити мапу' },
          cost: { 'resource.fur': 200, 'resource.scales': 10 },
          action: 'apply-map',
        },
        {
          id: 'lesson.scouting',
          name: { en: 'learn scouting', uk: 'навчитися розвідки' },
          cost: { 'resource.fur': 1000, 'resource.scales': 50, 'resource.teeth': 20 },
          action: 'grant-perk',
          grants: 'perk.scout',
        },
      ],
    },
  ],
});

export interface GuestVisit {
  visitId: string;
  guestId: string;
}

export interface GuestHouseState {
  rooms: GuestVisit[];
  queue: GuestVisit[];
  waiting: GuestVisit[];
  reserved: Record<string, Record<string, number>>;
  nextVisitSeconds?: number;
  nextGuestId?: string;
  arrivalCursor: number;
}

const GuestVisitSchema = z.object({ visitId: z.string().min(1), guestId: StableIdSchema });

export const GuestHouseStateSchema = z.object({
  rooms: z.array(GuestVisitSchema).default([]),
  queue: z.array(GuestVisitSchema).default([]),
  waiting: z.array(GuestVisitSchema).default([]),
  reserved: z.record(z.string(), z.record(z.string(), z.number().int().nonnegative())).default({}),
  nextVisitSeconds: z.number().nonnegative().optional(),
  nextGuestId: StableIdSchema.optional(),
  arrivalCursor: z.number().int().nonnegative().default(0),
}).default({ rooms: [], queue: [], waiting: [], reserved: {}, arrivalCursor: 0 });

export function emptyGuestHouseState(): GuestHouseState {
  return { rooms: [], queue: [], waiting: [], reserved: {}, arrivalCursor: 0 };
}

export function arriveGuest(
  state: GuestHouseState,
  visit: GuestVisit,
  roomCapacity: number,
  queueCapacity: number,
): { state: GuestHouseState; outcome: 'room' | 'queued' | 'queue-full' } {
  if (state.rooms.some(({ visitId }) => visitId === visit.visitId)
      || state.queue.some(({ visitId }) => visitId === visit.visitId)) {
    return { state, outcome: state.rooms.some(({ visitId }) => visitId === visit.visitId) ? 'room' : 'queued' };
  }
  if (state.rooms.length < roomCapacity) {
    return { state: { ...state, rooms: [...state.rooms, visit] }, outcome: 'room' };
  }
  if (state.queue.length < queueCapacity) {
    return { state: { ...state, queue: [...state.queue, visit] }, outcome: 'queued' };
  }
  return { state, outcome: 'queue-full' };
}

export function completeGuestVisit(
  state: GuestHouseState,
  visitId: string,
  roomCapacity: number,
): GuestHouseState {
  const rooms = state.rooms.filter((visit) => visit.visitId !== visitId);
  const queue = [...state.queue];
  while (rooms.length < roomCapacity && queue.length > 0) rooms.push(queue.shift()!);
  const reserved = { ...state.reserved };
  delete reserved[visitId];
  return { ...state, rooms, queue, reserved };
}

export function discountedServiceCost(
  cost: Record<string, number>,
  discountFraction: number,
): Record<string, number> {
  const fraction = 1 - Math.max(0, Math.min(0.5, discountFraction));
  return Object.fromEntries(Object.entries(cost).map(([id, amount]) => [id, Math.ceil(amount * fraction)]));
}

export function reserveHospitalitySupplies(
  stores: Record<string, number>,
  reserved: Record<string, number>,
  requirement: Record<string, number>,
  unitsPerCycle: number,
): { stores: Record<string, number>; reserved: Record<string, number> } {
  const nextStores = { ...stores };
  const nextReserved = { ...reserved };
  let remaining = Math.max(0, Math.floor(unitsPerCycle));
  for (const [resourceId, required] of Object.entries(requirement)) {
    const needed = Math.max(0, required - (nextReserved[resourceId] ?? 0));
    const moved = Math.min(needed, nextStores[resourceId] ?? 0, remaining);
    if (moved > 0) {
      nextStores[resourceId] = (nextStores[resourceId] ?? 0) - moved;
      nextReserved[resourceId] = (nextReserved[resourceId] ?? 0) + moved;
      remaining -= moved;
    }
    if (remaining === 0) break;
  }
  return { stores: nextStores, reserved: nextReserved };
}

export function caretakerAdjustedVisitDelay(baseSeconds: number, reductionFraction: number): number {
  return Math.max(1, baseSeconds * (1 - Math.max(0, Math.min(1, reductionFraction))));
}
