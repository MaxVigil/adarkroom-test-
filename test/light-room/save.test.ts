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
});
