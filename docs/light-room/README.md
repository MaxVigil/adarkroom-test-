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
| Base output | 2 wood per logger per 10 seconds |
| Iron-axes output | 3 wood per logger per 10 seconds |
| Upkeep | none |

At two workers, the hut produces 4 wood per 10 seconds, or 24 per minute. The
increment over two inherited gatherers is 12 per minute, so the 500-wood part of the
construction cost pays back in about 41.7 minutes. Two loggers replace four gatherers
at base output and six after iron axes, freeing two or four workers.

## Iron axes

`upgrade.iron-axes` is an approved one-time Workshop upgrade. It requires the Workshop,
the Logger Hut, and available iron; it costs 300 wood, 50 leather, and 40 iron. The
upgrade raises output from two to three wood per logger per 10 seconds. The combined
800-wood investment pays back in about 33.3 minutes versus two gatherers.

The manual gather button also remains unchanged. Its later hiding or transformation
requires a separate design decision.

The current English and Ukrainian Logger Hut strings are implementation copy for this
vertical slice and should receive a dedicated editorial review before release.

## Hunter finds

The inherited hunter profession has one deliberate Light Room patch. Every working
hunter rolls two independent chances on each 10-second production cycle:

| Find | Chance per hunter | Amount on success |
| --- | ---: | ---: |
| scales | 10% | 1 |
| teeth | 10% | 1 |

Both finds may succeed during the same cycle. With `n` hunters, the game performs `n`
rolls for scales and `n` separate rolls for teeth. The normal income collector applies
the result, so speed changes affect the cycle consistently with other professions.

## Guest House

The playable Guest House uses stable IDs `building.guest-house` and
`profession.guest-caretaker`:

- unlock: compass; construction: 1000 wood, 100 fur, 50 leather;
- one base room, a maximum of two rooms, and one persistent FIFO queue slot;
- eligible visits every 20–30 minutes, with one paid service per visit;
- the inherited Master's three lessons and Scout's two services at inherited prices;
- one caretaker who reduces the visit delay by 25% and reserves two owned units per
  10-second cycle without creating resources;
- second room (600 wood, 100 leather), pantry (500 wood, 100 leather, 50 cured meat),
  and notice board (400 wood, 50 leather, 10 scales) upgrades;
- a 10% pantry service discount, three-unit upgraded reservation rate, 20% notice-board
  visit reduction, and next-guest preview.

The combined caretaker and notice-board reduction leaves a 12–18 minute visit window.
Rooms, queue, waiting guest, reservations, next visit, and next-guest preview persist
through saves. The Guest House disables the duplicate inherited random Master and
Scout arrivals once it owns their scheduling.

## React migration: first slice

Vite now builds a production React bundle beside the legacy runtime. The speed control
is the first migrated surface: Mantine renders it, `useSyncExternalStore` reads one
cached immutable snapshot, and a narrow adapter dispatches the existing speed-menu
command. Economy, timers, and saves remain in the game runtime. `pnpm verify` generates
catalogs, builds React, checks types, runs unit tests, and runs browser journeys.

## Test-build controls

The current playable build offers `x1`, `x2`, `x3`, `x4`, and `x20` speeds. The
selection is saved, applies to active managed game timers, and also rescales active
button cooldowns. Only English and Ukrainian appear in the language menu; unknown
language values fall back to English. The inherited Penrose cross-promotion is not
loaded or registered in the playable event pool.

The footer/menu intentionally omits the inherited GitHub and “get the app” links.
Light Room entity names are localized through the overlay catalog, including
`Хатина лісорубів` in Ukrainian.
