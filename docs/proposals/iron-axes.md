# Proposal: Iron Axes acquisition

- Status: Accepted and implemented
- Date: 2026-08-08
- Accepted: 2026-08-09

## Recommended model

Make `upgrade.iron-axes` a one-time settlement upgrade crafted in the Workshop. It is
not personal expedition equipment, does not consume an inventory slot, and has no
durability or upkeep. Once acquired, it automatically applies to every logger and
raises output from 2 to 3 wood per logger every 10 seconds. This replaces the earlier
4-to-8 proposal, which was too strong for a two-worker building.

Recommended prerequisites:

- one Logger Hut;
- one Workshop;
- iron has been discovered and is present in settlement stores.

Recommended one-time cost:

| Resource | Amount |
| --- | ---: |
| wood | 300 |
| leather | 50 |
| iron | 40 |

The cost deliberately includes handles and protective fittings, makes leather remain
relevant, and places the upgrade after access to iron without introducing a new
consumable axe item. Two equipped loggers add 12 wood per minute over the unupgraded
hut. Compared with two gatherers, the combined 800-wood investment pays back in about
33.3 minutes; iron remains the real progression gate.

## Player-facing behavior

- Reveal the upgrade in the Workshop only when all prerequisites are met.
- Show the exact effect before purchase: `Лісоруби: 2 → 3 деревини / 10 с` per worker.
- After purchase, mark it as completed rather than leaving a disabled repeatable
  recipe.
- Repeat the active modifier in the Logger Hut worker tooltip.
- Save only stable ID `upgrade.iron-axes`; keep `iron axes` as a compatibility alias.

## Rejected for the first version

- individual axes per worker, because this adds equipment allocation without a useful
  decision while the hut has only two slots;
- durability, because it turns an efficiency milestone into recurring maintenance;
- a separate forge requirement, because the inherited Workshop already provides a
  clear production location and avoids adding a building only to unlock one recipe.

The prerequisites, price, and one-time Workshop interaction are now approved.
