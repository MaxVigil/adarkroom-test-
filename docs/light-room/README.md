# Light Room overlay

The Light Room overlay contains approved additions and deliberate changes layered on
top of the frozen A Dark Room browser baseline.

## Source of truth

- `src/game-data/`: inherited baseline; do not edit it to add Light Room content.
- `src/light-room/content.ts`: canonical Light Room entity values.
- `src/light-room/schema.ts`: Zod contracts for new buildings, professions, upgrades,
  localized names, and unlock conditions.
- `src/light-room/index.ts`: resolved catalog and pure rule helpers.
- `script/generated/light_room_content.js`: generated compatibility data; never edit
  manually.
- `script/light_room.js`: thin adapter that makes approved content playable in the
  inherited UI.

Generate and verify with:

```sh
pnpm catalog:generate
pnpm typecheck
pnpm test
pnpm light-room:report
pnpm test:browser
```

## First vertical slice: Logger Hut

| Rule | Approved value |
| --- | --- |
| Stable building ID | `building.logger-hut` |
| Runtime/save key | `logger hut` |
| Unlock | built tannery |
| Cost | 500 wood, 50 fur, 20 leather |
| Maximum | 1 building |
| Profession | `profession.logger` |
| Worker slots | 2 |
| Base output | 4 wood per logger per 10 seconds |
| Iron-axes output | 8 wood per logger per 10 seconds |
| Upkeep | none |

At two workers, the hut produces 8 wood per 10 seconds, or 48 per minute. The
increment over two inherited gatherers is 36 per minute, so the 500-wood part of the
construction cost pays back in about 13.9 minutes. Two loggers replace eight
gatherers at base output and sixteen after iron axes, freeing six or fourteen workers.

## Intentionally unresolved

`upgrade.iron-axes` is catalogued and its approved production modifier is implemented,
but its recipe, price, station, and acquisition interaction have not been approved.
It is therefore not exposed as a craftable action. A compatible save flag can activate
the modifier, which lets the rule and migration be tested without presenting an
invented mechanic to players.

The manual gather button also remains unchanged. Its later hiding or transformation
requires a separate design decision.

The current English and Ukrainian Logger Hut strings are implementation copy for this
vertical slice and should receive a dedicated editorial review before release.
