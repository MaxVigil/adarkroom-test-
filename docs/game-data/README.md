# Light Room game-data baseline

This directory documents the frozen A Dark Room browser baseline used as the starting
point for Light Room. The running legacy game is unchanged; the new catalog is a
validated specification and migration boundary.

## Catalog coverage

| Area | Count | Canonical file |
| --- | ---: | --- |
| Resources | 22 | `src/game-data/resources.ts` |
| Buildings | 13 | `src/game-data/settlement.ts` |
| Professions | 10 | `src/game-data/settlement.ts` |
| Items and upgrades | 25 | `src/game-data/items.ts` |
| Recipes and trades | 38 | `src/game-data/items.ts` |
| Weapons | 12 | `src/game-data/items.ts` |
| Perks | 11 | `src/game-data/progression.ts` |
| Blueprints | 6 | `src/game-data/items.ts` |
| World locations | 14 | `src/game-data/world.ts` |
| Top-level events | 48 | `src/game-data/events.ts` |
| Event scenes | 274 | `src/game-data/generated/scenes.ts` |
| Enemies | 47 | `src/game-data/generated/combat.ts` |
| Combat encounters | 90 | `src/game-data/generated/combat.ts` |
| Loot tables | 146 | `src/game-data/generated/combat.ts` |

## Stable ID rules

IDs are lowercase and namespaced, for example `resource.cured-meat`,
`building.trading-post`, `profession.iron-miner`, and
`scene.executioner.intro.start`.

An ID represents identity, not displayed wording. It must not change when a name or
translation changes. The old JavaScript key remains in `legacyKey`, allowing save
migration and source comparison without exposing inherited wording as architecture.

Generated scene IDs combine the stable event ID with the inherited scene key. Scene
logic still uses the legacy handler recorded on its parent event.

## Validation and scenarios

Run:

```sh
pnpm typecheck
pnpm test
pnpm test:browser
pnpm catalog:report
```

The tests check schemas, duplicate IDs, references, source files, probabilities,
legacy parity, event coverage, a complete event-transition graph, and representative
scenarios. The scenarios cover:

- traps, carts, huts, and the original 80-person settlement limit;
- worker output over fixed time;
- mine → metal → steel → bullet production;
- crafting, trading, and fabrication;
- expedition capacity, food, water, and armour;
- combat perks and weapon values;
- ship upgrades;
- migration of representative legacy save keys.

Four focused regression scenarios also protect the approved inherited-runtime fixes:
the Executioner quadruped reward, danger-state reset, Fabricator maximums, and the
trading-section visibility condition. See ADR 0003 for the exact behavior boundary.

Four Playwright smoke tests additionally load the actual game page, perform a
save/reload round trip, recover a damaged primary save from backup, and exercise the
trading and Fabricator regressions in Chromium.

## Save boundary

The legacy runtime now validates saves before loading, importing, or writing them.
It records `saveFormatVersion: 1`, rotates the last valid primary save into a backup,
and restores that backup when the current save is damaged. Invalid imports do not
replace current progress. State paths are parsed as property paths and never executed
as JavaScript.

## Adding Light Room content

Do not edit the inherited baseline to add the Logger's Hut, Laboratory, Guest House,
their professions, or the approved population extensions. Those belong in a separate
Light Room overlay. Tests for that overlay should state the intended difference from
the baseline explicitly.

The first overlay now lives in `src/light-room/`. Its resolved catalog composes new
entities with this baseline without modifying inherited arrays. See
`docs/light-room/README.md` for its rules and current coverage.

When a legacy event source changes, regenerate the scene, combat, enemy, and loot
inventories:

```sh
pnpm catalog:generate
```
