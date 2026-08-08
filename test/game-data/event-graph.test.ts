import { describe, expect, it } from 'vitest';
import { eventSeeds } from '../../src/game-data/events.js';
import { loadLegacy } from './legacy-loader.js';

interface LegacyEvent { scenes?: Record<string, unknown> }

function visit(value: unknown, callback: (key: string, value: unknown) => void): void {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    callback(key, child);
    visit(child, callback);
  }
}

describe('inherited event graph', () => {
  it('has no dangling scene or event transitions and valid probability branches', () => {
    const executioner = loadLegacy<Record<string, unknown>>('script/events/executioner.js', 'Events.Executioner');
    const setpieces = loadLegacy<Record<string, unknown>>('script/events/setpieces.js', 'Events.Setpieces');
    const validNextEvents = new Set([...Object.keys(executioner), ...Object.keys(setpieces)]);

    for (const [eventId, legacyRef, sourceFile] of eventSeeds) {
      const event = loadLegacy<LegacyEvent>(sourceFile, legacyRef);
      const sceneKeys = new Set(Object.keys(event.scenes ?? {}));
      for (const [sceneKey, scene] of Object.entries(event.scenes ?? {})) {
        visit(scene, (key, target) => {
          if (key === 'nextScene') {
            if (typeof target === 'string') {
              expect(target === 'end' || sceneKeys.has(target), `${eventId}/${sceneKey} -> ${target}`).toBe(true);
            } else {
              expect(target && typeof target === 'object', `${eventId}/${sceneKey} has an invalid nextScene`).toBeTruthy();
              const thresholds = Object.keys(target as object).map(Number).sort((a, b) => a - b);
              expect(thresholds.every((value) => Number.isFinite(value) && value > 0 && value <= 1), `${eventId}/${sceneKey} thresholds`).toBe(true);
              expect(thresholds.every((value, index) => index === 0 || value > thresholds[index - 1]!), `${eventId}/${sceneKey} threshold order`).toBe(true);
              expect(thresholds.at(-1), `${eventId}/${sceneKey} terminal threshold`).toBe(1);
              for (const destination of Object.values(target as object)) {
                expect(typeof destination === 'string' && (destination === 'end' || sceneKeys.has(destination)), `${eventId}/${sceneKey} -> ${String(destination)}`).toBe(true);
              }
            }
          }
          if (key === 'nextEvent') {
            expect(typeof target === 'string' && validNextEvents.has(target), `${eventId}/${sceneKey} -> event ${String(target)}`).toBe(true);
          }
        });
      }
    }
  });
});
