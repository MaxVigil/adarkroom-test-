import { describe, expect, it } from 'vitest';
import { migrateLightRoomState } from '../../src/light-room/save.js';

describe('Light Room catalog save migration', () => {
  it('loads inherited saves without requiring new content keys', () => {
    expect(migrateLightRoomState({
      stores: { wood: 100 },
      game: { buildings: { tannery: 1 }, workers: { tanner: 1 } },
    })).toMatchObject({
      stores: { 'resource.wood': 100 },
      buildings: { 'building.tannery': 1 },
      workers: { 'profession.tanner': 1 },
      upgrades: {},
    });
  });

  it('maps new runtime keys to stable Light Room IDs', () => {
    expect(migrateLightRoomState({
      game: {
        buildings: { 'logger hut': 1 },
        workers: { logger: 2 },
        upgrades: { 'iron axes': true },
      },
    })).toMatchObject({
      buildings: { 'building.logger-hut': 1 },
      workers: { 'profession.logger': 2 },
      upgrades: { 'upgrade.iron-axes': true },
    });
  });

  it('preserves pending Guest House visits and maps its future runtime aliases', () => {
    expect(migrateLightRoomState({
      game: {
        buildings: { 'guest house': 1 },
        workers: { caretaker: 1 },
        guestHouse: {
          rooms: [{ visitId: 'master-1', guestId: 'guest.wandering-master' }],
          queue: [{ visitId: 'scout-1', guestId: 'guest.scout' }],
        },
      },
    })).toMatchObject({
      buildings: { 'building.guest-house': 1 },
      workers: { 'profession.guest-caretaker': 1 },
      guestHouse: {
        rooms: [{ visitId: 'master-1', guestId: 'guest.wandering-master' }],
        queue: [{ visitId: 'scout-1', guestId: 'guest.scout' }],
      },
    });
  });
});
