# ADR 0002: Frozen inherited baseline catalog

- Status: Accepted
- Date: 2026-08-08
- Owner: MaxVigil

## Decision

Light Room keeps a machine-readable snapshot of the inherited A Dark Room browser
rules in `src/game-data/`. The snapshot preserves current costs, rates, limits,
combat values, world placement, and other high-impact constants. It does not replace
the running legacy implementation yet.

Every catalog entity and inherited event scene has a stable namespaced ID. Existing
save keys remain recorded as `legacyKey` aliases. Stable IDs cannot be renamed or
reused after publication.

Complex narrative events continue to run through their legacy JavaScript handlers.
They are indexed by stable event and scene IDs now, but conversion to a declarative
event language is a separate migration.

Approved Light Room additions and balance changes must be expressed as an explicit
overlay on this baseline. This keeps extraction errors separate from deliberate game
design decisions.

## Validation boundary

Automated checks compare the catalog with the inherited source for:

- construction formulas;
- profession intervals and resource flows;
- crafting, trading, and fabrication costs;
- combat weapons;
- high-impact room, settlement, path, world, and ship constants;
- top-level event and scene coverage.

Scenario tests reproduce representative settlement, production, expedition, combat,
ship, and save-migration behavior. The legacy interface and runtime remain unchanged,
so this decision introduces no player-facing balance or UI change.

## Consequences

- The inherited catalog is reviewable independently from future Light Room design.
- A source change that drifts from the catalog fails tests.
- A deliberate Light Room balance change must not silently edit the inherited layer.
- Scene internals remain legacy code until a later, separately tested migration.
