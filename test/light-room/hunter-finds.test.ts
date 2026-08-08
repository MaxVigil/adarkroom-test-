import { describe, expect, it } from 'vitest';
import { lightRoomOverlay, randomFindDelta } from '../../src/light-room/index.js';

const hunterPatch = lightRoomOverlay.professionPatches.find(
  ({ targetProfessionId }) => targetProfessionId === 'profession.hunter',
)!;

describe('Light Room hunter finds', () => {
  it('gives every working hunter independent 10% scale and teeth rolls each cycle', () => {
    expect(hunterPatch).toMatchObject({
      intervalSeconds: 10,
      randomFinds: [
        { resourceId: 'resource.scales', chance: 0.1, amount: 1 },
        { resourceId: 'resource.teeth', chance: 0.1, amount: 1 },
      ],
    });
    const rolls = [0.05, 0.09, 0.11, 0.01];
    expect(randomFindDelta(hunterPatch, 2, () => rolls.shift()!)).toEqual({
      'resource.scales': 1,
      'resource.teeth': 2,
    });
  });

  it('does not find anything on failed rolls or without assigned hunters', () => {
    expect(randomFindDelta(hunterPatch, 0, () => 0)).toEqual({});
    expect(randomFindDelta(hunterPatch, 3, () => 0.5)).toEqual({});
  });
});
