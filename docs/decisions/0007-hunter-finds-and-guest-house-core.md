# ADR 0007: Add hunter finds and stage the Guest House behind balance approval

- Status: Accepted
- Date: 2026-08-08
- Owner: MaxVigil

> Guest House activation and balance are completed by ADR 0008. The hunter-find
> decision in this document remains current.

## Decision

The inherited hunter profession receives a Light Room overlay patch. Every working
hunter independently has a 10% chance to find one scale and a separate 10% chance to
find one tooth on every 10-second hunter income cycle. Because the rolls are
independent, one hunter may find both resources during one cycle.

Random-find values live in the typed overlay catalog. A pure calculation accepts an
injected random source for deterministic tests; the legacy adapter performs the same
calculation during normal income collection and displays the probabilities in the
worker tooltip.

The approved functional model for the Guest House and caretaker is implemented in the
domain layer before activation in the legacy runtime. It includes stable IDs, unlock
references, rooms, a persistent FIFO queue, inherited Master and Scout offers,
resource reservation, caretaker effects, save compatibility, and validation.

## Pending activation boundary

The Guest House remains `pending-balance` and is not exposed to players yet. Its
construction cost, visit interval, queue capacity, and caretaker reserve rate have not
been approved. Introducing placeholder values into the playable economy would turn an
implementation guess into an accidental design decision.

Activation requires:

1. approving the four missing tuning values;
2. recording them in the typed catalog;
3. generating the legacy runtime data;
4. adapting Master and Scout arrival events to the persistent guest state machine;
5. adding browser scenarios for arrival, reload, lesson/service completion, queue
   promotion, and caretaker behavior.

## Supporting interface changes

The inherited GitHub and “get the app” entries are removed from the bottom menu.
Light Room building names are resolved through localized overlay data, which fixes the
Ukrainian Logger Hut row without adding its internal runtime key to the inherited
translation dictionary.

## Validation

- unit tests cover independent hunter rolls for multiple workers;
- Playwright proves that bonus resources enter stores through the normal income path;
- domain tests cover guest arrival, FIFO promotion, offers, reservations, caretaker
  delay calculation, and save round-trips;
- browser tests confirm the cleaned menu and Ukrainian Logger Hut display name.
