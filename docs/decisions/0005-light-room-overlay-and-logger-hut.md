# ADR 0005: Start the Light Room overlay with the Logger Hut

- Status: Accepted
- Date: 2026-08-08
- Owner: MaxVigil

## Decision

Approved Light Room additions are stored in a separate, validated overlay under
`src/light-room/`. The inherited arrays under `src/game-data/` remain unchanged. A
resolved catalog composes both layers for validation, simulation, save migration, and
future UI work.

The first playable vertical slice adds:

- `building.logger-hut`, unlocked after the tannery, costing 500 wood, 50 fur, and
  20 leather, with a maximum of one;
- `profession.logger`, limited to two workers and producing 4 wood per worker every
  10 seconds without upkeep;
- `upgrade.iron-axes`, whose approved modifier raises output to 8 wood per worker
  every 10 seconds.

The current inherited UI consumes generated compatibility data. Generic prerequisite,
worker-cap, and income-modifier hooks are added to the legacy runtime so future overlay
entities do not require duplicated hard-coded values.

## Open boundary

The price, recipe, station, and acquisition interaction for iron axes are not yet
approved. The upgrade remains catalogued with `acquisitionStatus: pending-design` and
is not shown as a craftable. The manual wood-gathering button is also unchanged until
its transition point is approved.

## Validation

- overlay IDs and references are validated together with the inherited catalog;
- economic tests cover construction cost, prerequisite, worker capacity, base and
  upgraded output, payback time, and population impact;
- save tests cover old saves and new building/worker/upgrade aliases;
- Playwright builds the hut, assigns workers up to the cap, checks income, reloads the
  save, and confirms the unapproved iron-axes recipe is not exposed.
