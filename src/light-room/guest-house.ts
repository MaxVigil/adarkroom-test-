import { z } from 'zod';
import { AmountsSchema, StableIdSchema } from '../game-data/schema.js';
import { LocalizedTextSchema, UnlockConditionSchema } from './schema.js';

const GDD = 'https://maxvigil.notion.site/Light-Room-Game-Design-Document-3b581cc4e8c281ebb8dbe7f693972701';

const GuestServiceSchema = z.object({
  id: z.string().min(1),
  cost: AmountsSchema,
  grants: StableIdSchema.optional(),
});

const GuestDefinitionSchema = z.object({
  id: StableIdSchema,
  name: LocalizedTextSchema,
  inheritedEventTitle: z.string().min(1),
  services: z.array(GuestServiceSchema).min(1),
});

export const GuestHouseDesignSchema = z.object({
  decisionRef: z.string().url(),
  acquisitionStatus: z.literal('pending-balance'),
  building: z.object({
    id: StableIdSchema,
    runtimeKey: z.string().min(1),
    name: LocalizedTextSchema,
    unlockWhen: UnlockConditionSchema,
    baseRooms: z.literal(1),
    maximumRooms: z.literal(2),
  }),
  caretaker: z.object({
    id: StableIdSchema,
    runtimeKey: z.string().min(1),
    name: LocalizedTextSchema,
    maximumWorkers: z.literal(1),
    effects: z.tuple([
      z.literal('shorten-next-visit'),
      z.literal('reserve-hospitality-supplies'),
      z.literal('reveal-current-offer'),
    ]),
  }),
  guests: z.array(GuestDefinitionSchema).min(1),
  unresolved: z.object({
    buildingCost: z.literal(true),
    visitInterval: z.literal(true),
    queueCapacity: z.literal(true),
    caretakerReserveRate: z.literal(true),
  }),
});

export const guestHouseDesign = GuestHouseDesignSchema.parse({
  decisionRef: GDD,
  acquisitionStatus: 'pending-balance',
  building: {
    id: 'building.guest-house',
    runtimeKey: 'guest house',
    name: { en: 'Guest House', uk: 'Гостьовий будинок' },
    unlockWhen: { kind: 'has-item', itemId: 'item.compass' },
    baseRooms: 1,
    maximumRooms: 2,
  },
  caretaker: {
    id: 'profession.guest-caretaker',
    runtimeKey: 'caretaker',
    name: { en: 'caretaker', uk: 'доглядач' },
    maximumWorkers: 1,
    effects: ['shorten-next-visit', 'reserve-hospitality-supplies', 'reveal-current-offer'],
  },
  guests: [
    {
      id: 'guest.wandering-master',
      name: { en: 'The Master', uk: 'Майстер' },
      inheritedEventTitle: 'The Master',
      services: [
        { id: 'lesson.evasion', cost: { 'resource.cured-meat': 100, 'resource.fur': 100, 'item.torch': 1 }, grants: 'perk.evasive' },
        { id: 'lesson.precision', cost: { 'resource.cured-meat': 100, 'resource.fur': 100, 'item.torch': 1 }, grants: 'perk.precise' },
        { id: 'lesson.force', cost: { 'resource.cured-meat': 100, 'resource.fur': 100, 'item.torch': 1 }, grants: 'perk.barbarian' },
      ],
    },
    {
      id: 'guest.scout',
      name: { en: 'The Scout', uk: 'Розвідниця' },
      inheritedEventTitle: 'The Scout',
      services: [
        { id: 'service.map', cost: { 'resource.fur': 200, 'resource.scales': 10 } },
        { id: 'lesson.scouting', cost: { 'resource.fur': 1000, 'resource.scales': 50, 'resource.teeth': 20 }, grants: 'perk.scout' },
      ],
    },
  ],
  unresolved: {
    buildingCost: true,
    visitInterval: true,
    queueCapacity: true,
    caretakerReserveRate: true,
  },
});

export interface GuestVisit {
  visitId: string;
  guestId: string;
}

export interface GuestHouseState {
  rooms: GuestVisit[];
  queue: GuestVisit[];
}

export const GuestHouseStateSchema = z.object({
  rooms: z.array(z.object({ visitId: z.string().min(1), guestId: StableIdSchema })).default([]),
  queue: z.array(z.object({ visitId: z.string().min(1), guestId: StableIdSchema })).default([]),
}).default({ rooms: [], queue: [] });

export function emptyGuestHouseState(): GuestHouseState {
  return { rooms: [], queue: [] };
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
  return { rooms, queue };
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
