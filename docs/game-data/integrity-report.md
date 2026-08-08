# Inherited baseline integrity report

## Result

The catalog passes schema, uniqueness, reference, source-file, probability, parity,
event-graph, and representative scenario checks. The approved runtime hardening does
not alter inherited economy or combat values.

The verified surface includes 22 resources, 13 buildings, 10 professions, 25 items,
38 recipes, 12 weapons, 11 perks, 6 blueprints, 14 world locations, 48 top-level
events, 274 event scenes, 47 enemies, 90 combat encounters, and 146 loot tables. Loot
minimums, exclusive maximums, chances, and bonus rolls match the inherited source.

## Resolved inherited anomalies

After the baseline was frozen, the following fixes were approved and added as a
separate, tested runtime change:

1. The Executioner quadruped grants one guaranteed `alien alloy` and has an
   independent 20% chance of two or three additional units.
2. The danger-reset condition correctly calls `World.getDistance()`.
3. Fabricator maximum checks use the actual non-negative stored amount.
4. The trading section checks its own children before being shown.

These changes are recorded in ADR 0003 and covered by four focused regression tests.
The broader max-exclusive legacy loot-range behavior remains unchanged.

## Final preparation hardening

- Save load, write, backup recovery, and import now share one structural validator.
- A valid previous save is retained as a local backup; a corrupt primary save is
  restored automatically and reported to the player.
- Invalid or executable values, non-finite numbers, excessive nesting, and prototype
  pollution keys are rejected.
- State-manager paths are tokenized and traversed without `eval`.
- All inherited event transitions are checked for dangling scene/event targets and
  complete probability tables.
- Four Chromium smoke tests cover real page startup and critical persistence/UI paths.

The final verification suite contains 27 passing catalog/runtime tests and 4 passing
browser smoke tests. `pnpm audit --audit-level moderate` reports no known dependency
vulnerabilities.

## Remaining migration work

- Apply approved Light Room content as a separate overlay.
- Convert complex scene bodies from legacy handlers only when a declarative event
  model and scene-by-scene regression tests are ready.
- Connect the typed catalog to a replacement simulation runtime after equivalence is
  proven for a playable vertical slice.
