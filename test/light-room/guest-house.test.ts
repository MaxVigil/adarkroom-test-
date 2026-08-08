import { describe, expect, it } from 'vitest';
import {
  arriveGuest,
  caretakerAdjustedVisitDelay,
  completeGuestVisit,
  emptyGuestHouseState,
  guestHouseDesign,
  reserveHospitalitySupplies,
} from '../../src/light-room/guest-house.js';

describe('Guest House approved functional model', () => {
  it('catalogues the approved building, caretaker, rooms, and inherited guest offers', () => {
    expect(guestHouseDesign).toMatchObject({
      acquisitionStatus: 'pending-balance',
      building: {
        id: 'building.guest-house',
        unlockWhen: { kind: 'has-item', itemId: 'item.compass' },
        baseRooms: 1,
        maximumRooms: 2,
      },
      caretaker: {
        id: 'profession.guest-caretaker',
        maximumWorkers: 1,
      },
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
      state: { rooms: [master], queue: [scout] },
    });
    expect(completeGuestVisit(second.state, 'master-1', 1)).toEqual({ rooms: [scout], queue: [] });
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
});
