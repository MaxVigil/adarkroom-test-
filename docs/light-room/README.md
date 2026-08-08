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

## Guest House functional core

The Guest House is represented by stable IDs `building.guest-house` and
`profession.guest-caretaker`. The validated domain rules already cover:

- one base room and a maximum of two rooms;
- a persistent FIFO guest queue;
- persistence across save migration and reload;
- the inherited Master's three lessons and the Scout's two services;
- transferring existing settlement supplies into a reservation without creating
  resources;
- a parameterized caretaker effect on the next-visit delay.

The building remains `pending-balance`, so it is not yet shown as a playable build
action. Construction cost, base visit interval, queue capacity, and caretaker reserve
rate require product approval. After approval, those values belong in the catalog;
the legacy adapter may expose them but must not duplicate them.

## Test-build controls

The current playable build offers `x1`, `x2`, `x3`, `x4`, and `x20` speeds. The
selection is saved, applies to active managed game timers, and also rescales active
button cooldowns. Only English and Ukrainian appear in the language menu; unknown
language values fall back to English. The inherited Penrose cross-promotion is not
loaded or registered in the playable event pool.

The footer/menu intentionally omits the inherited GitHub and “get the app” links.
Light Room entity names are localized through the overlay catalog, including
`Хатина лісорубів` in Ukrainian.
