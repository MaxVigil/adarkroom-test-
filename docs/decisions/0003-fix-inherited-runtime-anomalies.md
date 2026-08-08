# ADR 0003: Fix four inherited runtime anomalies

- Status: Accepted
- Date: 2026-08-08
- Owner: MaxVigil

## Decision

Four confirmed defects in the inherited A Dark Room runtime are fixed before Light
Room content overlays are introduced.

1. The Executioner quadruped now grants one guaranteed `alien alloy` and retains its
   independent 20% bonus roll. Under the inherited loot-range calculation, the bonus
   produces two or three additional units.
2. The danger-state reset calls `World.getDistance()` instead of comparing the
   function object with a number.
3. Fabricator maximum checks use the actual non-negative stored amount. Items capped
   at one cannot be fabricated again through a stale or direct action.
4. The trading section checks its own button collection before being attached to the
   room UI.

## Balance boundary

Only the quadruped fix deliberately changes rewards. Its previous duplicate object
key caused JavaScript to discard the guaranteed drop, leaving only a 20% chance of
two or three units. The approved behavior restores the apparent two-part design:
one guaranteed unit plus the independent bonus chance.

The global inherited loot formula treats `max` as an exclusive upper bound. That
broader behavior is not changed by this decision because doing so would alter every
loot table in the game.

## Validation

Regression tests cover both quadruped outcomes, danger reset with iron armour,
Fabricator capped and uncapped items, and the trading-section condition. Existing
catalog parity and baseline scenarios remain in place.
