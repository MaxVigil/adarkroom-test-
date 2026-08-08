# Inherited baseline integrity report

## Result

The catalog passes schema, uniqueness, reference, source-file, probability, parity,
and representative scenario checks. No inherited runtime file was changed, so the
current playable balance remains intact.

The verified surface includes 22 resources, 13 buildings, 10 professions, 24 items,
38 recipes, 12 weapons, 11 perks, 6 blueprints, 14 world locations, 48 top-level
events, and 274 event scenes.

## Resolved inherited anomalies

After the baseline was frozen, the following fixes were approved and added as a
separate, tested runtime change:

1. The Executioner quadruped grants one guaranteed `alien alloy` and has an
   independent 20% chance of two or three additional units.
2. The danger-reset condition correctly calls `World.getDistance()`.
3. Fabricator maximum checks use the actual non-negative stored amount.
4. The trading section checks its own children before being shown.

These changes are recorded in ADR 0003 and covered by four focused regression tests.
The complete suite now contains 20 passing tests. The broader max-exclusive legacy
loot-range behavior remains unchanged.

## Remaining migration work

- Apply approved Light Room content as a separate overlay.
- Convert complex scene bodies from legacy handlers only when a declarative event
  model and scene-by-scene regression tests are ready.
- Connect the typed catalog to a replacement simulation runtime after equivalence is
  proven for a playable vertical slice.
