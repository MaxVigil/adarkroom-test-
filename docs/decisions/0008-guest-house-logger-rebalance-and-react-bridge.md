# ADR 0008: Activate the Guest House, rebalance loggers, and begin the React bridge

- Status: Accepted
- Date: 2026-08-09
- Owner: MaxVigil

## Decision

The Guest House is a playable middle-game building unlocked by the compass. It costs
1000 wood, 100 fur, and 50 leather. One guest may occupy the base room, one may wait
in the persistent FIFO queue, and a second room can raise occupancy to two. Eligible
visits recur every 20–30 minutes and one service may be purchased per visit.

The inherited Master and Scout prices remain unchanged. This preserves their original
resource gates while the Guest House removes only the frustration of losing an offer.
Completed perks are removed from future eligibility.

One caretaker may work in the building. The caretaker shortens the next visit delay by
25% and moves at most two already-owned service resources into a visit reservation
every 10 seconds; no resource is created. Three one-time building upgrades are approved:

| Upgrade | Cost | Effect |
| --- | --- | --- |
| Second guest room | 600 wood, 100 leather | two occupied rooms |
| Guest pantry | 500 wood, 100 leather, 50 cured meat | 10% service discount; caretaker reserves three units per cycle |
| Travellers notice board | 400 wood, 50 leather, 10 scales | 20% shorter visit delay; preview next guest |

Logger output is reduced to two wood per worker every 10 seconds. With two slots this
is 24 wood per minute and frees two workers compared with equivalent gatherers. The
500-wood portion of the hut pays back in about 41.7 minutes.

Iron axes are a one-time Workshop upgrade requiring the Workshop, Logger Hut, and
available iron. They cost 300 wood, 50 leather, and 40 iron, and raise each logger from
two to three wood every 10 seconds. This is an efficiency milestone, not personal
equipment: it has no durability, upkeep, or inventory allocation.

React migration starts as an incremental bridge. A Vite-built React root renders the
speed control through Mantine, reads a cached immutable snapshot from one legacy
adapter, and sends a command back to the existing runtime. Game rules, timers, saves,
and economy remain outside React. Legacy DOM is retired only one tested vertical slice
at a time.

## Balance rationale

- The Guest House guarantees access over time, but construction, long visit intervals,
  queue limits, single-service visits, and unchanged lesson prices preserve scarcity.
- Caretaking spends population and only rearranges owned resources; it cannot bypass
  production chains.
- The pantry discount is capped at 10% in catalog data, while the pure rule has a 50%
  safety ceiling.
- A fully upgraded and staffed Guest House reduces a base visit to 60% of its original
  delay, leaving a 12–18 minute interval rather than instant guest farming.
- Iron axes improve population efficiency without restoring the earlier excessive
  4-to-8 output curve.

## Validation

- typed catalogs validate every building, profession, upgrade, cost, prerequisite,
  service, and stable reference;
- unit tests cover production, payback, discounts, queues, reservations, delays, save
  migration, and the React adapter/component boundary;
- browser tests cover construction, queue persistence, paid lessons, room promotion,
  upgrades, caretaker non-creation, iron-axes crafting, output, and speed persistence;
- the production React bundle is built before browser verification.
