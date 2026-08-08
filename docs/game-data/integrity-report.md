# Inherited baseline integrity report

## Result

The catalog passes schema, uniqueness, reference, source-file, probability, parity,
and representative scenario checks. No inherited runtime file was changed, so the
current playable balance remains intact.

The verified surface includes 22 resources, 13 buildings, 10 professions, 24 items,
38 recipes, 12 weapons, 11 perks, 6 blueprints, 14 world locations, 48 top-level
events, and 274 event scenes.

## Deliberately preserved legacy anomalies

The following findings belong to the inherited implementation and were not silently
fixed during baseline extraction:

1. `Enemies.Executioner.quadruped.loot` declares `alien alloy` twice. JavaScript keeps
   the second declaration, so the catalog and parity boundary preserve the effective
   runtime behavior.
2. One danger-reset condition compares `World.getDistance` as a function object
   instead of calling `World.getDistance()`. This can leave the danger indicator in an
   unintended state.
3. Fabricator maximum checking uses `Math.min(0, storedAmount)`, which prevents the
   stored amount from behaving like the equivalent room crafting check.
4. The trading-section append condition checks the build section's children. This is
   UI logic, not economy data, and remains outside this baseline change.

Each anomaly should receive its own decision or fix with a regression test. Correcting
one here would violate the approved “transfer without rebalance” boundary.

## Remaining migration work

- Apply approved Light Room content as a separate overlay.
- Convert complex scene bodies from legacy handlers only when a declarative event
  model and scene-by-scene regression tests are ready.
- Connect the typed catalog to a replacement simulation runtime after equivalence is
  proven for a playable vertical slice.
