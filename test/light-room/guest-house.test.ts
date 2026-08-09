import { describe, expect, it } from 'vitest';
import {
  arriveGuest,
  caretakerAdjustedVisitDelay,
  completeGuestVisit,
  discountedServiceCost,
  emptyGuestHouseState,
  guestHouseDesign,
  reserveHospitalitySupplies,
} from '../../src/light-room/guest-house.js';

describe('Guest House approved functional model', () => {
  it('catalogues the approved building, caretaker, rooms, and inherited guest offers', () => {
    expect(guestHouseDesign).toMatchObject({
      acquisitionStatus: 'approved',
      building: {
        id: 'building.guest-house',
        unlockWhen: { kind: 'has-item', itemId: 'item.compass' },
        baseRooms: 1,
        maximumRooms: 2,
        cost: { 'resource.wood': 1000, 'resource.fur': 100, 'resource.leather': 50 },
      },
      caretaker: {
        id: 'profession.guest-caretaker',
        maximumWorkers: 1,
        reserveUnitsPerCycle: 2,
      },
      queueCapacity: 1,
      visitIntervalSeconds: { min: 1200, max: 1800 },
    });
    const master = guestHouseDesign.guests.find(({ id }) => id === 'guest.wandering-master')!;
    expect(master.services[0]?.cost).toEqual({
      'resource.cured-meat': 100,
      'resource.fur': 100,
      'item.torch': 1,
    });
  });

  it('keeps arriving guests in a room or persistent FIFO queue and promotes the next visit', () => {
    const master = { visitId: 'master-1', guestId: 'guest.wandering-master' };
    const scout = { visitId: 'scout-1', guestId: 'guest.scout' };
    const first = arriveGuest(emptyGuestHouseState(), master, 1, 1);
    expect(first.outcome).toBe('room');
    const second = arriveGuest(first.state, scout, 1, 1);
    expect(second).toEqual({
      outcome: 'queued',
      state: {
        rooms: [master],
        queue: [scout],
        waiting: [],
        reserved: {},
        arrivalCursor: 0,
      },
    });
    expect(completeGuestVisit(second.state, 'master-1', 1)).toEqual({
      rooms: [scout],
      queue: [],
      waiting: [],
      reserved: {},
      arrivalCursor: 0,
    });
  });

  it('reserves existing hospitality supplies without creating resources', () => {
    expect(reserveHospitalitySupplies(
      { 'resource.cured-meat': 5, 'resource.fur': 3 },
      {},
      { 'resource.cured-meat': 100, 'resource.fur': 100, 'item.torch': 1 },
      6,
    )).toEqual({
      stores: { 'resource.cured-meat': 0, 'resource.fur': 2 },
      reserved: { 'resource.cured-meat': 5, 'resource.fur': 1 },
    });
  });

  it('supports a bounded caretaker visit reduction once the balance value is approved', () => {
    expect(caretakerAdjustedVisitDelay(1800, 0.25)).toBe(1350);
    expect(caretakerAdjustedVisitDelay(1800, 2)).toBe(1);
  });

  it('caps the pantry at a modest ten-percent discount and never removes indivisible costs', () => {
    expect(discountedServiceCost({
      'resource.cured-meat': 100,
      'resource.fur': 100,
      'item.torch': 1,
    }, 0.1)).toEqual({
      'resource.cured-meat': 90,
      'resource.fur': 90,
      'item.torch': 1,
    });
    expect(discountedServiceCost({ 'resource.fur': 100 }, 0.9))
      .toEqual({ 'resource.fur': 50 });
  });
});
