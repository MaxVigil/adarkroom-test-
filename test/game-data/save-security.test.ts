import { describe, expect, it } from 'vitest';
import { loadLegacy } from './legacy-loader.js';

type StorageLike = Record<string, string>;
type SaveManagerApi = {
  save: (storage: StorageLike, state: Record<string, unknown>) => void;
  importSave: (storage: StorageLike, serialized: string) => Record<string, unknown>;
  load: (storage: StorageLike) => { state: Record<string, unknown> | null; recovered: boolean };
  validate: (state: unknown) => boolean;
  BLOCKED_KEYS: Record<string, boolean>;
};

const loadSaveManager = () => loadLegacy<SaveManagerApi>('script/save_manager.js', 'SaveManager');

describe('legacy save boundary', () => {
  it('rotates valid saves and recovers the last known-good backup', () => {
    const manager = loadSaveManager();
    const storage: StorageLike = {};
    manager.save(storage, { version: 1.3, stores: { wood: 10 } });
    manager.save(storage, { version: 1.3, stores: { wood: 20 } });
    expect(JSON.parse(storage.gameStateBackup!)).toMatchObject({ stores: { wood: 10 } });

    storage.gameState = '{broken';
    expect(manager.load(storage)).toMatchObject({
      state: { version: 1.3, stores: { wood: 10 } },
      recovered: true,
    });
  });

  it('rejects invalid imports without replacing current progress', () => {
    const manager = loadSaveManager();
    const storage: StorageLike = { gameState: JSON.stringify({ version: 1.3, stores: { wood: 50 } }) };
    expect(() => manager.importSave(storage, '{invalid')).toThrow();
    expect(JSON.parse(storage.gameState!)).toMatchObject({ stores: { wood: 50 } });
  });

  it('rejects prototype-pollution keys, functions, and non-finite numbers', () => {
    const manager = loadSaveManager();
    expect(manager.validate(JSON.parse('{"stores":{"__proto__":{"polluted":true}}}'))).toBe(false);
    expect(manager.validate({ stores: { wood: Number.POSITIVE_INFINITY } })).toBe(false);
    expect(manager.validate({ callback: () => undefined })).toBe(false);
  });
});

describe('safe state paths', () => {
  it('reads, writes, and removes existing legacy path formats without eval', () => {
    const manager = loadSaveManager();
    const state: Record<string, unknown> = {};
    const stateManager = loadLegacy<{
      set: (path: string, value: unknown, noEvent?: boolean) => number | undefined;
      get: (path: string, requestZero?: boolean) => unknown;
      remove: (path: string, noEvent?: boolean) => void;
    }>('script/state_manager.js', 'StateManager', {
      initialState: state,
      globals: { SaveManager: manager },
    });

    stateManager.set('stores["cured meat"]', 12, true);
    stateManager.set('game.world.map', [[1]], true);
    expect(stateManager.get('stores["cured meat"]')).toBe(12);
    expect(stateManager.get('game.world.map')).toEqual([[1]]);
    stateManager.remove('stores["cured meat"]', true);
    expect(stateManager.get('stores["cured meat"]')).toBeUndefined();
  });

  it('rejects dangerous and malformed paths without polluting prototypes', () => {
    const manager = loadSaveManager();
    const state: Record<string, unknown> = {};
    const stateManager = loadLegacy<{
      set: (path: string, value: unknown, noEvent?: boolean) => number | undefined;
    }>('script/state_manager.js', 'StateManager', {
      initialState: state,
      globals: { SaveManager: manager },
    });

    expect(stateManager.set('stores["__proto__"].polluted', true, true)).toBe(1);
    expect(stateManager.set('stores["wood"]];globalThis.polluted=true', 1, true)).toBe(1);
    expect(stateManager.set('stores..wood', 1, true)).toBe(1);
    expect(stateManager.set('stores.', 1, true)).toBe(1);
    expect(stateManager.set('stores["wood"]evil', 1, true)).toBe(1);
    expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
  });
});
