/**
 * Validates and persists legacy runtime saves without trusting imported JSON.
 */
var SaveManager = {
  SAVE_KEY: 'gameState',
  BACKUP_KEY: 'gameStateBackup',
  FORMAT_VERSION: 1,
  MAX_SERIALIZED_LENGTH: 5000000,
  MAX_DEPTH: 40,
  MAX_NODES: 200000,
  BLOCKED_KEYS: {
    '__proto__': true,
    'prototype': true,
    'constructor': true
  },

  validate: function(state) {
    var nodes = 0;
    var visit = function(value, depth) {
      nodes++;
      if(nodes > SaveManager.MAX_NODES || depth > SaveManager.MAX_DEPTH) return false;
      if(value === null || typeof value == 'string' || typeof value == 'boolean') return true;
      if(typeof value == 'number') return isFinite(value);
      if(typeof value != 'object') return false;

      if(!Array.isArray(value) && Object.prototype.toString.call(value) != '[object Object]') return false;
      for(var key in value) {
        if(!Object.prototype.hasOwnProperty.call(value, key) || SaveManager.BLOCKED_KEYS[key]) return false;
        if(!visit(value[key], depth + 1)) return false;
      }
      return true;
    };

    return state !== null && typeof state == 'object' && !Array.isArray(state) && visit(state, 0);
  },

  parse: function(serialized) {
    if(typeof serialized != 'string' || serialized.length === 0) throw new Error('save data is empty');
    if(serialized.length > SaveManager.MAX_SERIALIZED_LENGTH) throw new Error('save data is too large');
    var state = JSON.parse(serialized);
    if(!SaveManager.validate(state)) throw new Error('save data has an invalid structure');
    return state;
  },

  load: function(storage) {
    try {
      return { state: SaveManager.parse(storage[SaveManager.SAVE_KEY]), recovered: false };
    } catch(primaryError) {
      try {
        var backup = SaveManager.parse(storage[SaveManager.BACKUP_KEY]);
        storage[SaveManager.SAVE_KEY] = JSON.stringify(backup);
        return { state: backup, recovered: true };
      } catch(backupError) {
        return { state: null, recovered: false, error: primaryError };
      }
    }
  },

  save: function(storage, state) {
    if(!SaveManager.validate(state)) throw new Error('refusing to save an invalid state');
    var current = storage[SaveManager.SAVE_KEY];
    try {
      SaveManager.parse(current);
      storage[SaveManager.BACKUP_KEY] = current;
    } catch(error) {
      // Never replace a valid backup with an invalid current save.
    }
    storage[SaveManager.SAVE_KEY] = JSON.stringify(state);
  },

  importSave: function(storage, serialized) {
    var state = SaveManager.parse(serialized);
    var current = storage[SaveManager.SAVE_KEY];
    try {
      SaveManager.parse(current);
      storage[SaveManager.BACKUP_KEY] = current;
    } catch(error) {
      // Import remains safe even when the current save is already invalid.
    }
    storage[SaveManager.SAVE_KEY] = JSON.stringify(state);
    return state;
  }
};
